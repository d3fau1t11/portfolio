**First blood:** Adwa

## 1. Initial Files

After downloading and extracting `bundle.zip`:

```bash
unzip -l bundle.zip
unzip -o bundle.zip
```

You get:

- `incident.txt`
- `proxy.jsonl`

Read the incident note:

```bash
cat incident.txt
```

Output:

```text
Recover transfer amber-17. Log collector delivery order is not guaranteed.
```

This tells us:

1. The target transfer ID is `amber-17`.
2. The log entries may be out of order. We must not trust the order in the file; we need to sort by some sequence field.

---

## 2. Basic Log Recon

Check the size and structure of the log:

```bash
wc -l proxy.jsonl
head -n 5 proxy.jsonl
tail -n 5 proxy.jsonl
```

Each line is a JSON object:

```json
{"time": 1791417524, "client": "192.0.2.7", "method": "GET", "path": "/assets/banner.svg", "status": 200, "bytes": 24}
```

The `path` field can contain query parameters, including `transfer`, `seq`, and `chunk`.

---

## 3. Locate the Target Transfer

Search for `amber-17`:

```bash
grep -n 'amber-17' proxy.jsonl
grep -c 'amber-17' proxy.jsonl
```

You will find **6** entries:

```text
31:  ...transfer=amber-17&seq=5&chunk=X0%3D
32:  ...transfer=amber-17&seq=1&chunk=G9nYm9va1
43:  ...transfer=amber-17&seq=4&chunk=ODViMDZmZ
55:  ...transfer=amber-17&seq=3&chunk=mZWVjZGM4
94:  ...transfer=amber-17&seq=0&chunk=dGliZWJ7b
113: ...transfer=amber-17&seq=2&chunk=84MWM2NDd
```

Notice the `seq` values are **0 through 5**, but the lines appear out of order in the file. The `time` field is also not reliable for ordering. The incident note warned us: **delivery order is not guaranteed**.

---

## 4. Extract and Order the Chunks

We need to extract the `seq` number and the `chunk` value, then sort numerically by `seq`.

```bash
grep 'amber-17' proxy.jsonl \
| sed -E 's/.*seq=([0-9]+).*chunk=([^&"]+).*/\1 \2/' \
| sort -n
```

Output:

```text
0 dGliZWJ7b
1 G9nYm9va1
2 84MWM2NDd
3 mZWVjZGM4
4 ODViMDZmZ
5 X0%3D
```

Now we have the correct order.

---

## 5. Reassemble the Base64 String

### ⚠️ Tricky Part

Each `chunk` is **not** a complete base64 string. They are **fragments** of one larger base64-encoded message.

If you try to base64-decode each chunk individually, you get errors like:

```text
binascii.Error: Invalid base64-encoded string: number of data characters (9) cannot be 1 more than a multiple of 4
binascii.Error: Incorrect padding
```

That is the trap. You must **concatenate all chunks first**, then URL-decode, then base64-decode once.

Concatenate the chunks in `seq` order and URL-decode:

```bash
grep 'amber-17' proxy.jsonl \
| sed -E 's/.*seq=([0-9]+).*chunk=([^&"]+).*/\1 \2/' \
| sort -n \
| awk '{print $2}' \
| tr -d '\n' \
| python3 -c 'import sys,urllib.parse; print(urllib.parse.unquote(sys.stdin.read()))'
```

Output:

```text
dGliZWJ7bG9nYm9va184MWM2NDdmZWVjZGM4ODViMDZmZX0=
```

This is a valid base64 string. Note the trailing `=` — that came from the URL-encoded `%3D` in the last chunk.

---

## 6. Base64 Decode the Combined String

Now decode the full base64 string:

```bash
grep 'amber-17' proxy.jsonl \
| sed -E 's/.*seq=([0-9]+).*chunk=([^&"]+).*/\1 \2/' \
| sort -n \
| awk '{print $2}' \
| tr -d '\n' \
| python3 -c 'import sys,urllib.parse,base64; s=urllib.parse.unquote(sys.stdin.read()); print(base64.b64decode(s).decode())'
```

Output:

```text
tibeb{logbook_81c647feecdc885b06fe}
```

---

## 7. Flag

```text
tibeb{logbook_81c647feecdc885b06fe}
```

Save it if you want:

```bash
... | tee /tmp/amber17_flag.txt
```

---

## 8. One-Liner

If you prefer a single command:

```bash
grep 'amber-17' proxy.jsonl | sed -E 's/.*seq=([0-9]+).*chunk=([^&"]+).*/\1 \2/' | sort -n | awk '{print $2}' | tr -d '\n' | python3 -c 'import sys,urllib.parse,base64; print(base64.b64decode(urllib.parse.unquote(sys.stdin.read())).decode())'
```

---

## 9. Tricky / Interesting Points

1. **Delivery order is not guaranteed.**  
   The log lines are shuffled. You must sort by `seq`, not by `time` or by line order.

2. **Chunks are fragments, not individual messages.**  
   The biggest trap is trying to base64-decode each chunk separately. They only become valid when concatenated in the correct sequence.

3. **URL encoding matters.**  
   The last chunk is `X0%3D`. `%3D` is `=`, which is the base64 padding character. If you skip URL-decoding, the base64 string will be invalid.

4. **The `time` field is a red herring.**  
   The timestamps are out of order and do not correspond to the sequence. Always use the explicit `seq` parameter.

5. **Standard flag format.**  
   The flag follows the required `tibeb{...}` format.

---

## 10. Summary

- Extract `bundle.zip`.
- Read `incident.txt` → target `amber-17`, order not guaranteed.
- Grep for `amber-17`.
- Extract `seq` and `chunk`, sort by `seq`.
- Concatenate chunks, URL-decode, base64-decode.
- Get flag: `tibeb{logbook_81c647feecdc885b06fe}`.
