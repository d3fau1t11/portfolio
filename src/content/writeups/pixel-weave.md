## 1. Challenge Brief

We're given two files:

- `weave.png` — a 96×96 RGB PNG
- `bundle.zip` — a ZIP that contains *the same* `weave.png`

The note says:

> *"red thread first, row by row; the first four bytes say how much cloth to cut."*

Decoded hint:
- **"red thread"** → use the **red channel**
- **"row by row"** → read pixels in raster order (left→right, top→bottom)
- **"first four bytes say how much cloth to cut"** → the first 4 bytes of the extracted stream are a **length header** telling you how many payload bytes follow

---

## 2. Initial Recon

```bash
ls -la
file weave.png bundle.zip
unzip -l bundle.zip
```

Output:

```
weave.png:  PNG image data, 96 x 96, 8-bit/color RGB, non-interlaced
bundle.zip: Zip archive data ...
Archive:  bundle.zip
  Length      Date    Time    Name
---------  ---------- -----   ----
    27817  2026-10-07 00:00   weave.png
```

Next we verify whether `bundle.zip` contains a *different* PNG (a common trick — sometimes the ZIP holds the "real" image):

```bash
sha256sum weave.png bundle.zip
unzip -o bundle.zip -d bundle_out && sha256sum bundle_out/weave.png
python3 -c "from PIL import Image; print('Pillow OK')" 2>&1
```

Output:

```
0f4653d05bc6493509f6ec7522b90064f40b9d478df7229b69cf5f1f23135b66  weave.png
7a98c3eb4beef6847c72257b0639844bade5580e897ead2d1ce21c9fbfe71043  bundle.zip
0f4653d05bc6493509f6ec7522b90064f40b9d478df7229b69cf5f1f23135b66  bundle_out/weave.png
Pillow OK
```

**Observation:** the PNG inside the ZIP is byte-identical to the standalone PNG. So `bundle.zip` is just packaging / noise. All the data lives in `weave.png`.

> ⚠️ **Trick #1:** Don't get distracted by the ZIP. A lot of medium forensics challenges hide the real payload in an "inner" file — but here the hashes match, so the ZIP is a red herring.

---

## 3. Extracting the LSB Stream

The hint mentions the **red channel** first. Bits are read **row by row** (raster order). We'll pack them MSB-first into bytes.

```python
from PIL import Image
import struct

img = Image.open('weave.png').convert('RGB')
w, h = img.size
px = img.load()

bits = []
for y in range(h):
    for x in range(w):
        r, g, b = px[x, y]
        bits.append(r & 1)

data = bytearray()
for i in range(0, len(bits) - 7, 8):
    byte = 0
    for j in range(8):
        byte = (byte << 1) | bits[i + j]
    data.append(byte)

print("First 16 bytes hex:", data[:16].hex())
print("First 4 bytes BE:", struct.unpack('>I', data[:4])[0])
print("First 4 bytes LE:", struct.unpack('<I', data[:4])[0])
```

Output:

```
First 16 bytes hex: 0000002774696265627b706978656c5f
First 4 bytes BE: 39
First 4 bytes LE: 654311424
```

**Reading the hex dump:**

| Bytes | Meaning |
|-------|---------|
| `00 00 00 27` | 4-byte length header = **39** (big-endian) |
| `74 69 62 65 62 7b 70 69 78 65 6c 5f` | `tibeb{pixel_` — start of flag |

> ⚠️ **Trick #2 — Endianness:** `00 00 00 27` gives `39` as big-endian but a nonsensical `654311424` as little-endian. Confirming with the visible ASCII (`tibeb{...}`) makes it obvious BE is correct.
>
> ⚠️ **Trick #3 — Bit order within a byte:** If you pack LSB-first instead of MSB-first, you get garbage. The `tibeb{` prefix is a nice sanity check that you chose the right bit order.

---

## 4. Slicing the Payload

Now we use the 4-byte header to cut exactly 39 bytes:

```python
from PIL import Image
import struct

img = Image.open('weave.png').convert('RGB')
w, h = img.size
px = img.load()

bits = []
for y in range(h):
    for x in range(w):
        r, g, b = px[x, y]
        bits.append(r & 1)

data = bytearray()
for i in range(0, len(bits) - 7, 8):
    byte = 0
    for j in range(8):
        byte = (byte << 1) | bits[i + j]
    data.append(byte)

length = struct.unpack('>I', data[:4])[0]
payload = data[4:4+length]
print("Length:", length)
print("Flag:", payload.decode('utf-8', errors='replace'))
```

Output:

```
Length: 39
Payload: bytearray(b'tibeb{pixel_weave_0703d066f23ffb3e6141}')
Flag: tibeb{pixel_weave_0703d066f23ffb3e6141}
```

---

## 5. Complete Final Script

Save as `solve.py` and run `python3 solve.py`:

```python
from PIL import Image
import struct

img = Image.open('weave.png').convert('RGB')
w, h = img.size
px = img.load()

# 1. Collect red-channel LSBs in raster (row-by-row) order
bits = []
for y in range(h):
    for x in range(w):
        r, g, b = px[x, y]
        bits.append(r & 1)

# 2. Pack bits MSB-first into bytes
data = bytearray()
for i in range(0, len(bits) - 7, 8):
    byte = 0
    for j in range(8):
        byte = (byte << 1) | bits[i + j]
    data.append(byte)

# 3. First 4 bytes = big-endian payload length
length = struct.unpack('>I', data[:4])[0]

# 4. Extract exactly that many payload bytes
payload = data[4:4 + length]

print("Length:", length)
print("Flag:", payload.decode('utf-8', errors='replace'))
```

---

## 6. Key Takeaways / Interesting Bits

1. **The hint was a complete spec.** Every clause in the note mapped to a specific parameter:
   - *red thread* → red channel LSB
   - *row by row* → raster order, not column or diagonal
   - *first four bytes say how much cloth to cut* → 4-byte length prefix, then slice

2. **`bundle.zip` is a decoy.** Hashes confirmed it holds an identical copy of `weave.png`. If you'd spent time trying to break the ZIP password or look for slack space, you'd have wasted effort. *Always diff before digging.*

3. **Endianness matters.** `00 00 00 27` → 39 (BE). The fact that the very next bytes are `tibeb{` is the tell that you read it correctly. If you'd used LE, you'd think the length is ~654 MB and immediately know something is wrong.

4. **Bit-order matters too.** MSB-first packing produced readable ASCII. LSB-first would have produced `\x10\xb8...` garbage. Always sanity-check with a known magic (`tibeb{` here, `PK\x03\x04` / `\x89PNG` in other challenges).

5. **No crypto, no stego tool needed.** Just `Pillow` + `struct`. This is a "medium" because it combines three small tricks (right channel, right order, right endianness) — not because the underlying idea is hard.

---
