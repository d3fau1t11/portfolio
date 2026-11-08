# Projects and Professional Development Update

This report records the local review before publication. Deployment setup and future release steps are documented in [README.md](../README.md).

Updated locally on **8 November 2026** for **Habtemariam Chuchu**. The intended public URL remains **https://d3fau1t11.github.io/portfolio/**.

## Changes

- Removed the profile picture from the application and production assets. The original user image and an ignored local copy of the generated WebP are preserved. The homepage again uses the original build/test/security diagram, with a text-focused layout on phones.
- Featured **4th Cyber Talent Summer Camp Program** first under **Professional Development — Learning, with something to show.** Its INSA issuer, **Program participation** type and **October 2025 (G.C.)** date remain unchanged. The three previously selected awards remain; four cards form a two-column desktop grid and a one-column phone layout.
- Retained Attendance App, WatchVault and GPA Calculator as the first three projects. Added the eight projects requested by the owner, bringing the showcase to **11**. Attendance App remains featured.
- Added **six** owner-supplied live-site links, including the demo for the existing WatchVault card. Repository and live-site links have separate labels, descriptive accessible names and safe opener settings. GitHub repository links use the official licensed GitHub mark.
- Preserved all **21 credential records**, **30 CTF articles** and **33 static HTML pages**.

## Project evidence

Descriptions use public documentation, relevant source files and the supplied live sites. Remote project code was read as reference material and was not downloaded for execution, installed or run.

| Project | Reviewed public evidence | Presentation |
| --- | --- | --- |
| Green Africa Farms | [Public storefront](https://green-farms.netlify.app/) | Fruit-seedling catalogue, categories and ordering links. Next.js is inferred from the served public asset paths. The owner-supplied repository link is labeled **Private repository**; private source was not inspected. Storefront marketing claims about certification, customer numbers or market leadership are omitted. |
| TrueImpact | [README](https://github.com/d3fau1t11/TrueImpact/blob/main/README.md), [package.json](https://github.com/d3fau1t11/TrueImpact/blob/main/package.json), [live site](https://trueimpact1.netlify.app/) | Team hackathon prototype for founder stories, multilingual processing and consent choices, using Next.js and Supabase. No claim of independently verified access control or sole authorship. |
| Remote Admin Tool | [README](https://github.com/d3fau1t11/Remote-Admin-Tool/blob/main/README.md), [Python transport source](https://github.com/d3fau1t11/Remote-Admin-Tool/blob/main/HTTP%20and%20TCP/Server.py) | GhostShell research proof of concept. High-level networking and message-framing description; operational evasion and injection details are omitted. |
| BookReview | [README](https://github.com/d3fau1t11/IP-final-project-/blob/main/README.md), [live site](https://ip-final-project.vercel.app/) | Internet Programming academic project in progress. Featured books and static reviews; user-submitted reviews remain planned work. |
| Python Reverse TCP | [README](https://github.com/d3fau1t11/Python-Reverse-TCP/blob/main/README.md), [TCP server source](https://github.com/d3fau1t11/Python-Reverse-TCP/blob/main/TCP/Server.py) | Educational Python networking project in progress. Sockets, threads and message exchange; no verified-secure-transport claim. |
| Forge | [README](https://github.com/d3fau1t11/Forge/blob/main/README.md), [frontend manifest](https://github.com/d3fau1t11/Forge/blob/main/frontend/package.json), [backend entry](https://github.com/d3fau1t11/Forge/blob/main/backend/main.py), [database source](https://github.com/d3fau1t11/Forge/blob/main/backend/database/session.py) | Local CTF workspace under development with FastAPI, React, SQLite and WebSockets. Performance, autonomous reliability and project test-count claims are omitted. |
| Social Media Link Hub | [README](https://github.com/d3fau1t11/-Social-Media-Link-Hub/blob/main/README.md), [interaction source](https://github.com/d3fau1t11/-Social-Media-Link-Hub/blob/main/script.js), [live site](https://mezmuredawit.netlify.app/) | Mezmure Dawit Amharic / English community link hub. No phone numbers, coordinates or third-party branding assets were copied into this portfolio. |
| Hary Pictures | [README](https://github.com/d3fau1t11/Hary-Pictures/blob/main/README.md), [project manifest](https://github.com/d3fau1t11/Hary-Pictures/blob/main/project/package.json), [application routes](https://github.com/d3fau1t11/Hary-Pictures/blob/main/project/src/App.tsx), [live site](https://harypictures.netlify.app/) | React / TypeScript photography portfolio with galleries, categorized work and service / contact pages. No performance or independently verified security claims. |
| WatchVault | Existing reviewed project record and [supplied live site](https://watchvaults.netlify.app/) | Added the live-site link to the existing media-tracking project, without creating a duplicate card. |

All six supplied live addresses returned **HTTP 200** during this update. This checks page availability, not every feature of the external applications.

## Scope and preservation

The latest explicit project request authorizes adding the named projects, including Forge and Hary Pictures. Forge is presented as development work. ForgeNext and private internal information remain excluded.

Credential originals, certificate identifiers, recipient variants and verification details remain outside the application and production build. The output verifier retains its public-data checks and explicitly checks the expanded showcase, live-site URLs, four selected credentials and picture removal.

No commits, pushes, deployments, repository settings changes or modifications to other repositories were made.

## Validation

| Check | Result |
| --- | --- |
| TypeScript, ESLint and unit checks | Passed; **14 unit tests** |
| Production build | Passed; **33 static HTML pages** |
| Output verification | Passed; **11 projects**, **six live-site links**, **four featured credentials**, **30 write-ups** and **21 credential records**; no portrait asset |
| Browser suite | **32 tests passed**, covering navigation, filtering, keyboard controls, reduced motion, content without JavaScript, responsive layout and automated WCAG checks |
| Tablet spacing adjustment | Follow-up **1024px viewport test passed**; refreshed screenshot confirms the central graphic label is clear, with no horizontal overflow |
| Visual review | Eight desktop, tablet and mobile captures reviewed; capture recorded **zero browser errors** |
| Original-file preservation | **24 of 24** original files match their earlier SHA-256 hashes; none changed or missing |
| Git state | Existing branch and HEAD unchanged; changes remain uncommitted and unstaged |

The final shared JavaScript bundle is approximately **111.2 KiB gzip**, the deferred article renderer **48.1 KiB**, and CSS **11.1 KiB**, within the existing output budgets. The local preview remains available at **http://127.0.0.1:4173/portfolio/**.
