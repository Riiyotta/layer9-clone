# Acme landing-page design-repo

<!-- counts: {"allowlistEntries": 57, "assetRoles": 9, "componentTokens": 111, "components": 26, "foundationTokens": 433, "graphRules": 12, "layoutTokens": 36, "primitives": 19, "routes": 3, "sections": 12, "semanticRoles": 30, "templates": 2, "themes": 1, "tokenCategories": 14, "tokens": 610} -->

AI-ready design system extracted from a finished clone: tokens, primitives, components, section contracts, page templates, a compatibility graph, a closed PageSpec schema, a semantic validator and an adversarial test-suite. A generator can use it to build new on-brand pages without inventing colours, copy budgets, sections or assets.

> **Status: design-review-pending. `productionApproved: false`.**

## SOURCE IS A REAL, LIVE COMMERCIAL SITE (read before using or sharing)

The project this repo was extracted from is a **clone of the real, live marketing site layer9.com** (an AI operations platform for ISPs). Treat everything here accordingly:

- **Do not publish this repo, the zip, or the clone, and do not make any repository containing them public, without legal clearance.**
- The clone is a deliberate **placeholder clone**. The brand is a fictional **"Acme"** (wordmark "Acme OS", chip mark "A"). All copy is **original placeholder text** sized to the original's character and line counts. Nothing here transcribes the original's marketing copy.
- **Fonts are free stand-ins**: Inter Tight (head, weight 350) and Inter (body) replace the original's licensed head and body typefaces. The licensed fonts are **not included** and must not be added.
- The **45 integrations logos are neutral two-letter monogram tiles** standing in for real third-party vendor logos. Never reproduce real vendor or customer marks.
- The closing stack illustration, the integrations cell frames and every icon are **original drawings**; the original's SVG artwork and path data are not reproduced here.
- The map basemap tiles (`public/assets/map/`, 35 PNGs) are **third-party CARTO tiles** on OpenStreetMap data, kept with the credit "© CARTO © OpenStreetMap". CARTO's free basemap tier is intended for non-commercial use, and the local tiles were saved from requests the original site made with its own API key. Obtain your own CARTO plan (or another source) before any commercial or public deployment.
- The **demo form does not submit anywhere** (900ms simulated send, then a success state). The original POSTs to a real live endpoint (`/api/submit-form/`). Asset role `form-submit-endpoint` is **pinned** to `must-not-reuse-live-endpoint`; never point a generated form at the original's endpoint.
- The legal pages are placeholder text for a fictional company and say so on the page; do not present them as real policies.

This repo must not be used to reintroduce the original's content. Full guidance per asset is in `assets/asset-roles.json`.

## What is in here (counts recomputed from disk by `extraction/verify_all.py`)

| thing | count |
|---|---|
| tokens (total) | 610 |
| foundation / layout / semantic roles / component tokens | 433 / 36 / 30 / 111 |
| token categories (real catalogue keys) | 14 |
| primitives | 19 |
| components | 26 |
| sections (contracts) | 12 |
| templates | 2 |
| routes | 3 |
| asset roles | 9 |
| allowlist entries (primitives + components + sections) | 57 |
| compatibility rules | 12 |
| themes | 1 (dark only) |
| distinct citations in the ledger | 894 |

```
design-repo/
  README.md  CHANGELOG.md  registry.manifest.json
  docs/EXTRACTION-NOTES.md      structurally unusual things, in detail
  tokens/00-foundation/         color, typography, radius, spacing, breakpoint, elevation, icon-size, motion
  tokens/10-semantic/           text, surface, border, accent, state roles (refs into foundation)
  tokens/20-component/          component-scoped tokens
  tokens/30-layout/             max widths, scaled canvases, grids, measured section boxes
  tokens/themes/dark.json       the only theme
  tokens/llm/                   token-catalog.json, token-policy.json, component-allowlist.json (versioned)
  primitives/ components/ sections/   one JSON contract per id
  templates/templates.json      page shapes + the 1:1 route map
  compatibility/graph.json      rhythm rules (severity error|warn, named exceptions)
  assets/asset-roles.json       closed assetRole enum + generation/licensing policy
  schema/                       pagespec.schema.json (Draft-07), section-contract.schema.json, example(s), semantic_validate.py, tests/adversarial_test.py
  extraction/                   measured-values.json (citation ledger + measured section heights), quality-gate.json (reviewed height-gate whitelist),
                                verify_all.py, prove_drift.py, measure_sections.mjs (re-measures the built clone)
```

## Routes and templates

| route | template | evidence |
|---|---|---|
| `/` | `home` | measured against the live site |
| `/privacy-policy/` | `legal-prose` | DERIVED (the original serves a PDF) |
| `/terms-of-service/` | `legal-prose` | DERIVED (the original serves a PDF) |

`home` section order: `hero.episode`, `usecases.stage` (#use-cases), `integrations.grid`, `csr.loop` (#csr), `platform.stack`, `security.matrix` (#security), `closing.cta`; then the global `chrome.footer`, `overlay.demo-dialog`, `overlay.cookie-banner`.

## Structurally unusual things (do not normalise away)

1. **There is NO navbar and no sticky or blur header.** The top of the hero is only a centred logo that scrolls away. There is no `shell.navbar` section and no `mustFollowNav` rule; the only fixed element on the site is the cookie banner.
2. **There is no scroll-linked motion.** Everything is IntersectionObserver (framer-motion `useInView`), timers, hover or click. The closing CTA's progress value is triggered by `useInView` (>=45% in view), not by scroll position. Every section contract records `scrollLinked: false`.
3. **A "From the field" testimonial carousel exists in the ORIGINAL's bundle but is not rendered on the live page and was deliberately NOT built.** It must not be recreated: there is no section type, node or schema entry for it.
4. **Footer, cookie banner (+ preferences modal) and demo dialog are global overlays, not page sections.** `App.jsx` renders them after every page, so they are explicit nodes at the end of every template. The dialog opens from any `a[href="#demo"]` or a `#demo` hash; `#cookies` opens the preferences modal.
5. **The legal routes are DERIVED**: built in the home page's own system because the original serves PDFs.
6. **The pinned animation library**: `framer-motion` is pinned to exactly `12.42.2` with an `overrides` entry pinning `motion-dom` to `12.42.2`. The pin is load-bearing: it makes spring-to-WAAPI `linear()` durations match the original; motion-dom 12.43+ breaks the match (SVG paths start using WAAPI). `verify_all.py` checks the token record always and `package.json` when the source tree is present.

See `docs/EXTRACTION-NOTES.md`.

## Evidence levels

| item | level | basis |
|---|---|---|
| Global tokens (colours, type, spacing, breakpoints, motion constants) | measured | CLONE_SPEC section 0 + clone source |
| Home sections, footer, dialog, cookie banner | measured | CLONE_SPEC sections 1-12, recon/ |
| Legal pages (`legal-prose`, `legal.header`, `legal.body`) | **derived** | not measured against any original |
| Phone hero composition values | partly derived | clone data.js says they come from the reference bundle |
| Loop periods | measured (QA-corrected) with code sums recorded | hero ~21.3s, CSR ~8.0s |
| Closing sweep period 5.5s | derived | sum of two code constants |

QA corrections applied over the spec's text: hero typing is ~27ms/char (spec says 26); the hero loop is ~21.3s (spec says ~21.0s); the pill glimmer easing is **linear** (spec says EASE; the clone's CSS still uses EASE and was not changed); the CSR frame-state label changes 4 times per ~8.0s cycle. Details: `extraction/measured-values.json`.

## Verify

```
python3 extraction/verify_all.py                # all checks (citation checks need the sibling source tree)
python3 schema/tests/adversarial_test.py        # every rule rejects a bad instance; controls pass
python3 schema/semantic_validate.py schema/example.pagespec.json
python3 extraction/prove_drift.py --scratch DIR # injects drift into a scratch copy; verify_all must fail each time
```
Python 3.9+ and `jsonschema` (Draft 7) only. With no sibling source tree the citation and pin checks degrade to WARN, not FAIL.

Expected (1.1.0): `verify_all.py` reports 0 FAIL and 0 WARN with the sibling source tree present, the adversarial suite passes all 148 checks, and `prove_drift.py` rejects all 45 injected cases (the height-gate WARN cases must exit 0 and print the WARN). The home example validates with 0 errors and 0 warnings.

## Contract fields added in 1.1.0

Every `sections/*.json` contract now separates three things (closed shape: `schema/section-contract.schema.json`, enforced by `verify_all.py` check O):

- `source` = **provenance** `{sourceId, citation, mountedAt, domSelectors, inFlow}`: the source component or element that implements the section, its declaration line, the line that mounts it, and the CSS selectors that find it in the built page. This is how a contract is traced back to the DOM and the component. It is never a generator-facing id.
- `semantic` = **taxonomy** `{semanticId, category}`: the stable id (must equal the contract id) and a closed category (`HERO`, `FEATURE`, `CTA`, `CHROME`, `LEGAL`, `OVERLAY`). `sourceId` may not equal `semanticId`.
- `retrievalEligible` (boolean): `true` for page content, `false` for the two utility overlays (`overlay.cookie-banner`, `overlay.demo-dialog`). The value is **pinned in `verify_all.py` and `semantic_validate.py` independently of the registry**: flipping it in a contract, the allowlist (`retrievalIneligibleSections`) or the PageSpec schema fails. A PageSpec node may carry `retrievalEligible` (default `true`); on the two overlays the schema only admits `false`.

## Whole-page-wrapper quality gate (check P)

`extraction/measured-values.json` -> `sectionHeights` records each in-flow section's rendered height per route, measured on the built clone at 1440px by `extraction/measure_sections.mjs` (selectors come from `source.domSelectors`). `verify_all.py` then applies constants it owns: a `HERO`-category section above 1800px **warns**, above 3000px **fails** unless it has a reviewed entry in `extraction/quality-gate.json` (justification, reviewer, date, hard cap), and any section holding more than half of its page's height **warns** unless reviewed. Measured: `hero.episode` 1296px on `/` (page 7885px); the privacy page is 1835px and the terms page 1787px in total, and on both `legal.body` holds about two thirds (reviewed, because a legal page is one prose document). Stale or malformed whitelist entries fail.

Not measured, and not claimed: **visual parity against the live site.** No live-site capture exists in this package, so there is no parity number; the section heights above describe the clone only.

## Duplicate section numeral (D-4)

The built page renders eyebrow numerals 02, 03, 03, 04, 05 (Integrations defaults to `03`, the CSR section hard-codes `03`). No evidence about the original's numerals exists (`recon/` stores only character counts), so the example is **not** edited to look tidier. The duplicate is recorded as an explicit `acknowledgedDuplicates` entry on graph rule `EYEBROW_NUMBER_UNIQUE`; the validator skips only that exact numeral + section pair, and `verify_all.py` (check Q) fails if the entry goes stale, is thinly evidenced, or any other numeral repeats. Fix it in the source after checking the live page, then delete the entry.

## Delivery packaging

- Ship the source with `package.json` + `package-lock.json` and run **`npm ci`** on the receiving side. Do not ship `node_modules` (symlinks in `.bin` do not survive zip tooling).
- `design-repo.zip` is a build artifact generated last with the CLI `zip`. **If the project is ever put under git, gitignore `design-repo.zip`** (a tracked zip goes stale and ships two disagreeing copies).
- Fonts load from Google Fonts at runtime (an external request); self-host free fonts if the deployment forbids external requests.

## Known limits

- Section contracts expose the fields a PageSpec may set; internal demo data (spreadsheet/email panel copy, map geometry, canvas coordinates) is listed under each section's `fixedInternals` and is not settable.
- PageSpec has no per-instance token-override field by design (see `tokens/llm/token-policy.json`).
- Sections never repeat on a page, so structural rules key on the section id alone; if a repeating variant is ever introduced, add a `variant` field to the schema and key the validator on (section, variant).
