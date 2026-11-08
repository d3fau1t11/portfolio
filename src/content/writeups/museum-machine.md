## Challenge Overview

We are given a tiny custom VM called **MVM1**. It reads a secret input, runs it through a bytecode program, and either prints `unlocked` or exits with `locked`.

Files provided:

```text
bundle.zip
isa.txt
program.mvm
vm.py
```

The goal is to recover the accepted input, which has the flag format:

```text
tibeb{...}
```

---

## 1. Inspect the ISA

`isa.txt` gives the instruction set:

```text
MVM1 + uint16_le input length.
Instructions: 10 LOAD, 20 XOR, 30 ADD, 40 ROL8, 50 CHECK; each followed by one unsigned byte.
FF HALT.
```

So the program format is:

- `4D 56 4D 31` → magic `MVM1`
- `uint16_le` → expected input length
- Then a sequence of 2-byte instructions:
  - `0x10` LOAD, arg = index into input
  - `0x20` XOR, arg = immediate byte
  - `0x30` ADD, arg = immediate byte
  - `0x40` ROL8, arg = rotation amount
  - `0x50` CHECK, arg = expected accumulator value
  - `0xFF` HALT

---

## 2. Inspect the VM

`vm.py` is short and clear:

```python
import struct, sys
from pathlib import Path

p = Path(__file__).with_name("program.mvm").read_bytes()
n = struct.unpack_from("<H", p, 4)[0]
text = input("Secret: ").encode()
if len(text) != n:
    raise SystemExit("locked")

i, acc = 6, 0
while p[i] != 255:
    op, arg = p[i:i+2]
    i += 2
    if op == 0x10:
        acc = text[arg]
    elif op == 0x20:
        acc ^= arg
    elif op == 0x30:
        acc = (acc + arg) & 255
    elif op == 0x40:
        acc = ((acc << arg) | (acc >> (8-arg))) & 255
    elif op == 0x50:
        if acc != arg:
            raise SystemExit("locked")
    else:
        raise SystemExit("bad opcode")

print("unlocked")
```

Key observations:

- The input length is read from offset `4` as a little-endian `uint16`.
- The program starts at offset `6`.
- Each check is independent: it loads one byte of the input, transforms the accumulator, then compares it to a constant.
- If all checks pass, the program prints `unlocked`.

---

## 3. Dump the Program

We can inspect the raw bytes:

```bash
xxd -g1 program.mvm
```

Output includes the header:

```text
00000000: 4d 56 4d 31 24 00 10 06 20 7d 30 c7 40 07 50 73  MVM1$... }0.@.Ps
```

- Magic: `MVM1`
- Length: `0x0024` = 36
- First instruction: `10 06` → LOAD index 6

So the secret is 36 bytes long.

---

## 4. Parse the Instructions

We can write a small parser to print every instruction:

```python
from pathlib import Path
import struct

p = Path("program.mvm").read_bytes()
n = struct.unpack_from("<H", p, 4)[0]
print("secret length =", n)

i = 6
ops = {0x10:"LOAD", 0x20:"XOR", 0x30:"ADD", 0x40:"ROL8", 0x50:"CHECK", 0xff:"HALT"}

while i < len(p):
    op = p[i]
    if op == 0xff:
        print(f"{i:04x}: HALT")
        break
    arg = p[i+1]
    print(f"{i:04x}: {op:02x} {ops.get(op, hex(op)):<5} {arg}")
    i += 2
```

The parsed program shows a repeating pattern:

```text
LOAD index
XOR  xor_value
ADD  add_value
ROL8 rol_value
CHECK check_value
```

This pattern repeats 36 times, once for each input byte.

---

## 5. Understand the Transformation

For each input byte `x = text[index]`, the VM computes:

```text
acc = x
acc = acc ^ xor_value
acc = (acc + add_value) & 255
acc = ROL8(acc, rol_value)
```

Then it checks:

```text
acc == check_value
```

To invert this, we reverse the operations in reverse order:

1. Undo `ROL8` by applying `ROR8` with the same rotation amount.
2. Undo `ADD` by subtracting `add_value` modulo 256.
3. Undo `XOR` by XORing with `xor_value`.

So the original byte is:

```python
x = ((ROR8(check_value, rol_value) - add_value) & 0xff) ^ xor_value
```

Where:

```python
def ror8(x, r):
    r %= 8
    return ((x >> r) | (x << (8 - r))) & 0xff
```

---

## 6. Solver Script

Here is a complete Python solver that reads `program.mvm` and reconstructs the flag:

```python
from pathlib import Path
import struct

p = Path("program.mvm").read_bytes()
assert p[:4] == b"MVM1"
n = struct.unpack_from("<H", p, 4)[0]
print("secret length =", n)

flag = [0] * n

def ror8(x, r):
    r %= 8
    return ((x >> r) | (x << (8 - r))) & 0xff

i = 6
while p[i] != 0xFF:
    op, arg = p[i], p[i+1]
    i += 2

    if op == 0x10:
        idx = arg

        # Expect XOR, ADD, ROL8, CHECK
        op_xor, xor_arg = p[i], p[i+1]; i += 2
        op_add, add_arg = p[i], p[i+1]; i += 2
        op_rol, rol_arg = p[i], p[i+1]; i += 2
        op_chk, chk_arg = p[i], p[i+1]; i += 2

        assert op_xor == 0x20
        assert op_add == 0x30
        assert op_rol == 0x40
        assert op_chk == 0x50

        # Invert the transformation
        v = ror8(chk_arg, rol_arg)
        v = (v - add_arg) & 0xff
        v ^= xor_arg

        flag[idx] = v
    else:
        raise SystemExit(f"unexpected opcode {op:02x} at offset {i-2}")

print(bytes(flag).decode())
```

Run it:

```bash
python3 solve.py
```

Output:

```text
tibeb{bytecode_dc67f143d19b57109e1e}
```

---

## 7. Flag

```text
tibeb{bytecode_dc67f143d19b57109e1e}
```

---

## Tricky / Interesting Points

- The VM checks each input byte **independently**. There is no chaining between checks, so the program can be inverted block by block.
- The order of operations matters. The VM does `XOR`, then `ADD`, then `ROL8`. To invert, you must undo `ROL8` first, then `ADD`, then `XOR`.
- `ROL8` is an 8-bit rotate, not a shift. Its inverse is `ROR8` with the same rotation amount.
- The input length is stored as a little-endian `uint16` at offset `4`. Here it is `36`, so the flag is 36 bytes long.
- The program starts at offset `6`, not `0`. The first 6 bytes are the header: `MVM1` + 2-byte length.
- The `CHECK` instructions use immediates that are the expected accumulator values. Because the checks are independent, you can reconstruct each byte without brute force.
