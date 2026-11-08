**Files:** `bundle.zip`, `ledger.sqlite`  
**Flag format:** `tibeb{...}`

## 1. Initial Recon

Start by identifying the files:

```bash
file ledger.sqlite bundle.zip
```

Output:

```text
ledger.sqlite: SQLite 3.x database, last written using SQLite version 3046001, file counter 3, database pages 5, 1st free page 3, free pages 3, cookie 0x1, schema 4, UTF-8, version-valid-for 3
bundle.zip:    Zip archive data, made by v2.0 UNIX, extract using at least v2.0, last modified Oct 07 2026 00:00:00, uncompressed size 20480, method=deflate
```

Key observation: the SQLite database has **5 pages**, a **first free page of 3**, and **3 free pages**.  
Free pages make deleted-content recovery worth investigating. Whether old bytes survive depends on settings such as `secure_delete`, page reuse and vacuuming; deletion does not always leave recoverable data.

---

## 2. Inspect the SQLite Schema and Live Data

Check the tables and schema:

```bash
sqlite3 ledger.sqlite ".tables" ".schema"
```

Output:

```text
ledger
CREATE TABLE ledger(id INTEGER PRIMARY KEY, note TEXT);
```

View the live rows:

```bash
sqlite3 ledger.sqlite "SELECT * FROM ledger;"
```

Output:

```text
1|Routine inventory: 24 blue lanterns
```

Only one row is visible. The deleted “sealed entry” is not in the live table.

---

## 3. Confirm Free Pages

Check page size, page count, and freelist count:

```bash
sqlite3 ledger.sqlite "PRAGMA page_size; PRAGMA page_count; PRAGMA freelist_count;"
```

Output:

```text
4096
5
3
```

- Page size: 4096 bytes  
- Total pages: 5  
- Free pages: 3  

The freelist has 3 pages. The deleted entry is likely still sitting in one of those free pages.

---

## 4. Extract Strings from the Database

A simple `strings` dump is often enough for this kind of challenge:

```bash
strings -a ledger.sqlite | head -80
```

Among the output, we see the deleted envelope:

```text
SEALED_DISPATCH:dGliZWJ7ZXJhc2VkX2xlZGdlcl9kMzhjZDhmY2E5ODg0YTNkZjI4ZH0=:END_DISPATCH
```

This is the old entry. The structure is:

```text
SEALED_DISPATCH:<base64_payload>:END_DISPATCH
```

---

## 5. Decode the Envelope

The payload is base64. Decode it:

```bash
echo 'dGliZWJ7ZXJhc2VkX2xlZGdlcl9kMzhjZDhmY2E5ODg0YTNkZjI4ZH0=' | base64 -d
```

Output:

```text
tibeb{erased_ledger_d38cd8fca9884a3df28d}
```

That is the flag.

---

## 6. Flag

```text
tibeb{erased_ledger_d38cd8fca9884a3df28d}
```

---

## Interesting / Tricky Points

- **SQLite freelist recovery:**  
  Deleting rows can leave residual bytes in free space, and fully freed pages may enter the freelist. This challenge’s recorded `strings` output contains the deleted envelope. Recovery is not guaranteed when secure deletion, page reuse or vacuuming has overwritten the relevant bytes.

- **`bundle.zip` is not needed:**  
  The challenge gives both `ledger.sqlite` and `bundle.zip`, but the flag is entirely inside `ledger.sqlite`. The zip is likely a red herring or just the original export bundle.

- **The envelope format:**  
  The deleted row contained `SEALED_DISPATCH:<base64>:END_DISPATCH`. Recognizing the base64 and decoding it directly gives the flag. No further crypto or obfuscation is involved.

- **Hex dump confirmation:**  
  You can also confirm the free page by running:
  ```bash
  xxd -s 8192 -l 4096 ledger.sqlite | head -120
  ```
  Offset `8192` is page 3 (since page size is 4096). The page contains mostly filler characters (`X`), but the `strings` output already revealed the envelope.

---

## Summary of Commands Used

```bash
file ledger.sqlite bundle.zip
sqlite3 ledger.sqlite ".tables" ".schema"
sqlite3 ledger.sqlite "SELECT * FROM ledger;"
sqlite3 ledger.sqlite "PRAGMA page_size; PRAGMA page_count; PRAGMA freelist_count;"
strings -a ledger.sqlite | head -80
echo 'dGliZWJ7ZXJhc2VkX2xlZGdlcl9kMzhjZDhmY2E5ODg0YTNkZjI4ZH0=' | base64 -d
```

Final flag:

```text
tibeb{erased_ledger_d38cd8fca9884a3df28d}
```
