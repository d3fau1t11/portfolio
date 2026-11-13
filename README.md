# Habtemariam Chuchu — Portfolio

A personal portfolio presenting **Software Developer | Cybersecurity Practitioner | Server Administration**, built with React, TypeScript, Vite, Tailwind CSS, Motion for React and Lucide React.

Portfolio URL: **https://d3fau1t11.github.io/portfolio/**. The repository includes **11 projects**, **six supplied live-site links**, **21 viewable certificates**, **four featured Professional Development credentials**, **30 Tibeb / QIYAS CTF write-ups from October 2026** and **nine Windows Server and virtualization lab walkthroughs**. The lab update contains **97 numbered steps** and **69 reviewed screenshots** and was approved for publication after local review. GitHub Actions validates and publishes the site from **main**.

## Run locally

Use **Node.js 24 LTS** and npm. No database, API keys or environment variables are needed for this portfolio.

~~~sh
npm ci
npm run dev
~~~

Open **http://127.0.0.1:5173/portfolio/**. Collections are at **/portfolio/certifications/**, **/portfolio/writeups/** and **/portfolio/labs/**. Individual article URLs, such as **/portfolio/writeups/old-paper/** and **/portfolio/labs/windows-dhcp-wds/**, also work in development.

To review the production output:

~~~sh
npm run build
npm run verify
npm run preview
~~~

Open **http://127.0.0.1:4173/portfolio/**.

## Validate

~~~sh
npm run check
npm run build
npm run verify
npm run test:e2e
npm audit
~~~

| Command | Purpose |
| --- | --- |
| npm run typecheck | Strict TypeScript checks for application, configuration and tests |
| npm run lint | ESLint, TypeScript and React checks |
| npm test | Credential, write-up and lab discovery, article handling, reviewed images and factual content boundaries |
| npm run build | Typecheck, optimize assets and prerender all 43 static pages |
| npm run verify | Validate every page, navigation anchor, recorded flag, approved asset, content boundary and bundle budget |
| npm run test:e2e | Navigation, filtering, keyboard controls, reduced motion, no-JavaScript content, responsive layout and axe accessibility checks |
| npm audit | Check installed production and development dependencies against current advisories |

On Windows, browser tests use an installed Google Chrome automatically. Otherwise install Playwright's isolated test browser:

~~~sh
npx playwright install chromium
~~~

Linux CI installs browser system dependencies with:

~~~sh
npx playwright install --with-deps chromium
~~~

This browser is a development validation prerequisite. The published website is static and needs no Node.js process or test browser.

## Pages and structure

~~~text
.
├── index.html                     Home page metadata and entry point
├── certifications/index.html      Credential collection entry point
├── writeups/index.html            CTF collection entry point
├── writeups/article.html          Shared article build/development template
├── labs/index.html                Practical lab collection entry point
├── labs/article.html              Shared lab build/development template
├── src/
│   ├── App.tsx                    Shared layout
│   ├── entry-client.tsx           Client hydration and enhancement
│   ├── entry-prerender.tsx         React server rendering
│   ├── assets/                    Self-hosted font
│   ├── components/                Reusable navigation, cards and sections
│   ├── content/writeups/          30 reviewed Markdown articles
│   ├── content/labs/              Nine rewritten JSON lab walkthroughs
│   ├── data/                      Profile, 11 projects, credentials and article metadata
│   ├── lib/                       Filtering, article loading, anchors and base-path links
│   ├── pages/                     Home, collections and article reader
│   └── styles.css                 Tailwind foundation and custom design
├── public/                        Site artwork, reviewed certificate/lab images and crawler files
├── scripts/                       Prerendering and output validation
├── tests/unit/                    Data and search tests
├── tests/e2e/                     Browser and accessibility tests
├── .github/workflows/pages.yml    Validation and Pages deployment
└── docs/                          Milestone, CTF and project update reports
~~~

The home page includes the introduction, an original build/test/security graphic, current education, 11 project cards, a practical lab section with three selected walkthroughs, cybersecurity study and competition experience, three selected CTF articles, four selected credentials and contact links. **4th Cyber Talent Summer Camp Program** leads Professional Development, followed by the existing ISO Lead Auditor, FortiGate Operator and OPSWAT ICIP awards. Credentials provide search, category and featured filters, result announcements, native award details and **View certificate** links. Each opens a keyboard-accessible preview with zoom, direct PDF viewing and PDF download. Images load when the viewer opens; direct document links work without JavaScript. Write-ups provide search by challenge or technique, six category filters, complete article pages, contents links, readable code/table regions and related articles.

The lab collection provides topic search across **nine Windows Server and virtualization exercises**. Each reader explains the environment, numbered work steps, verification, lessons and documented troubleshooting where applicable. Screenshots sit beside the relevant steps with descriptive captions and full-size links. Verification labels distinguish visible evidence from tests described in the private notes.

There is no client-side router. The build produces **43 actual HTML files**: home, credentials, the write-up library and 30 CTF articles, plus the lab library and nine lab readers. Direct navigation, refreshes and GitHub Pages links work without routing fallbacks. Complete initial content, including every article and lab step, is available without JavaScript. Native mobile navigation, contents disclosures and award details continue to work; collections show every record and hide unavailable search controls.

Article Markdown and its renderer are loaded only for CTF article pages; lab JSON bodies load only for their respective readers. The homepage does not fetch the 30 CTF or nine lab bodies. Vite's asset manifest resolves imported assets during prerendering. Shared article templates are expanded into each destination and removed from the generated output; the build also emits a complete sitemap. Small development middleware serves those same article URLs while Vite is running.

The design uses a dark palette, restrained green and blue accents, a self-hosted variable font and original SVG diagrams. Layouts become one column on phones, two columns where appropriate on tablets, and wider grids on desktop. Keyboard focus, a skip link, descriptive landmarks, native controls and reduced-motion preferences are supported.

## Maintain content

Edit the public metadata in:

- **src/data/profile.ts** — name, email, GitHub profile and introductory copy.
- **src/data/projects.ts** — Attendance App, WatchVault and GPA Calculator first, followed by Green Africa Farms, TrueImpact, Remote Admin Tool, BookReview, Python Reverse TCP, Forge, Social Media Link Hub and Hary Pictures. Optional live-site and private-source metadata control the separate project links.
- **src/data/credentials.ts** — exact award titles, issuers, types, dates, expiration and topic metadata.
- **src/data/certificate-assets.json** — reviewed certificate PDF/preview paths, dimensions and file hashes. Update it only after reviewing a replacement display copy.
- **src/pages/HomePage.tsx** — current education and authorized competition statements.
- **src/data/writeups.ts** — challenge titles, summaries, topics, categories and supplied points/difficulty.
- **src/content/writeups/*.md** — article bodies, code examples, recorded outputs and flags.
- **src/data/labs.json** — public lab titles, summaries, subject categories, topics and counts.
- **src/content/labs/*.json** — rewritten environments, numbered steps, verification, lessons and troubleshooting.
- **src/data/lab-assets.json** — reviewed screenshot paths, dimensions, captions and SHA-256 hashes.
- **public/labs/screenshots/** — only the approved WebP display copies.

Keep article filenames aligned with metadata slugs. Points and difficulty are omitted when the supplied notes do not establish them. Event timing stays at **October 2026** precision. Search uses titles, summaries and topic metadata. New articles also require updating the fixed collection counts in metadata, tests and the build verifier.

Lab evidence must remain aligned with the walkthrough and reviewed asset manifest. Review replacement images visually and for secrets before updating their hashes. The verifier rejects changed/unlisted images, original reports, activity files, archives, virtual-machine media, private paths and key material. It also checks all 97 step anchors and the screenshot references.

The article renderer skips raw HTML, keeps code examples inert, allows web references and heading anchors, and gives external links safe opener settings. Do not add challenge downloads or execute article commands as part of the portfolio build. The published notes describe the supplied CTF record; this update did not reproduce the historical challenge services or binaries.

Use **siteUrl()** for links between pages. Vite's **base** is **/portfolio/**; imported assets are rewritten to that path during the build. Keep canonical URLs, social metadata, sitemap and robots file aligned if the deployment URL changes.

Every public page has a unique title, description, matching canonical/social URL and crawler metadata permitting indexing. The build emits all **43 canonical URLs** in the sitemap and structured data for the owner, website, profile, collections, articles and breadcrumbs. Server Administration appears in the introduction, skills, footer, search descriptions and the owner's public skill metadata. The output verifier checks crawler access, canonical URLs, valid structured data and exact sitemap coverage. Google controls crawl timing, indexing and rankings; Search Console submission requires the owner's Google account.

Credential types distinguish competency awards, course and training completions, non-accredited courses, nanodegrees and participation. Three Fortinet dates are omitted pending confirmation of the numeric date convention. Month-level source dates remain at month precision.

The national University CTF result is presented as **5th place, solo competitor** under the owner's explicit instruction. HTB placement and scores remain team results. The conflicting CyberShield rank is omitted. Project descriptions use reviewed public source or live-site evidence and make no claims about adoption, measured users, independently validated security or sole authorship. TrueImpact is a team hackathon prototype; BookReview is an academic project in progress; Remote Admin Tool, Python Reverse TCP and Forge are presented as lab research or development work.

The six owner-supplied live sites belong to WatchVault, Green Africa Farms, TrueImpact, BookReview, Social Media Link Hub and Hary Pictures. Green Africa Farms now has a **public repository**. Its reviewed source confirms Next.js, React, TypeScript and Tailwind CSS, catalogue search/category filters, a cart persisted in localStorage and WhatsApp checkout. The summer camp keeps its source-backed **Program participation** type and **October 2025 (G.C.)** date.

## Protect original documents

The existing **Cers/** directory and **CERTIFICATES.md** are private source material, preserved locally and excluded by **.gitignore**. They are not imported by the app or copied to the build. Credential metadata contains no certificate IDs, recipient aliases, verification tokens, original filenames or private paths.

The owner's certificate-viewing request authorizes the **21 reviewed display copies** in **public/certificates/**. Each has a WebP preview and a PDF built from the reviewed pixels, retaining the award wording, recipient name, dates and issuer information. Certificate IDs, personal verification links and QR verification codes are removed from the copies. Sideways scans are corrected, and blank printer-overflow pages are omitted. Hidden source metadata and original PDF annotations are not carried into the display PDFs.

The output verifier allows exactly the **42 reviewed certificate assets**, checks their file signatures and SHA-256 hashes, and rejects unreviewed documents, private-path patterns, excluded claims and artwork outside its approved list. It checks certificate viewing links, picture removal, the 11-project showcase, the six supplied live-site links and the four featured credentials. Historical challenge URL identifiers are allowed only under **challenges.tibeb.org**; certificate identifiers remain blocked. ForgeNext and private internal information remain excluded.

The included media consists of portfolio branding, original diagrams and the licensed GitHub mark. The generated portrait is preserved in ignored local artifacts and is absent from the application and production build. Certificate scans and project screenshots need their own publication review before adding them. The six supplied live-site links are authorized by the owner's project update. The verifier supplements review; it is not a comprehensive personal-data scanner.

Source reports and activity files remain private and outside the published content. The public lab pages are newly written explanations with cropped screenshot copies. Personal file paths, key/password values, PXE machine identifiers and the VPN session identity are excluded; image metadata is stripped. Original DOC/DOCX/PDF reports, activity files, installation media and VM files are ignored and rejected from the build. The existing reviewed certificate PDFs remain allowed. Notes-only testing and unmeasured outcomes are labeled accordingly.

Inspect files before staging. Ignoring a file does not remove it if someone has already tracked it. Only **dist/** is uploaded by the Pages workflow. The lab update must be approved in the local preview before a push or deployment.

## Publish with GitHub Pages

The workflow validates pull requests to **main**. A push to **main**, or a manual run on **main**, validates and deploys the built **dist/** artifact. The deployment job alone has **pages: write** and **id-token: write**; action versions are pinned to verified commit references.

When ready to release:

1. Review the working tree, public content and validation report.
2. In the repository's **Settings → Pages**, choose **GitHub Actions** as the publishing source.
3. Commit and push the reviewed source to **main**, or manually run the workflow after the source exists on GitHub.
4. Confirm the workflow succeeds and review the home page, collections and article URLs.

The repository is public. GitHub Pages uses **GitHub Actions** as its publishing source. After the initial setup, future pushes to **main** run the same validation and deployment automatically. The **Actions** tab shows progress and any failure details.

## Dependencies and licensing

React and React DOM provide the interface; Motion supplies restrained hover motion; Lucide supplies interface icons. **react-markdown 10.1.0** renders the CTF notes and **remark-gfm 4.0.1** supports their tables and other GitHub-style Markdown. Vite, TypeScript, Tailwind, ESLint, Vitest, Playwright, axe and type definitions are development/build tools.

The **minimatch** override pins version **11.0.1** to resolve development-tool advisory **GHSA-g3hv-75wg-m249** while upstream lint packages still request version 10. Reassess the override when those packages update their supported dependency range.

The self-hosted Manrope font is licensed under the **SIL Open Font License**, included at **public/licenses/Manrope-OFL.txt**. No license for the owner's portfolio source or credential documents has been selected.

The official GitHub mark comes from [Primer Octicons](https://github.com/primer/octicons/blob/main/icons/mark-github-16.svg), with its MIT license at **public/licenses/GitHub-Octicons-MIT.txt**. Profile and project repository links use this mark. The user's original image is preserved locally.

Validation reports: **docs/MILESTONE_1_REPORT.md** records the original MVP; **docs/CTF_AND_PORTRAIT_UPDATE.md** records the CTF library and former portrait addition; **docs/PROJECTS_AND_DEVELOPMENT_UPDATE.md** records the project and Professional Development update; **docs/CERTIFICATE_VIEWING_UPDATE.md** records certificate viewing and the public Green Africa Farms review; **docs/LABS_UPDATE.md** records the lab content and screenshot review.

Recommended follow-up: develop concise project case studies with confirmed roles, repeatable project validation, grading/security assumptions and approved screenshots; then perform additional browser and assistive-technology review before public release.
