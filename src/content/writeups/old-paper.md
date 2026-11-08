## 1. Initial recon

Open the challenge URL in a browser:

```text
https://challenges.tibeb.org/073bb21e-7bd9-4505-8e1c-a5288c114da4/
```

The visible page only says:

```text
Tibeb · old-paper
The new archive is almost ready.
```

The hint says:

> The festival archivist replaced the front page, but forgot that browsers keep reading past what they display.

That points toward **HTML source code**, especially comments or hidden elements.

---

## 2. View the page source

In Parrot OS, you can use `curl` or the browser’s `View Source`.

Using `curl`:

```bash
curl -sL 'https://challenges.tibeb.org/073bb21e-7bd9-4505-8e1c-a5288c114da4/' -o oldpaper.html
```

Search the raw HTML:

```bash
grep -niE 'robots|staff|note|hidden|tibeb\{|<!--' oldpaper.html
```

Output reveals an HTML comment:

```html
<!-- migration checklist: review robots.txt -->
```

So the next step is to check `robots.txt`.

---

## 3. Check robots.txt under the challenge path

The HTML comment leads to a challenge-specific `robots.txt` file under the challenge prefix.

Fetch the challenge-specific `robots.txt`:

```bash
curl -sL 'https://challenges.tibeb.org/073bb21e-7bd9-4505-8e1c-a5288c114da4/robots.txt'
```

Output:

```text
User-agent: *
Disallow: /staff/retired-note.txt
```

This tells us there is a hidden path:

```text
/staff/retired-note.txt
```

---

## 4. Fetch the disallowed file

In standard robots rules, a path beginning with `/` refers to the origin root. This challenge uses the nested robots file as a puzzle clue. The recorded solution tested the staff path under the challenge prefix and found the note there:

```bash
curl -sL 'https://challenges.tibeb.org/073bb21e-7bd9-4505-8e1c-a5288c114da4/staff/retired-note.txt'
```

Output:

```text
Retired staff dispatch: tibeb{old_paper_632aa86068f902e8aaac}
```

---

## 5. Flag

```text
tibeb{old_paper_632aa86068f902e8aaac}
```

---

## Key takeaway

The challenge relied on two common web CTF tricks:

1. **HTML comments are not displayed but are still readable in source.**
2. **`robots.txt` can leak hidden or disallowed paths.**

The successful path is specific to this exercise, rather than a general rule for resolving robots directives. In the recorded requests:

```text
https://challenges.tibeb.org/staff/retired-note.txt
```

returned 404, but:

```text
https://challenges.tibeb.org/073bb21e-7bd9-4505-8e1c-a5288c114da4/staff/retired-note.txt
```

worked.
