## Challenge Summary

**Category:** Misc / Medium  
**Points:** 300  
**First blood:** Sador  

**Description:**
> Every seven-bit word suffered exactly one flipped bit. The old workshop used even-parity Hamming(7,4), with parity at positions 1, 2, and 4. Repair the transmission.

**Files provided:**
- `bundle.zip`
- `transmission.txt`

The zip archive contains the same `transmission.txt`, so the main challenge is decoding the transmission using Hamming(7,4) error correction.

---

## Step 1 — Initial Recon

List the files and inspect them:

```bash
ls -la
file bundle.zip transmission.txt
unzip -l bundle.zip
head -c 500 transmission.txt | xxd
```

Output shows:
- `bundle.zip` is a ZIP containing `transmission.txt`.
- `transmission.txt` is ASCII text.
- The file begins with 7-bit binary strings, one per line, e.g.:

```
0001011
0001100
1000110
1011001
...
```

Each line is exactly 7 bits. The description says every 7-bit word had exactly one flipped bit, and the encoding is even-parity Hamming(7,4) with parity bits at positions 1, 2, and 4.

---

## Step 2 — Understanding Hamming(7,4)

Hamming(7,4) encodes 4 data bits into 7 bits by adding 3 parity bits.

Standard layout (1-indexed positions):

| Position | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
|----------|---|---|---|---|---|---|---|
| Role     | p1| p2| d1| p4| d2| d3| d4|

- Parity bits: positions 1, 2, 4
- Data bits: positions 3, 5, 6, 7

Parity checks (even parity):
- **p1** covers positions 1, 3, 5, 7 → `b[0] + b[2] + b[4] + b[6]` (0-indexed)
- **p2** covers positions 2, 3, 6, 7 → `b[1] + b[2] + b[5] + b[6]`
- **p4** covers positions 4, 5, 6, 7 → `b[3] + b[4] + b[5] + b[6]`

If a parity check fails, the corresponding bit is set in the syndrome. The syndrome value (1, 2, 4, or sum) points to the 1-indexed position of the flipped bit. Since exactly one bit is flipped per word, the syndrome will always be non-zero (1–7).

To repair: flip the bit at the indicated position.  
Then extract the 4 data bits from positions 3, 5, 6, 7 (in that order) to reconstruct the original nibble.

---

## Step 3 — Decoding Script

We write a Python script to:
1. Read each 7-bit word.
2. Compute the syndrome.
3. Flip the erroneous bit.
4. Extract the 4 data bits.
5. Concatenate all data bits into a bitstream.
6. Group into 8-bit bytes and decode as ASCII.

```python
from pathlib import Path

def correct_word(w):
    b = [int(c) for c in w.strip()]
    s = 0
    # p1 covers indices 0,2,4,6
    if (b[0] + b[2] + b[4] + b[6]) % 2: s += 1
    # p2 covers indices 1,2,5,6
    if (b[1] + b[2] + b[5] + b[6]) % 2: s += 2
    # p4 covers indices 3,4,5,6
    if (b[3] + b[4] + b[5] + b[6]) % 2: s += 4
    if s:
        b[s-1] ^= 1  # flip the erroneous bit (1-indexed s -> 0-indexed s-1)
    # data bits at positions 3,5,6,7 -> 0-indexed 2,4,5,6
    return (b[2] << 3) | (b[4] << 2) | (b[5] << 1) | b[6]

lines = Path('transmission.txt').read_text().splitlines()
nibbles = [correct_word(line) for line in lines if line.strip()]

bits = []
for n in nibbles:
    bits.extend([(n >> 3) & 1, (n >> 2) & 1, (n >> 1) & 1, n & 1])

out = bytearray()
for i in range(0, len(bits)//8*8, 8):
    val = 0
    for bit in bits[i:i+8]:
        val = (val << 1) | bit
    out.append(val)

print(out.decode('latin-1'))
```

Run it:

```bash
python3 decode.py | tee decoded.txt
```

Output:

```
tibeb{repair_shop_4d3641cf53f7f3caefe7}
```

Extract the flag:

```bash
grep -o 'tibeb{[^}]*}' decoded.txt
```

Result:

```
tibeb{repair_shop_4d3641cf53f7f3caefe7}
```

---

## Flag

```
tibeb{repair_shop_4d3641cf53f7f3caefe7}
```

---

## Tricky / Interesting Points

1. **Exactly one flipped bit per word** — This simplifies the decoder: you never need to handle the “no error” case (syndrome = 0). The syndrome always points to the corrupted bit.

2. **Parity positions are 1-indexed** — The description explicitly says parity at positions 1, 2, and 4. In code, remember that Python lists are 0-indexed. A common mistake is to mix up the indices. The script uses 0-indexed `b[0]` for position 1, etc.

3. **Data bit order matters** — In standard Hamming(7,4), the data bits are at positions 3, 5, 6, 7. They must be read in that order to reconstruct the original nibble correctly. Reading them in a different order will produce garbage.

5. **Bitstream grouping** — After correcting all words, you get a stream of 4-bit nibbles. These must be concatenated and then grouped into 8-bit bytes. The number of lines (78) gives exactly 78 × 4 = 312 bits = 39 bytes, which matches the flag length.

---

## Conclusion

This challenge is a classic error-correcting code exercise. The key steps are:
- Recognize Hamming(7,4) from the description.
- Implement the syndrome calculation correctly with 1-indexed parity positions.
- Flip the erroneous bit, extract data bits, and reassemble the ASCII message.

The flag is `tibeb{repair_shop_4d3641cf53f7f3caefe7}`.
