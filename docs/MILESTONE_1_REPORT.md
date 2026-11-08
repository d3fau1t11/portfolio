# Portfolio MVP — Milestone 1

This report records the original two-page milestone. Later work is documented in [CTF_AND_PORTRAIT_UPDATE.md](CTF_AND_PORTRAIT_UPDATE.md) and [PROJECTS_AND_DEVELOPMENT_UPDATE.md](PROJECTS_AND_DEVELOPMENT_UPDATE.md).

Completed locally on **8 November 2026** for **Habtemariam Chuchu**. Intended URL: **https://d3fau1t11.github.io/portfolio/**.

The functional MVP, production output, documentation and deployment workflow are ready for owner review. Nothing was committed, pushed or deployed.

## 1. Implemented features

- A home page with the requested software-development and cybersecurity identity, introduction, project/contact actions and accurate contact links.
- Current BSc Computer Science study at Unity University, expected graduation 2027, and an in-progress IBT College of Canada cybersecurity training program.
- Exactly three showcased projects, in order: **Attendance App**, **WatchVault**, **GPA Calculator**. Each has a problem, approach, technology list and repository link.
- An original Attendance App architecture diagram showing mobile and administration clients, Express API, PostgreSQL, Drizzle/Supabase and a shared attendance core. It is explicitly an architecture overview.
- Cybersecurity study areas and competition experience: the authorized national University CTF **5th place as a solo competitor**, and HTB participation with explicitly attributed team placement.
- Three selected awards and a separate collection of **21 source-backed credential metadata records**, with search, category and featured filters, result announcements, reset/focus behavior and native award disclosures.
- Working email/GitHub links, mobile navigation, keyboard controls and reduced-motion support.
- Two prerendered static pages, descriptive metadata, canonical links, original social artwork, favicon, sitemap and crawler file. No routing fallback or application server is required.

## 2. Final structure

~~~text
portfolio/
├── index.html
├── certifications/index.html
├── src/
│   ├── App.tsx
│   ├── entry-client.tsx
│   ├── entry-prerender.tsx
│   ├── assets/
│   ├── components/
│   ├── data/
│   ├── lib/
│   ├── pages/
│   └── styles.css
├── public/
├── scripts/
├── tests/{unit,e2e}/
├── .github/workflows/pages.yml
├── docs/MILESTONE_1_REPORT.md
└── README.md
~~~

Content lives separately from rendering components. Vite builds the two HTML entry points; a React server-rendering step fills their initial content. The browser hydrates that HTML and adds discovery controls. All credential content and native disclosures remain usable without JavaScript; unavailable search controls are hidden in that mode.

## 3. Design and responsive behavior

The design uses a dark background, restrained green/blue accents, Manrope typography, clear section hierarchy, fine borders and spacious layouts. The development/testing/security illustration and architecture graphic are original code-based visuals.

The hero illustration is shown on wider screens. Cards and education layouts collapse into readable phone layouts; tablets use appropriate two-column arrangements. The navigation switches to a native mobile disclosure with keyboard Escape and outside-click dismissal.

Verified widths: **320, 390, 768, 1024 and 1440 pixels**, on both pages. No horizontal overflow remained. Desktop and mobile screenshots were inspected, including project, security, credential and contact layouts. Motion remains restrained; reduced-motion preferences disable decorative CSS transitions and smooth scrolling.

Accessibility work includes one primary heading per page, named sections and navigation, meaningful award types, labels and pressed states, live result counts, visible keyboard focus, a skip link and native controls.

## 4. Files created and preserved

**43 reviewable source/configuration/documentation files were added. No pre-existing file was modified.**

| Area | New files |
| --- | --- |
| Foundation | .gitignore; package.json; package-lock.json; tsconfig.json; vite.config.ts; vitest.config.ts; eslint.config.js; playwright.config.ts |
| Page entries | index.html; certifications/index.html |
| Application | src/App.tsx; src/entry-client.tsx; src/entry-prerender.tsx; src/styles.css; src/assets/manrope-latin.woff2 |
| Components | src/components/ContactSection.tsx; CredentialCard.tsx; FeaturedCredentials.tsx; Hero.tsx; ProjectSection.tsx; SectionHeading.tsx; SiteFooter.tsx; SiteHeader.tsx |
| Data and helpers | src/data/profile.ts; src/data/projects.ts; src/data/credentials.ts; src/lib/credentials.ts; src/lib/urls.ts |
| Pages | src/pages/HomePage.tsx; src/pages/CredentialsPage.tsx |
| Public assets | public/favicon.svg; public/social-card.svg; public/social-card.png; public/robots.txt; public/sitemap.xml; public/licenses/Manrope-OFL.txt |
| Build checks | scripts/prerender.mjs; scripts/verify-build.mjs |
| Tests | tests/unit/credentials.test.ts; tests/e2e/portfolio.spec.ts |
| Deployment | .github/workflows/pages.yml |
| Documentation | README.md; docs/MILESTONE_1_REPORT.md |

The initial repository had no application stack or package/workflow files. It contained one tracked **.gitattributes** file plus existing certificate originals and inventories. The branch was **main**, tracking **origin/main**.

All **24 original non-Git files** were compared with their prior SHA-256 records: **zero changes**. The original credentials and inventories remain local and are ignored by Git. The tracked diff is empty; the new portfolio files remain unstaged/untracked for review.

Generated dependencies, production output and browser traces are ignored. Temporary review helpers in **artifacts/** and review screenshots outside the repository are also excluded from publication.

## 5. Dependencies and purpose

| Scope | Dependencies | Purpose |
| --- | --- | --- |
| Browser runtime | react 19.3.1; react-dom 19.3.1 | Interface and hydration |
| Browser runtime | motion 14.10.1 | Restrained interaction motion with reduced-motion configuration |
| Browser runtime | lucide-react 1.70.0 | Consistent icons |
| Development | vite 8.3.6; @vitejs/plugin-react 6.2.1; typescript 5.9.3 | Development server, optimized build and strict typing |
| Development | tailwindcss 4.3.5; @tailwindcss/vite 4.3.5 | Styling foundation and design tokens |
| Development | eslint 10.14.0; @eslint/js 10.0.1; typescript-eslint 8.72.1; eslint-plugin-react-hooks 7.1.1; eslint-plugin-react-refresh 0.5.7; globals 17.14.0 | Source and React checks |
| Development | vitest 5.1.0 | Credential filtering and public-data tests |
| Development | @playwright/test 1.65.0; @axe-core/playwright 4.14.0 | Browser behavior, responsive and accessibility checks |
| Development | @types/node 24.19.2; @types/react 19.3.0; @types/react-dom 19.3.0 | Type definitions |

TypeScript 5.9 was selected within typescript-eslint's supported range. A **minimatch 11.0.1** override resolves the transitive development-tool denial-of-service advisory **GHSA-g3hv-75wg-m249**. Linting and tests pass with it. Reassess the override when upstream tools adopt the patched dependency.

The Manrope variable font is self-hosted, with its SIL Open Font License included. Bundled Sharp generated the original social PNG; Sharp was not added to the project. A temporary **js-yaml 5.5.0** tool was run from npm's isolated cache for workflow validation; it was not added to application dependencies.

## 6. Build and test results

Environment: **Windows**, **Node.js 24.16.0**, **npm 11.13.0**, installed Google Chrome.

| Exact command/check | Result |
| --- | --- |
| npm install --no-fund --no-audit | Passed; dependencies and lockfile installed |
| npm run check | Passed: TypeScript, ESLint and all **7 unit tests** |
| npm run build | Passed: optimized assets and two prerendered pages |
| npm run verify | Passed: emitted assets, page/anchor links, 21 credential records, original-artwork allowlist, public-content boundaries and bundle budgets |
| npm run test:e2e | **16 passed** |
| npm run lint | Passed after final source/script edits |
| npm audit --json | **0 vulnerabilities**, including development dependencies |
| npx --yes --package=js-yaml@5.5.0 js-yaml .github/workflows/pages.yml | YAML parsed successfully using an isolated validation tool |
| node artifacts/validate-workflow.mjs | Passed: triggers, validation commands, immutable action references, artifact path and deployment permissions |
| Original-file SHA-256 comparison | **24 checked; 0 changed** |
| Git status/diff and HEAD review | New files only; original tracked state and commit unchanged |

Browser coverage includes exact project/contact targets, both page destinations, missing-resource and JavaScript-error detection, intersecting filters, clear/reset/focus behavior, award deep links, native keyboard disclosures, mobile menu dismissal, skip navigation, reduced motion and content with JavaScript disabled.

Automated axe checks found **zero violations** under WCAG A/AA tags on both pages at **390px and 1440px**, including expanded details/mobile navigation. This documents automated coverage; a screen-reader session and additional browser engines have not been tested.

Compressed bundle measurements were approximately **108.7 KiB JavaScript** and **8.5 KiB CSS**, plus the **24.5 kB** self-hosted font. No remote font request or third-party analytics is required.

## 7. GitHub Pages status

Vite's base is **/portfolio/**. All internal navigation, imported assets and both real HTML destinations work under that subpath.

The workflow checks pull requests to **main**. A push to **main**, or manual run on **main**, builds, verifies, tests and uploads **dist/** before a deployment job. Pull requests do not publish. Only deployment receives **pages: write** and **id-token: write**, with the **github-pages** environment.

Official action release references were verified and pinned to immutable commits. Workflow syntax and structure were validated locally. It has **not run on GitHub**, because this task does not push the source. At initial inspection, Pages was not enabled; this task changed no Pages/account settings.

## 8. Prerequisites and owner actions

No additional local production prerequisite is missing. Node/npm and Chrome were already available. The published artifact is static; it needs no database, API keys, running Node.js server or browser automation runtime.

On another machine, use **Node.js 24 LTS**, run **npm ci**, then follow README. Browser validation requires Chrome on Windows or Playwright's isolated Chromium installation; Linux CI installs that test browser automatically.

The bundled Python environment lacked a YAML parser. Workflow validation was completed with the isolated npm tool described above, without changing Python or production requirements. No owner installation is needed for that one-time check.

To publish after review, the owner must select **GitHub Actions** in repository **Settings → Pages**, then commit/push the reviewed source or run the workflow after it exists remotely. Review both public URLs after the workflow finishes.

No portfolio code/document license preference was invented. The owner can select one separately.

## 9. Facts and assets omitted

- Three Fortinet numeric dates remain unnormalized until the issuer convention is confirmed.
- The disputed CyberShield placement is omitted.
- University CTF date and organizer are omitted because neither was established; the owner-authorized solo national result is included.
- Project deployment, organizational adoption, user counts, performance statistics, full independent build validation, comprehensive production security and sole-authorship claims are omitted.
- Certificate scans, IDs, verification links/tokens, recipient aliases, original filenames and private paths are absent from public data/build output.
- Project screenshots and live demo links were not added without publication review. The included diagrams and social artwork are original portfolio branding.
- Excluded and improvement-required projects are outside the public showcase.

## 10. Remaining work and next milestone

No known blocking MVP defect remains after the recorded checks. Public deployment awaits the owner's review and release steps.

Recommended next milestone: concise project case studies with confirmed contribution roles, reproducible project validation, documented grading/security assumptions and approved screenshots. Confirm Fortinet date conventions, and add manual assistive-technology and additional-browser review before release.

## 11. Git safety confirmation

The portfolio repository is the only repository modified. Original files were preserved. No reset, stash, clean, discard, commit, push, force-push, remote repository edit, visibility change or deployment was performed.

The branch remains **main**, and HEAD remains **397b45bb7a361917dc033ef0864c8e6f116cc889**. All deliverable changes are available locally for review.
