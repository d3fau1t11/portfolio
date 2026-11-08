## Challenge Summary

We are given two RSA moduli `n1` and `n2`, a public exponent `e`, and a ciphertext. The description says:

> Two RSA moduli came from the same hardware workshop. Recover the first dispatch.

This strongly hints that the two moduli share a prime factor. If two RSA moduli share a prime, then:

```text
gcd(n1, n2) = p
```

where `p` is a common prime factor of both moduli.

Once we have `p`, we can factor both `n1` and `n2`, compute the private exponent, and decrypt the ciphertext.

---

## Files Provided

```text
bundle.zip
workshop.json
```

`bundle.zip` only contains `workshop.json`. The JSON contains:

```json
{
  "e": "0x10001",
  "n1": "0xe531...",
  "n2": "0xc227...",
  "ciphertext": "0xbd67..."
}
```

All values are hexadecimal strings.

---

## Step 1 — Inspect the Data

We load the JSON and convert the hexadecimal strings to integers.

```python
import json

j = json.load(open('workshop.json'))

e  = int(j['e'], 16)
n1 = int(j['n1'], 16)
n2 = int(j['n2'], 16)
c  = int(j['ciphertext'], 16)

print(e)
print(n1.bit_length(), n2.bit_length(), c.bit_length())
```

Output:

```text
65537
1024 1024 1024
```

So both moduli are 1024-bit RSA moduli.

---

## Step 2 — Find the Shared Prime

The challenge hint says both moduli came from the same workshop.  
That means they likely share a prime factor.

We compute:

```python
import math

p = math.gcd(n1, n2)
print(hex(p))
print(p.bit_length())
```

Output:

```text
0xf79564ff582b70530e04fe826b8fcac7478b1d180fb021e021f3981eb8f099b02e68fb49e2573ce8a618918afc227518a747f595a26f4309d55a31a148cf5d8d
512
```

`gcd(n1, n2)` is not 1. It is a 512-bit prime.  
This is the shared prime factor `p`.

---

## Step 3 — Factor Both Moduli

Since `p = gcd(n1, n2)`, we can factor both moduli:

```python
q1 = n1 // p
q2 = n2 // p
```

Now:

```text
n1 = p * q1
n2 = p * q2
```

We only need `n1` to decrypt the ciphertext, because the ciphertext was encrypted under the first modulus.

---

## Step 4 — Decrypt the Ciphertext

For RSA:

```text
phi(n1) = (p - 1) * (q1 - 1)
d       = e^{-1} mod phi(n1)
m       = c^d mod n1
```

Then convert the integer `m` to big-endian bytes.

```python
phi = (p - 1) * (q1 - 1)
d = pow(e, -1, phi)
m = pow(c, d, n1)
plaintext = m.to_bytes((m.bit_length() + 7) // 8, 'big')

print(plaintext)
```

Output:

```text
b'tibeb{shared_prime_ca82e244fdb177739eb1}'
```

---

## Full Exploit Script

```python
import json
import math
import re

j = json.load(open('workshop.json'))

e  = int(j['e'], 16)
n1 = int(j['n1'], 16)
n2 = int(j['n2'], 16)
c  = int(j['ciphertext'], 16)

# Shared prime factor
p = math.gcd(n1, n2)
assert p != 1, "No common factor found"

# Factor n1
q1 = n1 // p
phi1 = (p - 1) * (q1 - 1)
d1 = pow(e, -1, phi1)
m1 = pow(c, d1, n1)
pt1 = m1.to_bytes((m1.bit_length() + 7) // 8, 'big')

print("n1 plaintext:", pt1)

# Optional: try n2 as well to show it is garbage
q2 = n2 // p
phi2 = (p - 1) * (q2 - 1)
d2 = pow(e, -1, phi2)
m2 = pow(c, d2, n2)
pt2 = m2.to_bytes((m2.bit_length() + 7) // 8, 'big')
print("n2 plaintext:", pt2)

# Extract flag
match = re.search(rb'tibeb\{[^}]+\}', pt1)
if match:
    print("FLAG:", match.group(0).decode())
```

Run it:

```bash
python3 solve.py
```

Output:

```text
n1 plaintext: b'tibeb{shared_prime_ca82e244fdb177739eb1}'
n2 plaintext: b"\x8e\x19\x9a..."
FLAG: tibeb{shared_prime_ca82e244fdb177739eb1}
```

---

## Tricky Parts

1. **Common prime factor is not obvious from the JSON alone.**  
   The challenge title and description hint at “same hardware workshop”.  
   In RSA, if two moduli share a prime, `gcd(n1, n2)` reveals it immediately.

2. **The ciphertext only decrypts correctly under `n1`.**  
   If you decrypt under `n2`, you get random-looking bytes.  
   The challenge says “Recover the first dispatch”, which implies the ciphertext belongs to the first modulus `n1`.  
   Always try both moduli, but expect only one to produce meaningful plaintext.

3. **Hexadecimal input.**  
   All numbers are strings in hexadecimal. You must use `int(x, 16)`.

5. **Python version.**  
   `pow(e, -1, phi)` requires Python 3.8+. Parrot OS usually has a recent Python 3, so it works.  
   If not, use `pow(e, -1, phi)` replacement or `gmpy2.invert`.

---

## Flag

```text
tibeb{shared_prime_ca82e244fdb177739eb1}
```
