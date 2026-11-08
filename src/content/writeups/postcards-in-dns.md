## Challenge files

```bash
ls
# bundle.zip  postcards.pcap
```

We only need `postcards.pcap`.

---

## 1. Basic recon

```bash
file postcards.pcap
capinfos postcards.pcap
```

This is a small pcap: 10 packets, about 9 seconds, Ethernet capture.

Then list DNS queries:

```bash
tshark -r postcards.pcap -Y dns -T fields \
  -e frame.number -e ip.src -e ip.dst -e dns.qry.name -e dns.qry.type
```

Output:

```text
1	192.0.2.10	192.0.2.53	001.obxxg5ddmfzgi427.dispatch.test	1
2	192.0.2.10	192.0.2.53	004.pu.dispatch.test	1
3	192.0.2.10	192.0.2.53	002.gqyggmrvmnsdsojx.dispatch.test	1
4	192.0.2.10	192.0.2.53	000.oruwezlcpnsg4427.dispatch.test	1
5	192.0.2.10	192.0.2.53	001.obxxg5ddmfzgi427.dispatch.test	1
6	192.0.2.10	192.0.2.53	assets.library.test	1
7	192.0.2.10	192.0.2.53	000.oruwezlcpnsg4427.dispatch.test	1
8	192.0.2.10	192.0.2.53	weather.library.test	1
9	192.0.2.10	192.0.2.53	003.gi2gkodcmu2dozrx.dispatch.test	1
10	192.0.2.10	192.0.2.53	time.library.test	1
```

---

## 2. Identify the real postcards

The interesting queries are:

```text
<number>.<data>.dispatch.test
```

The `library.test` queries are background noise:

```text
assets.library.test
weather.library.test
time.library.test
```

Also notice duplicates:

- `000` appears twice
- `001` appears twice

These are retries and must be deduplicated.

---

## 3. Extract unique numbered postcards

Use `tshark`, `awk`, and `sort`:

```bash
tshark -r postcards.pcap -Y 'dns.qry.name contains ".dispatch.test"' \
  -T fields -e dns.qry.name \
| awk -F. '{print $1, $2}' \
| sort -k1,1n -u
```

Output:

```text
000 oruwezlcpnsg4427
001 obxxg5ddmfzgi427
002 gqyggmrvmnsdsojx
003 gi2gkodcmu2dozrx
004 pu
```

The first column is the postcard number.  
The second column is the encoded chunk.

---

## 4. Reassemble and decode

Concatenate the chunks in numeric order:

```text
oruwezlcpnsg4427
obxxg5ddmfzgi427
gqyggmrvmnsdsojx
gi2gkodcmu2dozrx
pu
```

Combined:

```text
oruwezlcpnsg4427obxxg5ddmfzgi427gqyggmrvmnsdsojxgi2gkodcmu2dozrxpu
```

This is Base32. It uses lowercase letters and digits `2-7`.  
Python’s Base32 decoder expects uppercase and correct padding.

Decode it:

```bash
python3 - <<'PY'
import base64

chunks = {
    "000": "oruwezlcpnsg4427",
    "001": "obxxg5ddmfzgi427",
    "002": "gqyggmrvmnsdsojx",
    "003": "gi2gkodcmu2dozrx",
    "004": "pu",
}

s = ''.join(chunks[k] for k in sorted(chunks))
s += '=' * ((8 - len(s) % 8) % 8)
print(base64.b32decode(s.upper()).decode())
PY
```

Output:

```text
tibeb{dns_postcards_40c25cd99724e8be47f7}
```

---

## 5. Fully automated one-liner

This does everything from the pcap to the flag:

```bash
tshark -r postcards.pcap -Y 'dns.qry.name contains ".dispatch.test"' \
  -T fields -e dns.qry.name \
| awk -F. '{print $1, $2}' \
| sort -k1,1n -u \
| awk '{printf "%s", $2}' \
| python3 -c 'import sys, base64; s=sys.stdin.read().strip(); s += "="*((8-len(s)%8)%8); print(base64.b32decode(s.upper()).decode())'
```

Output:

```text
tibeb{dns_postcards_40c25cd99724e8be47f7}
```

---

## 6. Flag

```text
tibeb{dns_postcards_40c25cd99724e8be47f7}
```

---

## Tricky / interesting parts

1. **Data is hidden in DNS query names**  
   The query name itself carries the payload. No DNS response is needed.

2. **Retries are deliberate**  
   `000` and `001` appear twice. You must deduplicate before decoding.

3. **Background traffic is deliberate**  
   `assets.library.test`, `weather.library.test`, and `time.library.test` are red herrings. Ignore them.

4. **Base32, not Base64**  
   The alphabet uses `A-Z` and `2-7`. The digits `4` and `7` are valid Base32 characters.

5. **Lowercase Base32**  
   Python’s `base64.b32decode` wants uppercase, so use `.upper()` or `casefold=True`.

6. **Padding matters**  
   The concatenated string is 66 characters. Base32 needs a length multiple of 8, so add `6` padding `=` characters.

7. **Final chunk is short**  
   The last chunk is only `pu`. Do not assume all chunks have the same length. Concatenate everything first, then decode.

8. **Sequence numbers are zero-padded**  
   `000`, `001`, `002`, etc. This makes sorting easy, but numeric sort is safer.

---
