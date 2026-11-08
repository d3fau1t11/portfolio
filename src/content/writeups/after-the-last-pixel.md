## 1. Initial reconnaissance

We start with two files:

```bash
ls
bundle.zip  poster.png
```

Check file types and sizes:

```bash
file poster.png bundle.zip && ls -lh poster.png bundle.zip
```

Output:

```text
poster.png: PNG image data, 64 x 64, 8-bit/color RGB, non-interlaced
bundle.zip: Zip archive data, made by v2.0 UNIX, extract using at least v2.0, last modified Oct 07 2026 00:00:00, uncompressed size 352, method=deflate
-rw-rw-r-- 1 ctf-user ctf-user 340 ኦክተ 14 16:08 bundle.zip
-rw-rw-r-- 1 ctf-user ctf-user 352 ኦክተ 14 16:08 poster.png
```

The PNG opens normally, but its file size is larger than expected for a simple 64×64 image. This suggests extra data appended after the PNG image data.

---

## 2. Find the hidden data

`pngcheck` was not installed, so we used `xxd` and `binwalk`.

### Option A: Inspect the end of the PNG

```bash
xxd poster.png | tail -n 40
```

Near the end we see the PNG `IEND` chunk followed by ZIP magic bytes `PK`:

```text
000000a0: 2ec1 f0d3 23c8 62b1 0000 0000 4945 4e44  ....#.b.....IEND
000000b0: ae42 6082 504b 0304 1400 0000 0800 0000  .B`.PK..........
```

This is a classic PNG + ZIP polyglot: a valid PNG with a ZIP archive appended after `IEND`.

### Option B: Use binwalk

```bash
binwalk poster.png
```

Output:

```text
DECIMAL       HEXADECIMAL     DESCRIPTION
--------------------------------------------------------------------------------
0             0x0             PNG image, 64 x 64, 8-bit/color RGB, non-interlaced
41            0x29            Zlib compressed data, default compression
180           0xB4            Zip archive data, at least v2.0 to extract, compressed size: 50, uncompressed size: 48, name: dispatch.b64
330           0x14A           End of Zip archive, footer length: 22
```

The ZIP archive starts at offset **180** (`0xB4`).

---

## 3. Carve out the appended ZIP

Use `dd` to extract the ZIP starting at byte 180:

```bash
dd if=poster.png of=embedded.zip bs=1 skip=180 status=none && unzip -l embedded.zip
```

Output:

```text
Archive:  embedded.zip
  Length      Date    Time    Name
---------  ---------- -----   ----
       48  2026-10-07 00:00   dispatch.b64
---------                     -------
       48                     1 file
```

The ZIP contains a single file: `dispatch.b64`.

---

## 4. Extract and decode

Extract the ZIP:

```bash
unzip -o embedded.zip && ls -la
```

You can also extract `bundle.zip`, but it only contains another copy of `poster.png` — it is a distraction.

Now decode the Base64 file:

```bash
base64 -d dispatch.b64 > dispatch.out && file dispatch.out && cat dispatch.out
```

Output:

```text
dispatch.out: ASCII text, with no line terminators
tibeb{png_tail_65445df5f21363883f58}
```

---

## 5. Flag

```text
tibeb{png_tail_65445df5f21363883f58}
```

---

## Interesting / tricky parts

- **Polyglot file:** The PNG is fully valid and opens normally. Extra data is hidden after the `IEND` chunk, so image viewers ignore it.
- **Appended ZIP:** The ZIP archive is not at the beginning of the file. Tools like `binwalk` or inspecting the hex tail reveal the `PK` magic bytes after `IEND`.
- **Offset carving:** The ZIP starts at offset `0xB4` / `180`. Using `dd` with `skip=180` cleanly extracts it.
- **Decoy file:** `bundle.zip` contains only `poster.png`, so it does not directly hold the flag. The real payload is inside `poster.png` itself.
- **Base64:** The extracted `dispatch.b64` decodes directly to the flag.
