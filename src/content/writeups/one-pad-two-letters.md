## Challenge Overview

The challenge gives us two ciphertexts that were encrypted with the **same one-time pad**.  
A one-time pad is only secure if the key is used **once**. Reusing it completely breaks the encryption.

We are also given a known plaintext, which is a carbon copy of the first dispatch.

Files:

```text
bundle.zip
dispatches.json
```

`bundle.zip` contains another copy of `dispatches.json`, so we can just work with the JSON file directly.

---

## Step 1 — Inspect the JSON

```bash
python3 - <<'PY'
import json
d = json.load(open('dispatches.json'))
print(d.keys())
for k, v in d.items():
    print(k, '->', type(v), repr(v)[:200])
PY
```

Output shows:

```text
encoding -> hex
known_plaintext -> str
ciphertext1 -> str
ciphertext2 -> str
```

The JSON contains:

- `encoding`: `"hex"`
- `known_plaintext`: repeated text
- `ciphertext1`: long hex string
- `ciphertext2`: shorter hex string

---

## Step 2 — Check Lengths

```bash
python3 - <<'PY'
import json
d = json.load(open('dispatches.json'))
for k in ['encoding', 'known_plaintext', 'ciphertext1', 'ciphertext2']:
    print(k, len(d[k]))
PY
```

Output:

```text
encoding 3
known_plaintext 210
ciphertext1 420
ciphertext2 76
```

Important detail:

- Hex strings are twice as long as the actual bytes.
- `ciphertext1` is 420 hex chars = **210 bytes**.
- `ciphertext2` is 76 hex chars = **38 bytes**.
- `known_plaintext` is 210 bytes.

So the known plaintext is long enough to recover the keystream for the second ciphertext.

---

## Step 3 — Understand the Vulnerability

If the same pad/key `K` is used:

```text
C1 = P1 XOR K
C2 = P2 XOR K
```

Then:

```text
C1 XOR C2 = P1 XOR P2
```

If we know `P1`, we can recover the key:

```text
K = C1 XOR P1
```

Then decrypt the second ciphertext:

```text
P2 = C2 XOR K
```

Or directly:

```text
P2 = C1 XOR C2 XOR P1
```

---

## Step 4 — Solve with Python

```bash
python3 - <<'PY'
import json

d = json.load(open('dispatches.json'))

ct1 = bytes.fromhex(d['ciphertext1'])
ct2 = bytes.fromhex(d['ciphertext2'])
kp  = d['known_plaintext'].encode()

# Recover keystream from known plaintext and ciphertext1
key = bytes(c ^ p for c, p in zip(ct1, kp))

# Decrypt ciphertext2 using the recovered keystream
pt2 = bytes(c ^ k for c, k in zip(ct2, key))

print(pt2.decode())
PY
```

Output:

```text
tibeb{reused_pad_4c7dc6f971caa3faa822}
```

---

## Step 5 — Flag

```text
tibeb{reused_pad_4c7dc6f971caa3faa822}
```

---

## Tricky Parts / Notes

1. **Hex encoding doubles the length**  
   `ciphertext1` is 420 characters long, but that is only 210 bytes.  
   Always convert from hex before XORing.

2. **Ciphertext2 is shorter than ciphertext1**  
   `ciphertext2` is only 38 bytes.  
   You only need the first 38 bytes of the recovered keystream to decrypt it.

4. **The same pad was reused**  
   This is the whole vulnerability. A one-time pad must never be reused.  
   Reuse allows XORing ciphertexts together and cancelling out the key.

5. **`bundle.zip` is not necessary**  
   It contains the same `dispatches.json`. You can solve the challenge directly from the JSON file.

6. **Decode as bytes, not string**  
   Use `bytes.fromhex()` and `.encode()` to work with raw bytes.  
   The flag is ASCII, so `.decode()` works at the end.
