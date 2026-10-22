# Acme: a local Vite + React rebuild of an ISP-software marketing site, with placeholder copy for a fictional brand

Source: Acme: a local Vite + React rebuild of an ISP-software marketing site, with placeholder copy for a fictional brand
Status: **measured-from-clone** · production approved: **false**
3 routes · 2 templates · 12 unique sections

> Generated from `ia.json` by `build.mjs`. Edit the JSON, not this file.

## Shape of the site

The largest 2 templates (Legal prose, Home) account for 3 of 3 routes (100%). The remaining 0 routes span 0 templates.

| template | routes | share |
|---|---:|---:|
| Legal prose | 2 | 67% |
| Home | 1 | 33% |

## Page chrome

**3 routes carry chrome = `footer-and-overlays`** — Home, Legal prose.

## Sections by reuse

How widely a section is shared determines whether it belongs in a shared
component library or stays local to its page.

| section | category | templates | routes | implementation | scope |
|---|---|---:|---:|---|---|
| `shell.footer` | SHELL | 2 | 3 | `src/components/Footer.jsx` | Present on all 3 routes. |
| `shell.cookie-banner` | SHELL | 2 | 3 | `src/components/CookieBanner.jsx` | Present on all 3 routes until a consent choice is stored. |
| `shell.demo-dialog` | SHELL | 2 | 3 | `src/components/DemoDialog.jsx` | Mounted on all 3 routes; hidden until opened. |
| `content.legal-header` | CONTENT | 1 | 2 | `src/pages/LegalPage.jsx` | Both legal pages. |
| `content.legal-body` | CONTENT | 1 | 2 | `src/pages/LegalPage.jsx` | Both legal pages. |
| `hero.agentic-episode` | HERO | 1 | 1 | `src/components/Hero.jsx` | Home page only. |
| `product.use-cases-stage` | PRODUCT | 1 | 1 | `src/components/UseCases.jsx` | Home page only. Carries the id use-cases. |
| `product.integrations-grid` | PRODUCT | 1 | 1 | `src/components/Integrations.jsx` | Home page only. |
| `product.control-center-loop` | PRODUCT | 1 | 1 | `src/components/ControlCenter.jsx` | Home page only. Carries the id csr. |
| `product.agent-platform-stack` | PRODUCT | 1 | 1 | `src/components/AgentPlatform.jsx` | Home page only. |
| `trust.security-matrix` | TRUST | 1 | 1 | `src/components/Security.jsx` | Home page only. Carries the id security. |
| `cta.closing-stack` | CTA | 1 | 1 | `src/components/ClosingCTA.jsx` | Home page only. |

**3 shared sections** appear in more than one template and belong in a component library.

**9 single-use sections** appear in exactly one template. Building these
as "reusable" components up front would be speculative — keep them page-local
until a second caller actually appears.

## Templates

### Home — `template.home`

1 route · `/` · chrome: **footer-and-overlays**

| # | category | section | |
|---:|---|---|---|
| 1 | HERO | `hero.agentic-episode` | page-local |
| 2 | PRODUCT | `product.use-cases-stage` | page-local |
| 3 | PRODUCT | `product.integrations-grid` | page-local |
| 4 | PRODUCT | `product.control-center-loop` | page-local |
| 5 | PRODUCT | `product.agent-platform-stack` | page-local |
| 6 | TRUST | `trust.security-matrix` | page-local |
| 7 | CTA | `cta.closing-stack` | page-local |
| 8 | SHELL | `shell.footer` | shared ×2 |
| 9 | SHELL | `shell.cookie-banner` | shared ×2 |
| 10 | SHELL | `shell.demo-dialog` | shared ×2 |

### Legal prose — `template.legal-prose`

2 routes · `/privacy-policy/`, `/terms-of-service/` · chrome: **footer-and-overlays**

| # | category | section | |
|---:|---|---|---|
| 1 | CONTENT | `content.legal-header` | page-local |
| 2 | CONTENT | `content.legal-body` | page-local |
| 3 | SHELL | `shell.footer` | shared ×2 |
| 4 | SHELL | `shell.cookie-banner` | shared ×2 |
| 5 | SHELL | `shell.demo-dialog` | shared ×2 |

## Section reference

### HERO

_Page-opening block: logo, headline, calls to action and the first product demo._

**`hero.agentic-episode`** — Top of the home page: centred wordmark, eyebrow, one-line headline, a solid and a ghost call-to-action, then a looping laptop (phone below the mobile breakpoint) that types five prompts and brings in a map, dashboard, spreadsheet, email and schedule panels in turn.

· Home page only. · appears on 1 routes · implemented by `src/components/Hero.jsx`

### PRODUCT

_Scroll-through product storytelling: each block is a self-running, animated explanation of one capability._

**`product.use-cases-stage`** — Nine system tiles feeding a central hub chip, above an app window where three personas each answer three prompts; the persona autoplays on a timer and any click restarts it. Becomes a stacked list on mobile.

· Home page only. Carries the id use-cases. · appears on 1 routes · implemented by `src/components/UseCases.jsx`

**`product.integrations-grid`** — Header, eight category filter pills and a nine-by-five grid of vendor tiles that enter in a diagonal wave and dim or highlight by category on hover or click. Five columns on mobile.

· Home page only. · appears on 1 routes · implemented by `src/components/Integrations.jsx`

**`product.control-center-loop`** — Framed canvas where one typed question fans out to five systems, the tangle resolves onto a single rail, each system reports a finding and an answer returns. Loops on a fixed cycle; a mobile row layout replaces the canvas.

· Home page only. Carries the id csr. · appears on 1 routes · implemented by `src/components/ControlCenter.jsx`

**`product.agent-platform-stack`** — Three-layer stack of an intelligence block, three capability cards and a platform slab, joined by dashed connectors that march while in view. Builds bottom-up on entry; the card row becomes a column on narrow screens.

· Home page only. · appears on 1 routes · implemented by `src/components/AgentPlatform.jsx`

### TRUST

_Reassurance blocks that answer a buyer's risk questions rather than demonstrate a feature._

**`trust.security-matrix`** — Header over a two-by-two matrix of security and data-handling quadrants, each with an icon, index, heading, paragraph and a proof line. No scripted motion, only a hover tint; single column on mobile.

· Home page only. Carries the id security. · appears on 1 routes · implemented by `src/components/Security.jsx`

### CTA

_Closing conversion block that sends the visitor to the demo request._

**`cta.closing-stack`** — Full-viewport closing block: eyebrow, title and lede above an isometric layer stack whose chip drops into place on a scroll-triggered spring, followed by a flash, rings and sweeps, with a single demo button beneath.

· Home page only. · appears on 1 routes · implemented by `src/components/ClosingCTA.jsx`

### CONTENT

_Long-form reading content on plain text pages._

**`content.legal-header`** — Top of a legal page: centred wordmark linking home, a Legal eyebrow, the document title, a last-updated line and a badge marking the text as placeholder.

· Both legal pages. · appears on 2 routes · implemented by `src/pages/LegalPage.jsx`

**`content.legal-body`** — Single narrow reading column: an intro paragraph, then numbered headed sections of paragraphs and bullet lists, ending with a contact line. Text lives in src/content/legal.js.

· Both legal pages. · appears on 2 routes · implemented by `src/pages/LegalPage.jsx`

### SHELL

_Chrome shared across every route: footer and the global overlays. There is no navbar._

**`shell.footer`** — Single-line page footer: copyright text on the left and Privacy, Terms and a Cookies button on the right.

· Present on all 3 routes. · appears on 3 routes · implemented by `src/components/Footer.jsx`

**`shell.cookie-banner`** — Fixed consent card at bottom left with accept, reject and customise actions, plus the preferences modal it opens. The modal also opens from the footer Cookies button and from the cookies hash.

· Present on all 3 routes until a consent choice is stored. · appears on 3 routes · implemented by `src/components/CookieBanner.jsx`

**`shell.demo-dialog`** — Modal form for requesting a demo, opened by any link to the demo hash or by loading the page with that hash. The send is simulated and posts nowhere.

· Mounted on all 3 routes; hidden until opened. · appears on 3 routes · implemented by `src/components/DemoDialog.jsx`
