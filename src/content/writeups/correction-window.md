## Challenge Summary

We are given:

- `bundle.zip`
- `editor-report.json`

The JSON report describes an AES-256-CTR encrypted memo, plus the result of an editor replacing the entire plaintext with zero bytes.

The goal is to recover the original memo / flag.

---

## 1. Inspect the Files

```bash
file bundle.zip editor-report.json
unzip -l bundle.zip
```

Output showed:

```text
bundle.zip:         Zip archive data
editor-report.json: JSON text data

Archive:  bundle.zip
  Length      Date    Time    Name
---------  ---------- -----   ----
      308  2026-10-07 00:00   editor-report.json
```

The zip only contains another copy of `editor-report.json`.

Extracting:

```bash
mkdir -p extracted
unzip -o bundle.zip -d extracted
find extracted -maxdepth 3 -type f -printf '%p %s bytes\n'
```

Output:

```text
extracted/editor-report.json 308 bytes
```

So the zip is not very important; the real data is in the JSON.

---

## 2. Read the Incident Report

```bash
python3 -m json.tool editor-report.json
```

Output:

```json
{
    "mode": "AES-256-CTR",
    "nonce": "f8bfa02c80845477df2e6ed24a5dc280",
    "original": "15c647e88acaf07881d276d03a7311fe9388a93d68a6c138bac494f11d15e0bba64a7a17",
    "edited_to_zero_bytes": "61af258de8b1930cf38d13b453074ec7a6bec85b5d93f001dcf6f1c92a71858396721e6a",
    "edit_offset": 0,
    "edit_length": 36
}
```

Important fields:

- `mode`: `AES-256-CTR`
- `original`: original ciphertext in hex
- `edited_to_zero_bytes`: ciphertext after plaintext was replaced with zero bytes
- `edit_offset`: `0`
- `edit_length`: `36`

The original plaintext length is 36 bytes, because:

```text
15c647e88acaf07881d276d03a7311fe9388a93d68a6c138bac494f11d15e0bba64a7a17
```

is 72 hex characters = 36 bytes.

Likewise, `edited_to_zero_bytes` is also 36 bytes.

---

## 3. Understand the Crypto

AES-CTR is a stream cipher mode. Encryption works like this:

```text
ciphertext = plaintext XOR keystream
```

where the keystream is generated from AES using the key, nonce, and counter.

So for the original memo:

```text
original_ciphertext = original_plaintext XOR keystream
```

The editor replaced the entire plaintext with zero bytes. If the edited plaintext is all `0x00`, then:

```text
edited_ciphertext = 0x00 XOR keystream
                  = keystream
```

Therefore, `edited_to_zero_bytes` is literally the keystream.

Now XOR the original ciphertext with the keystream:

```text
original_ciphertext XOR edited_ciphertext
= (original_plaintext XOR keystream) XOR keystream
= original_plaintext
```

So we can recover the original plaintext without knowing the AES key or nonce.

This is the classic CTR malleability property.

---

## 4. Recover the Plaintext

Run this Python:

```bash
python3 - <<'PY'
orig = bytes.fromhex("15c647e88acaf07881d276d03a7311fe9388a93d68a6c138bac494f11d15e0bba64a7a17")
zero = bytes.fromhex("61af258de8b1930cf38d13b453074ec7a6bec85b5d93f001dcf6f1c92a71858396721e6a")

pt = bytes(a ^ b for a, b in zip(orig, zero))
print(pt.decode())
PY
```

Output:

```text
tibeb{ctr_edit_956af5519f2e87de808d}
```

---

## 5. Flag

```text
tibeb{ctr_edit_956af5519f2e87de808d}
```

---

## Tricky / Important Points

1. **No AES key is needed.**
   - The challenge gives `AES-256-CTR` and a nonce, but not the key.
   - Trying to AES-decrypt is a dead end.
   - The vulnerability is CTR malleability.

2. **`edited_to_zero_bytes` is the keystream.**
   - In CTR mode:
     ```text
     ciphertext = plaintext XOR keystream
     ```
   - If plaintext is all zero bytes:
     ```text
     ciphertext = 0x00 XOR keystream = keystream
     ```

3. **XOR the two ciphertexts, not the hex strings.**
   - You must decode the hex first.
   - Then XOR byte-by-byte.
   - Doing XOR on the ASCII hex characters would be wrong.

4. **The edit offset matters.**
   - Here `edit_offset = 0` and `edit_length = 36`.
   - That means the entire plaintext was zeroed.
   - If only part of the plaintext had been zeroed, you could only recover that window of bytes.
   - The challenge name “Correction Window” hints at this edit window concept.

5. **The nonce is mostly a red herring.**
   - It is useful for real AES-CTR decryption, but since we are exploiting the zero-plaintext edit, we never need it.

6. **The zip is not needed.**
   - `bundle.zip` contains another copy of `editor-report.json`.
   - The JSON outside the zip is sufficient.

---

## Final Flag

```text
tibeb{ctr_edit_956af5519f2e87de808d}
```
