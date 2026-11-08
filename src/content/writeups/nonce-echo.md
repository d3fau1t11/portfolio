## Challenge Summary
We are given DSA public parameters and two signatures that reuse the same ephemeral nonce `k`. Because DSA nonces must never repeat, we can recover the private key `x`, then derive the XOR key and decrypt the sealed flag.

Files:
- `bundle.zip`
- `signatures.json`

---

## Step 1 — Inspect the JSON
After extracting, `signatures.json` contains:

- DSA parameters: `p`, `q`, `g`, `y`
- Two signatures with the **same `r`**
- A `sealed` hex string
- Notes:
  - `hash_convention`: `SHA256 interpreted big-endian, reduced modulo q`
  - `sealing`: `repeat SHA256(minimal unsigned big-endian x) as XOR key`

The repeated `r` is a clue to nonce reuse. The recovered key is checked against the public key below to validate the hypothesis.

---

## Step 2 — DSA Nonce Reuse Math

For DSA:

```text
s = k^(-1)(h + x r) (mod q)
```

For two signatures with the same nonce `k`:

```text
s_1 = k^(-1)(h_1 + x r) (mod q)
```

```text
s_2 = k^(-1)(h_2 + x r) (mod q)
```

Subtract:

```text
s_1 - s_2 = k^(-1)(h_1 - h_2) (mod q)
```

So:

```text
k = (h_1 - h_2) / (s_1 - s_2) (mod q)
```

Once `k` is known, recover the private key:

```text
x = (s_1 k - h_1) / (r) (mod q)
```

Then verify:

```text
y ≡ g^x (mod p)
```

---

## Step 3 — Solver Script

Create `solve.py`:

```python
import json, hashlib

d = json.load(open('signatures.json'))

p = int(d['p'], 16)
q = int(d['q'], 16)
g = int(d['g'], 16)
y = int(d['y'], 16)

sigs = d['signatures']

h1 = int(sigs[0]['h'], 16)
r1 = int(sigs[0]['r'], 16)
s1 = int(sigs[0]['s'], 16)

h2 = int(sigs[1]['h'], 16)
r2 = int(sigs[1]['r'], 16)
s2 = int(sigs[1]['s'], 16)

assert r1 == r2, "r values differ, nonce not reused?"

# k = (h1 - h2) / (s1 - s2) mod q
k = ((h1 - h2) * pow((s1 - s2) % q, -1, q)) % q

# x = (s1*k - h1) / r mod q
x = ((s1 * k - h1) * pow(r1, -1, q)) % q

print("k =", hex(k))
print("x =", hex(x))
print("check y == g^x mod p:", pow(g, x, p) == y)

# minimal unsigned big-endian encoding of x
xb = x.to_bytes((x.bit_length() + 7) // 8, 'big')
key = hashlib.sha256(xb).digest()

print("x_bytes =", xb.hex())
print("key     =", key.hex())

ct = bytes.fromhex(d['sealed'])
pt = bytes(b ^ key[i % len(key)] for i, b in enumerate(ct))

print("plaintext hex:", pt.hex())
print("FLAG:", pt.decode())
```

Run it:

```bash
python3 solve.py
```

---

## Step 4 — Output

```text
k = 0x7a885ee1251149a79799bc45d8fd294c4acdde1c
x = 0x3c5952db0d792e7fc0bd4e577c72d905b9b087ed
check y == g^x mod p: True
x_bytes = 3c5952db0d792e7fc0bd4e577c72d905b9b087ed
key     = f41a700468089f602599f4cbadc21324a3defa8799d15690e6ffdcd0c74e9f5c
plaintext hex: 74696265627b6e6f6e63655f6563686f5f62633431663938303131333165633838393464647d
FLAG: tibeb{nonce_echo_bc41f9801131ec8894dd}
```

---

## Step 5 — Flag

```text
tibeb{nonce_echo_bc41f9801131ec8894dd}
```

---

## Tricky Parts to Note

1. **Reused nonce is the whole challenge.**  
   The two signatures share `r`, suggesting nonce reuse. Equal `r` alone is not unconditional proof. The nonce-reuse equations produce a candidate key, and the successful `g^x mod p == y` check supports the recorded recovery.

2. **Modular arithmetic must be reduced modulo `q`.**  
   When computing `(s1 - s2) % q`, do not forget the modulo. Negative differences must be reduced properly.

3. **Private key encoding matters.**  
   The sealing note says:
   > `SHA256(minimal unsigned big-endian x)`
   
   This means you must convert the integer `x` to the shortest possible big-endian byte string. Do **not** hash the ASCII hex string. Do **not** pad with leading zeros unless necessary.

4. **XOR key is repeated.**  
   The SHA-256 digest is 32 bytes. The sealed data may be longer, so the key is repeated cyclically:
   ```python
   key[i % len(key)]
   ```

5. **`h` values are already provided.**  
   The JSON gives `h` for each message, already interpreted as SHA-256 big-endian reduced modulo `q`. You do not need to hash the messages yourself.

6. **`sealed` is hex.**  
   Convert it with `bytes.fromhex(...)` before XOR.

7. **Python version.**  
   `pow(a, -1, q)` requires Python 3.8+. On Parrot OS this is normally fine. If not, use `pow(a, q-2, q)` since `q` is prime.

---

## Final Answer

```text
tibeb{nonce_echo_bc41f9801131ec8894dd}
```
