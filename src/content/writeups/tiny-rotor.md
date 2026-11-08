## 1. Initial Recon

We are given a `bundle.zip` containing:

- `checker` — a static, stripped x86-64 ELF
- `run.txt` — instructions

```bash
$ file checker run.txt bundle.zip
checker:    ELF 64-bit LSB executable, x86-64, statically linked, stripped
run.txt:    ASCII text
bundle.zip: Zip archive data
```

```bash
$ cat run.txt
Linux x86-64 static ELF. chmod +x checker; ./checker
```

Running the checker with dummy input:

```bash
$ chmod +x checker && echo "test" | ./checker
Locked.
```

The binary expects some input and prints `Locked.` or `Unlocked.`

---

## 2. Finding the Check Logic

Since the binary is stripped, we look for strings:

```bash
$ strings -t x checker | grep -E "Locked|Unlocked|TIBEB|tibeb"
  77013 Locked.
  7701b Unlocked.
  a30e0 TIBEB_ROTOR1!
```

The string `TIBEB_ROTOR1!` is at file offset `0xa30e0`. In the `.data` section it lands at virtual address `0x4a40e0`.

We find references to these strings in the disassembly:

```bash
$ objdump -d checker | grep -E "77013|7701b|4a40e0"
  40182f: lea 0x757dd(%rip),%rax   # 0x477013  (Locked.)
  4018a2: lea 0x7576a(%rip),%rax   # 0x477013  (Locked.)
  4018c4: lea 0x75750(%rip),%rax   # 0x47701b  (Unlocked.)
  401892: lea 0xa2847(%rip),%rax   # 0x4a40e0  (TIBEB_ROTOR1!)
```

The main check function starts at `0x401785`. Disassembling it:

```bash
$ objdump -d checker --start-address=0x401785 --stop-address=0x4018d9
```

The important part is the loop at `0x401851`:

```asm
401851: mov    -0x4(%rbp),%eax          ; i
401854: movzbl -0x110(%rbp,%rax,1),%eax ; input[i]
40185c: mov    %eax,%ecx
40185e: mov    -0x4(%rbp),%eax          ; i
401861: mov    %eax,%edx
401863: mov    %edx,%eax
401865: shl    $0x3,%eax                ; i*8
401868: sub    %edx,%eax                ; i*8 - i = i*7
40186a: add    %ecx,%eax                ; input[i] + i*7
40186c: mov    %al,-0x9(%rbp)           ; t = (input[i] + i*7) & 0xff
40186f: movzbl -0x9(%rbp),%eax
401873: lea    0x0(,%rax,8),%edx        ; t << 3
40187a: movzbl -0x9(%rbp),%eax
40187e: shr    $0x5,%al                 ; t >> 5
401881: or     %edx,%eax                ; (t << 3) | (t >> 5) = rol3(t)
401883: mov    %al,-0x9(%rbp)
401886: xorb   $0xa7,-0x9(%rbp)         ; ^ 0xa7
40188a: mov    -0x4(%rbp),%eax          ; i
40188d: add    $0x10,%eax               ; i + 0x10
401890: mov    %eax,%edx
401892: lea    0xa2847(%rip),%rax       ; 0x4a40e0 (base)
401899: movzbl (%rdx,%rax,1),%eax       ; target[i] at 0x4a40f0 + i
40189d: cmp    %al,-0x9(%rbp)
4018a0: je     0x4018b8                 ; if equal, continue
```

So the check is:

```c
for (i = 0; i < len; i++) {
    t = (input[i] + i*7) & 0xff;
    t = ((t << 3) | (t >> 5)) & 0xff;   // rol3
    t ^= 0xa7;
    if (t != target[i]) fail();
}
```

The length `len` is read from `0x4a40ec` as a 32-bit little-endian value.

---

## 3. Extracting Data

Dump the `.data` section around `0x4a40e0`:

```bash
$ objdump -s -j .data checker | grep -A5 "4a40e0"
 4a40e0 54494245 425f524f 544f5231 21000000  TIBEB_ROTOR1!...
 4a40f0 04242474 545343a2 c2d262c2 8b4a0373  .$$tTSC...b..J.s
 4a4100 3161a098 a118f987 ffa8f000 8e8766ff  1a............f.
 4a4110 4d000000 00000000 ...
```

Interpretation:

- `0x4a40e0` starts the string `TIBEB_ROTOR1!`.
- `0x4a40ec` is the byte `0x21` (ASCII `!`) followed by three null bytes → length = `0x00000021` = **33**.
- `0x4a40f0` begins the target array of 33 bytes:

```
04 24 24 74 54 53 43 a2 c2 d2 62 c2 8b 4a 03 73
31 61 a0 98 a1 18 f9 87 ff a8 f0 00 8e 87 66 ff 4d
```

---

## 4. Reversing the Transformation

We have:

```
target[i] = rol3( (input[i] + i*7) & 0xff ) ^ 0xa7
```

To invert:

1. `t = target[i] ^ 0xa7`
2. Reverse the rotation: `x = ror3(t) = ((t >> 3) | (t << 5)) & 0xff`
3. `input[i] = (x - i*7) & 0xff`

Python script:

```python
target = [
    0x04,0x24,0x24,0x74,0x54,0x53,0x43,0xa2,0xc2,0xd2,0x62,0xc2,
    0x8b,0x4a,0x03,0x73,0x31,0x61,0xa0,0x98,0xa1,0x18,0xf9,0x87,
    0xff,0xa8,0xf0,0x00,0x8e,0x87,0x66,0xff,0x4d
]

flag = []
for i, b in enumerate(target):
    t = b ^ 0xa7
    x = ((t >> 3) | (t << 5)) & 0xff
    c = (x - i*7) & 0xff
    flag.append(c)

print(bytes(flag).decode())
```

Output:

```
tibeb{rotor_1b21babb4d1cc247a9f2}
```

---

## 5. Verification

```bash
$ echo "tibeb{rotor_1b21babb4d1cc247a9f2}" | ./checker
Unlocked.
```

Flag confirmed.

---

## 6. Interesting / Tricky Details

- **The string `TIBEB_ROTOR1!` is not a decoy.**  
  Its last character `!` (0x21) is actually the length byte (33), followed by three null bytes. Then the target array starts immediately after at `0x4a40f0`. This is a clever way to hide the length in plain sight.

- **Rotation clue:** The challenge name “Tiny Rotor” and the description “Each position in this checker rotates bits before comparing” directly point to the `rol3` operation. The rotation is by 3 bits to the left, combined with XOR `0xa7` and an index‑dependent addition `i*7`.

- **Static, stripped binary:** Reversing is still straightforward once the loop is located. The use of RIP‑relative addressing (`lea`) makes it easy to spot the data references.

---

## 7. Final Flag

```
tibeb{rotor_1b21babb4d1cc247a9f2}
```
