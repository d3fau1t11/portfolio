## Challenge Summary
- **Binary:** `checker` — Linux x86-64, statically linked, stripped ELF
- **Goal:** Find an input that the binary accepts
- **Flag format:** `tibeb{...}`

---

## Step 1 — Basic Recon

```bash
file checker bundle.zip run.txt
cat run.txt
chmod +x checker && ./checker
```

`run.txt` says:
```
Linux x86-64 static ELF. chmod +x checker; ./checker
```

Running with `test` gives:
```
Locked.
```

So the binary is a password checker. A wrong input prints `Locked.`

Look for interesting strings:

```bash
strings -a -t x checker | grep -E 'Locked|TIBEB_XOR_V1'
```

Output:
```
  77013 Locked.
  a30e0 TIBEB_XOR_V1$
```

Two key addresses:
- `0x477013` → `"Locked."`
- `0x4a40e0` → `"TIBEB_XOR_V1$"`

---

## Step 2 — Find and Disassemble `main`

The binary is stripped, so we need to locate `main` manually.

```bash
readelf -h checker | grep -iE 'entry|type'
```

Output:
```
Type: EXEC
Entry point address: 0x401660
```

Disassemble the entry point:

```bash
objdump -d -M intel --start-address=0x401660 --stop-address=0x401700 checker
```

Important instruction:
```
401674: mov rdi,0x401785
40167b: call 0x403df0   ; __libc_start_main
```

So `main` is at `0x401785`.

Disassemble `main`:

```bash
objdump -d -M intel --start-address=0x401785 --stop-address=0x401900 checker
```

Key parts of the disassembly:

```asm
401785: push rbp
...
4017a6: call 0x404920        ; fgets(buffer, 256, stdin)
...
4017ce: call 0x4010a8        ; strcspn(buffer, "\n")
4017d3: mov BYTE PTR [rbp+rax*1-0x110],0x0   ; strip newline
...
4017db: movzx eax,BYTE PTR [rip+0xa290a]    # 0x4a40ec
4017e2: movzx eax,al
4017e5: movzx edx,BYTE PTR [rip+0xa2901]    # 0x4a40ed
...
401812: mov DWORD PTR [rbp-0x8],eax         ; length
...
40181f: call 0x4010b8                        ; strlen(buffer)
401824: mov rdx,rax
401827: mov eax,DWORD PTR [rbp-0x8]          ; expected length
40182a: cmp rdx,rax
40182d: je 0x401845
40182f: lea rax,[rip+0x757dd]                # 0x477013 "Locked."
...
401845: mov DWORD PTR [rbp-0x4],0x0          ; i = 0
40184c: jmp 0x401891
40184e: mov eax,DWORD PTR [rbp-0x4]          ; i
401851: movzx eax,BYTE PTR [rbp+rax*1-0x110] ; input[i]
401859: xor eax,0x6d                         ; input[i] ^ 0x6d
40185c: mov BYTE PTR [rbp-0x9],al
40185f: mov eax,DWORD PTR [rbp-0x4]
401862: add eax,0x10                         ; i + 16
401865: mov edx,eax
401867: lea rax,[rip+0xa2872]                # 0x4a40e0
40186e: movzx eax,BYTE PTR [rdx+rax*1]       ; target[i] at 0x4a40e0 + i + 16 = 0x4a40f0 + i
401872: cmp BYTE PTR [rbp-0x9],al
401875: je 0x40188d
401877: lea rax,[rip+0x75795]                # 0x477013 "Locked."
...
40188d: add DWORD PTR [rbp-0x4],1
401891: mov eax,DWORD PTR [rbp-0x4]
401894: cmp eax,DWORD PTR [rbp-0x8]          ; i < length
401897: jb 0x40184e
```

**Logic summary:**
1. Read input, strip newline.
2. Expected length is loaded from bytes at `0x4a40ec`–`0x4a40ef`.
3. If input length ≠ expected length → print `Locked.`
4. For each `i` from `0` to `length-1`:
   - `temp = input[i] ^ 0x6d`
   - Compare `temp` with `target[i]` where `target` starts at `0x4a40f0`.
   - If mismatch → print `Locked.`
5. If all match → success.

---

## Step 3 — Extract the Expected Length

Dump the data section:

```bash
objdump -s -j .data checker | head -n 40
```

Relevant bytes at `0x4a40e0`:
```
4a40e0 54494245 425f584f 525f5631 24000000  TIBEB_XOR_V1$...
4a40f0 19040f08 0f161502 1f320a0c 19083208  .........2....2.
4a4100 55085f5d 5a5c5c5e 0b0b550c 545f0c5d  U._]Z\\^..U.T_.]
4a4110 0b5f5a10 00000000 00080000 00000000  ._Z.............
```

At `0x4a40ec`, the bytes are:
```
24 00 00 00
```
Little-endian `0x00000024` = `36`.

So the input must be exactly **36 characters**.

---

## Step 4 — Extract Target Bytes and XOR

The target array starts at `0x4a40f0`. It is 36 bytes long:

```
19 04 0f 08 0f 16 15 02 1f 32 0a 0c 19 08 32 08
55 08 5f 5d 5a 5c 5c 5e 0b 0b 55 0c 54 5f 0c 5d
0b 5f 5a 10
```

The check is:
```
input[i] ^ 0x6d == target[i]
```

Therefore:
```
input[i] = target[i] ^ 0x6d
```

Compute the flag with Python:

```python
target = bytes.fromhex(
    "19040f080f1615021f320a0c19083208"
    "55085f5d5a5c5c5e0b0b550c545f0c5d"
    "0b5f5a10"
)
flag = bytes(b ^ 0x6d for b in target).decode()
print(flag)
```

Output:

```
tibeb{xor_gate_e8e207113ff8a92a0f27}
```

---

## Step 5 — Verify

Run the checker and paste the flag:

```bash
./checker
tibeb{xor_gate_e8e207113ff8a92a0f27}
```

It should print the success message (e.g. `Unlocked.` or similar) instead of `Locked.`

---

## Tricky / Interesting Points

1. **Stripped static binary** — No symbols like `main`. You must find `main` by looking at the entry point and the argument passed to `__libc_start_main`.
2. **Obfuscated length check** — The expected length is not an immediate constant. It is read from the data section at `0x4a40ec` as a 4-byte little-endian integer. Those bytes happen to be `24 00 00 00`, which is the ASCII code for `'$'` (0x24 = 36). This is easy to miss.
3. **Target array hidden next to magic string** — The string `TIBEB_XOR_V1$` sits at `0x4a40e0`. The target bytes start 16 bytes later at `0x4a40f0`. The disassembly uses `0x4a40e0 + i + 0x10`, so it’s not immediately obvious that the target is separate.
4. **XOR key embedded in instruction** — The key `0x6d` appears only as `xor eax,0x6d` in the loop.
5. **Newline stripping** — The binary uses `strcspn(buffer, "\n")` to remove the trailing newline, so your input length must be 36 *after* stripping.
---

## Final Flag

```
tibeb{xor_gate_e8e207113ff8a92a0f27}
```
