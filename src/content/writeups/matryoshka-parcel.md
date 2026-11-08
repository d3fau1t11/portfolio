### Initial files

```bash
ls
```

Output:

```text
bundle.zip  parcel.dat
```

The challenge hint says the filename lies and to identify formats by magic bytes, not suffixes. So we inspect both files.

```bash
file bundle.zip parcel.dat
```

Output showed:

```text
bundle.zip: Zip archive data
parcel.dat: gzip compressed data
```

Interesting: `parcel.dat` is actually gzip despite the `.dat` extension.

If you only had `bundle.zip`, you could extract it first:

```bash
unzip bundle.zip
```

It contains another `parcel.dat`. In this run, the outside `parcel.dat` was already the gzip payload, so we worked directly with it.

---

## Step 1 — Decompress gzip

```bash
gzip -dc parcel.dat > layer1.bin
```

Check the result:

```bash
file layer1.bin
xxd -l 128 layer1.bin
```

Output:

```text
layer1.bin: ASCII text, with no line terminators
00000000: 516c 706f 4f54 4642 5753 5a54 5753 4a38  QlpoOTFBWSZTWSJ8
```

The data starts with `QlpoOT...`. That is Base64.  
`binwalk` will not detect this because it is just text, so `file` + `xxd` are important here.

---

## Step 2 — Decode Base64

```bash
base64 -d layer1.bin > layer2.bin
```

Check it:

```bash
file layer2.bin
xxd -l 64 layer2.bin
```

Output:

```text
layer2.bin: bzip2 compressed data, block size = 900k
00000000: 425a 6839 3141 5926 5359 227c 6d0d 0000  BZh91AY&SY"|m...
```

`BZh` is the bzip2 magic header. So this layer is bzip2.

---

## Step 3 — Decompress bzip2

```bash
bzip2 -dc layer2.bin > layer3.bin
```

Check it:

```bash
file layer3.bin
xxd -l 128 layer3.bin
```

Output:

```text
layer3.bin: Zip archive data
00000000: 504b 0304 1400 0000 0800 0000 475d 9fe2  PK..........
```

`PK` is the ZIP magic header.  
The archive contains a file named:

```text
last-dispatch.txt
```

---

## Step 4 — Extract ZIP and read the flag

```bash
unzip -o layer3.bin -d layer3_extracted
```

Then:

```bash
cat layer3_extracted/last-dispatch.txt
```

Output:

```text
tibeb{matryoshka_a52321d3fbea56b2bea3}
```

---

## Final Flag

```text
tibeb{matryoshka_a52321d3fbea56b2bea3}
```

---

## Tricky / Interesting Parts

1. **`parcel.dat` is not a `.dat` file.**  
   It is gzip. Always trust magic bytes from `file` and `xxd`, not extensions.

2. **The Base64 layer has no newline.**  
   `file layer1.bin` says “ASCII text, with no line terminators.”  
   `binwalk` finds nothing. You need to look at the first bytes with `xxd` to recognize `Qlpo...` as Base64.

3. **`bundle.zip` is mostly a wrapper.**  
   It contains `parcel.dat`. The outside `parcel.dat` was already the same gzip payload, so extracting `bundle.zip` was optional. If you start from `bundle.zip` alone, just `unzip bundle.zip` and continue from the gzip step.

---

**Answer to submit:**

```text
tibeb{matryoshka_a52321d3fbea56b2bea3}
```
