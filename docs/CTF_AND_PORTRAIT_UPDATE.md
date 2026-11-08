# Portrait, GitHub Mark and CTF Library Update

This report preserves the earlier update. The profile picture was subsequently removed, and the expanded projects and featured summer camp are documented in [PROJECTS_AND_DEVELOPMENT_UPDATE.md](PROJECTS_AND_DEVELOPMENT_UPDATE.md).

Completed locally on **8 November 2026** for **Habtemariam Chuchu**. The intended deployment remains **https://d3fau1t11.github.io/portfolio/**. Changes remain in the working tree for review; nothing was committed, pushed or deployed.

## Delivered

- The supplied portrait appears in a restrained frame on desktop and a compact frame above the introduction on mobile. Black sidebars were cropped, metadata was removed and the original was preserved. The WebP is **230 × 300 pixels, 5,768 bytes**.
- All three GitHub profile links use the official Primer Octicons GitHub mark. Its MIT license is included.
- A homepage CTF section features **The Template Loom**, **Borrowed Badge** and **Pixel Weave**.
- A searchable library includes all **30 supplied write-ups**, with five articles in each of six categories: Web, Cryptography, Binary exploitation, Reverse engineering, Forensics and Miscellaneous.
- Individual readers include challenge metadata, topics, contents links, fenced code, scrollable tables, related articles and return navigation. Contents collapse natively on mobile.
- All pages have descriptive titles, canonical URLs and an updated sitemap. Article pages also contain Article structured data.

## Pages and implementation

The production build emits **33 real static HTML pages**:

| Destination | Content |
| --- | --- |
| `/portfolio/` | Existing portfolio with portrait and selected write-ups |
| `/portfolio/certifications/` | Existing 21 public-safe credential records |
| `/portfolio/writeups/` | Searchable 30-article library |
| `/portfolio/writeups/<slug>/` | One complete HTML reader for each challenge |

The Vite base remains `/portfolio/`. Direct article URLs and refreshes work in the production preview and in development. No routing fallback or production server is required. Every article is readable with JavaScript disabled; filtering is progressively added when JavaScript is available.

Article bodies are separate lazy-loaded Markdown modules, and the Markdown renderer is deferred until a reader is opened. Browser checks confirm that the homepage loads no article bodies and a reader loads only its selected body. The asset manifest resolves the optimized portrait during prerendering.

## Created and modified files

| Area | Files |
| --- | --- |
| Portrait and brand icon | `src/assets/habtemariam-portrait.webp`, `src/components/GitHubIcon.tsx`, `public/licenses/GitHub-Octicons-MIT.txt` |
| Homepage and navigation | `Hero.tsx`, `ContactSection.tsx`, `SiteFooter.tsx`, `SiteHeader.tsx`, `HomePage.tsx`, `src/styles.css` |
| Article source | `src/content/writeups/` contains 30 reviewed Markdown files |
| Article data and helpers | `src/data/writeups.ts`, `src/lib/writeups.ts`, `writeup-content.ts`, `writeup-template.ts` |
| Components and readers | `WriteupCard.tsx`, `WriteupSection.tsx`, `ArticleContent.tsx`, `WriteupsPage.tsx`, `WriteupPage.tsx` |
| Rendering and build | `App.tsx`, both entry modules, `writeups/index.html`, `writeups/article.html`, `vite.config.ts`, `scripts/prerender.mjs`, `scripts/verify-build.mjs`, sitemap |
| Dependencies | `package.json`, `package-lock.json` |
| Verification and documentation | `tests/unit/writeups.test.ts`, `tests/e2e/writeups.spec.ts`, `README.md`, this report and the historical milestone note |

Local import helpers and review screenshots are validation artifacts and are excluded from the repository. Existing projects, credential metadata, original documents and unrelated user files were preserved.

## Content review

The owner supplied fourteen attachments and sixteen inline write-ups, identifying them as **Tibeb / QIYAS CTF, October 2026**. No exact event dates, ranking, points or difficulty were invented. Challenge code, commands, URLs and flags are educational article content; no challenge services were contacted and no supplied exploit scripts were executed during this update.

Editing preserves the recorded methods and flags while removing repetitive assistant suggestions and incidental session details. Technical qualifications include:

- **Old Paper:** the nested robots file is a challenge clue; root-relative robots directives do not generally become relative to the robots file's directory.
- **The Template Loom:** accepted and rejected payloads do not establish the complete filtering policy.
- **Borrowed Badge:** allocation reuse is specific to the observed environment; dereferencing a freed pointer is undefined behavior in C.
- **Night Return / Two Seals:** offsets, addresses and alignment depend on the compiled environment. Two Seals contains six words after 72 bytes of padding, for **120 bytes** total; the symbol capture needed by its example is included.
- **Someone Else’s Receipt:** authorization must be checked for each object; random identifiers alone do not fix IDOR.
- **Erased Ledger:** deleted bytes may survive depending on secure-delete settings, page reuse and vacuuming.
- **Nonce Echo:** repeated `r` suggests nonce reuse; validating the recovered key against the public key supports the result.
- **Sixteen Brass Dials:** despite its title, the supplied checker describes a **37-byte input** and a **37 × 37** system.

An unfinished flag fence was closed. Mathematical expressions are rendered as readable text equations. Escaped brackets and byte sequences inside code blocks remain literal.

## Dependencies and privacy

Added production dependencies are **react-markdown 10.1.0** and **remark-gfm 4.0.1**, providing Markdown rendering and table support. Image processing used the existing bundled Sharp utility only; it is not a portfolio runtime dependency. No new user installation, database, account or API key is required.

The renderer skips raw HTML, displays fenced code as inert text and restricts links to web references and local heading anchors. Certificate originals, IDs, recipient aliases and verification details remain excluded. The build verifier approves the portrait by its exact hash and allows UUIDs only in historical references under the known challenge host. It separately checks the unchanged three-project showcase.

## Validation

| Command or review | Result |
| --- | --- |
| `npm run check` | TypeScript and ESLint pass; **14 unit tests pass** |
| `npm run build` | Optimized client assets and **33 complete static pages** generated |
| `npm run verify` | All pages, assets, anchors, recorded flags, sitemap entries and public-data boundaries pass |
| `npm run test:e2e` | **32 browser tests pass** |
| `npm audit --json` | **0 reported vulnerabilities** across production and development dependencies |
| Development routes | Home, library and representative direct article URLs return their correct pages |
| Responsive checks | Home, credentials, library and representative code/table/math readers fit **320, 390, 768, 1024 and 1440 px** viewports |
| Accessibility | Automated WCAG checks pass for tested pages at 390 and 1440 px; keyboard navigation, contents, filtering, disclosures and reduced motion checked |
| JavaScript disabled | All **30 article URLs** return their own complete readable HTML; native contents navigation works |
| Visual review | Desktop/mobile portrait, featured cards, library, reader, equations, code and tables inspected; review capture logged **0 browser errors** |
| Original-file integrity | All **24 original files** match the initial SHA-256 baseline; **0 changed or missing** |
| Git review | Branch remains `main`, the original HEAD is unchanged, and no tracked or staged files were modified |

The largest emitted JavaScript files are approximately **108.9 KiB gzip** for the common client and **48.1 KiB gzip** for the deferred renderer. Styles are **10.9 KiB gzip**. The configured bundle budgets pass.

Automated accessibility checks cover the tested interface; a full assistive-technology review remains useful before release. Historical challenge results are source notes, rather than newly reproduced tests.

## Release status and follow-up

The existing GitHub Pages workflow remains prepared and unchanged. Only the built `dist/` artifact is configured for upload. Repository visibility, account settings and Pages settings were not changed. The owner can review the local preview and decide when to release the source.

Recommended next work is approved project case studies and screenshots, followed by additional browser and assistive-technology review. New CTF events can be added with verified metadata and updated collection counts.

No commit, push, deployment or destructive Git action was performed.
