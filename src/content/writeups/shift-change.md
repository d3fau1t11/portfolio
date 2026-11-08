## Challenge summary
- **Files:** `bundle.zip`, `dispatch.txt`
- **Ciphertext:** `etmpm{nlpdlc_nn51p682qnnm68834n53}`
- **Hint:** “An exhausted night guard shifted every letter in a message. Punctuation survived.”
- **Flag format:** `tibeb{...}`

The hint and title “Shift Change” point to a **Caesar shift**, but only **letters** are shifted. Digits, braces, and underscores remain unchanged.

---

## Step 1 — Inspect the files

```bash
pwd && ls -la
file bundle.zip dispatch.txt
unzip -l bundle.zip && echo '--- dispatch.txt ---' && cat dispatch.txt
```

Output shows:

```text
--- dispatch.txt ---
etmpm{nlpdlc_nn51p682qnnm68834n53}
```

`bundle.zip` just contains another copy of `dispatch.txt`, so the real challenge is the ciphertext itself.

---

## Step 2 — Identify the cipher and shift

The flag format is `tibeb{...}`.  
Compare the start of the ciphertext with the expected plaintext:

```text
cipher: etmpm{
plain : tibeb{
```

Take the first letter:

- `e` = 4
- `t` = 19

The encryption shift is:

```text
e = t + k mod 26
4 = 19 + k mod 26
k = 11
```

So the message was encrypted by shifting each letter **forward by 11**.  
To decrypt, shift letters **backward by 11**, which is the same as shifting **forward by 15**.

---

## Step 3 — Decrypt the message

Use this Python script:

```python
ct = "etmpm{nlpdlc_nn51p682qnnm68834n53}"
pt = []

for ch in ct:
    if ch.isalpha():
        base = ord('a') if ch.islower() else ord('A')
        pt.append(chr((ord(ch) - base - 11) % 26 + base))
    else:
        pt.append(ch)

print(''.join(pt))
```

Output:

```text
tibeb{caesar_cc51e682fccb68834c53}
```

---

## Flag

```text
tibeb{caesar_cc51e682fccb68834c53}
```

---

## Tricky parts to note

1. **Only letters are shifted.**  
   Digits like `51`, `682`, `68834`, `53` and punctuation `{`, `}`, `_` stay exactly the same.

2. **The encryption shift is +11, so decryption is -11 or +15.**  
   If you try shifting by +11 while decrypting, you get gibberish. You need the opposite direction.

3. **The inner word `caesar` confirms the cipher.**  
   After decrypting the first block `nlpdlc`, you get `caesar`, which is a strong hint that the Caesar cipher was used.

4. **`bundle.zip` is a decoy/duplicate.**  
   It contains the same `dispatch.txt`, so no hidden files are needed.
