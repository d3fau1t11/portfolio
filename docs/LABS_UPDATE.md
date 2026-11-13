# Practical lab portfolio update

The portfolio has nine Windows Server and virtualization walkthroughs with 97 numbered steps and 69 reviewed screenshots. Each reader explains the task, environment, work steps, checks and lessons. Screenshots appear beside the relevant steps and open at full size.

The work covers Active Directory deployment, DHCP and Windows Deployment Services, account and folder access controls, software RAID, RRAS VPN/NAT, domain-controller replication, external trusts, IIS Network Load Balancing and nested ESXi troubleshooting. The homepage features three walkthroughs, and the collection provides topic search. All readers are prerendered into static HTML and remain readable without JavaScript.

## Evidence review

Private notes were rewritten into portfolio explanations. Visible screenshots are distinguished from tests described only in the notes. The Windows DHCP scope includes the pictured exclusion range and explains the additional exclusion/reservation needed for the static controller. The storage initialization dialog has GPT selected; partition style is distinguished from RAID layout. Account/share permissions and PPTP are presented as training choices.

Replication captures show the recorded DC01 source/DC02 destination result with 0/5 failures. Trust images show reciprocal listings and share discovery. NLB images show convergence and two node responses without measured distribution or controlled failover claims. ESXi captures show the resource settings and Windows boot logo without claiming a completed guest OS installation or performance benchmark.

## Public-content boundaries

The collection contains only the nine retained server/virtualization exercises. The excluded networking walkthroughs, screenshot files and course-specific labels are absent from the generated site and public lab data. Screenshot paths use a neutral screenshots directory.

Only rewritten public JSON and 69 approved WebP screenshots are included. Original reports, activities, archives, installation images and virtual-machine files remain private. Personal paths and authentication fields were cropped out or replaced with opaque pixels. PXE MAC/GUID lines, an ESXi link-local machine identifier and the VPN username were removed. Display copies have no EXIF/XMP metadata; SHA-256 hashes bind the manifest to the reviewed files. The GPT control's “GUID Partition Table” text is a setting name, not a machine identifier.

The verifier checks 43 static pages, all nine walkthroughs, 97 step anchors, approved image hashes, sitemap entries and existing certificate/CTF boundaries. It rejects unexpected lab pages/assets, excluded course references, original reports, private paths and key material.

## Validation and release

Validation on 13 November 2026 passed: strict TypeScript checks, lint, all 21 unit tests, the production build and output verifier, and all 43 browser tests. Browser checks cover direct URLs, search, full-size image links, content without JavaScript, mobile/tablet/desktop layouts and automated accessibility checks. Preview captures show no page errors or mobile overflow. All 69 retained screenshots preserve their reviewed hashes, and local OCR found no excluded course labels.

The owner reviewed the local preview and authorized publication on 13 November 2026. The approved release also adds Server Administration to the profile, skills and search metadata, with crawlable static pages, canonical URLs, a complete sitemap and structured data. The Pages workflow validates the reviewed source and publishes only **dist/** to **https://d3fau1t11.github.io/portfolio/**.
