## Challenge summary

We are given:

- `browser.html` — a browser harness that loads `lock.wasm`
- `lock.wasm` — a small WebAssembly module
- `bundle.zip` — contains the same two files

The goal is to find the accepted password. The flag format is:

```text
tibeb{...}
```

---

## 1. Recon

List the files and inspect them:

```bash
ls -la
file browser.html bundle.zip lock.wasm
unzip -l bundle.zip
```

Output shows:

```text
browser.html: HTML document, ASCII text
bundle.zip:   Zip archive data
lock.wasm:    WebAssembly (wasm) binary module version 0x1 (MVP)
```

So the important file is `lock.wasm`.

---

## 2. Inspect the browser harness

Open `browser.html`:

```bash
sed -n '1,260p' browser.html
```

The important JavaScript is:

```js
let module;
fetch('lock.wasm').then(r=>r.arrayBuffer()).then(WebAssembly.instantiate).then(x=>module=x.instance.exports);
document.getElementById('b').onclick=()=>{
  const b=new TextEncoder().encode(document.getElementById('p').value);
  if(!module||b.length>256) return;
  new Uint8Array(module.memory.buffer).set(b,0);
  document.getElementById('o').textContent=module.check(0,b.length)?'Unlocked':'Locked';
};
```

Key points:

- The user input is written into WASM memory at offset `0`.
- Then `check(0, b.length)` is called.
- So the WASM function receives:
  - pointer `0` — start of our input
  - length — number of bytes in our input

---

## 3. Extract readable strings

Run:

```bash
strings -a -n 3 lock.wasm | tee wasm_strings.txt | head -300
```

You will see suspicious data near the end:

```text
%.38?8!-;)7
6591
lhlcoo?<o8k??<nmoj?8'
```

This is not plaintext. It is likely an encoded comparison target.

---

## 4. Disassemble the WASM

Install WABT if needed:

```bash
sudo apt update && sudo apt install -y wabt
```

Then disassemble:

```bash
wasm2wat lock.wasm -o lock.wat
sed -n '1,260p' lock.wat
```

The `check` function does a long series of comparisons. Each one looks like this:

```wat
local.get 0
i32.const 0
i32.add
i32.load8_u
i32.const 90
i32.xor
i32.const 1024
i32.load8_u
i32.eq
```

Translation:

```text
(input[0] ^ 90) == memory[1024 + 0]
```

And the first check is:

```wat
local.get 1
i32.const 37
i32.eq
```

So the required input length is exactly `37`.

The XOR key is `90` decimal, which is `0x5A`.

---

## 5. Decompile to pseudo-C

Run:

```bash
wasm-decompile lock.wasm -o lock.dcmp
sed -n '1,260p' lock.dcmp
```

The important part is:

```c
export memory memory(initial: 1, max: 0);

data d_38876591lhlcooo8knmoj8(offset: 1024) =
".38?8!-;)7\056591\05lhlcoo?<o8k??<nmoj?8'";

export function check(a:int, b:int):int {
  return 
    ((((((((((((((((((((((((((((((((((((b == 37 &
      ((a + 0)[0]:ubyte ^ 90) == d_38876591lhlcooo8knmoj8[0]:ubyte) &
      ((a + 1)[0]:ubyte ^ 90) == d_38876591lhlcooo8knmoj8[1]:ubyte) &
      ...
      ((a + 36)[0]:ubyte ^ 90) == d_38876591lhlcooo8knmoj8[36]:ubyte
}
```

So the logic is:

```text
len(input) == 37
for i in 0..36:
    input[i] ^ 0x5A == data[1024 + i]
```

To recover the password, XOR the data bytes with `0x5A`.

---

## 6. Recover the flag

The data string contains two escaped control bytes:

```text
\05
```

These are the byte `0x05`, not the literal characters `\`, `0`, `5`.

Use Python:

```bash
python3 -c "d=b'.38?8!-;)7\x056591\x05lhlcoo?<o8k??<nmoj?8\''; print(''.join(chr(b^0x5A) for b in d))"
```

Output:

```text
tibeb{wasm_lock_626955ef5b1eef4750eb}
```

So the accepted password / flag is:

```text
tibeb{wasm_lock_626955ef5b1eef4750eb}
```

---

## 7. Optional verification

You can verify the data segment directly from the WASM:

```bash
wasm-objdump -s lock.wasm | sed -n '/Data\[0\]/,/^$/p'
```

Or run the browser harness locally:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000/browser.html
```

Paste:

```text
tibeb{wasm_lock_626955ef5b1eef4750eb}
```

It should print `Unlocked`.

---

## Flag

```text
tibeb{wasm_lock_626955ef5b1eef4750eb}
```

---

## Tricky / interesting notes

1. **The WASM memory has two regions**
   - Offset `0` is where the browser writes your input.
   - Offset `1024` is where the embedded comparison data lives.

2. **The check is a simple XOR**
   - The key is `90` decimal = `0x5A`.
   - Every byte is checked independently.

3. **Escaped control bytes**
   - In `wasm-decompile` output, `\05` means byte `0x05`.
   - If you manually copy the string, do not treat `\05` as literal backslash-zero-five. That would give the wrong flag.

4. **Length check**
   - The function first checks `b == 37`.
   - The recovered flag is exactly 37 bytes long.

Final answer:

```text
tibeb{wasm_lock_626955ef5b1eef4750eb}
```
