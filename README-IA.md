# Information architecture

`ia.json` is the only file to hand-edit. `IA.md` and `matrix.csv` are generated
from it and are overwritten on every build.

```bash
node validate.mjs && node build.mjs
```

`validate.mjs` fails on a hard inconsistency (route totals, undefined or unused
sections, unknown categories). `build.mjs` rewrites `IA.md` and `matrix.csv`.

## What the data shows

- **3 routes, 2 templates.** The home page is one route; the privacy and terms
  pages share one `template.legal-prose`. There is no navbar and no other route.
  The `#demo` and `#cookies` hashes open overlays on whichever page you are on,
  so they are not routes.
- **Reuse is thin.** 3 sections are shared across both templates and belong in
  shared components: the footer, the cookie banner (with its preferences modal)
  and the demo dialog. The other 9 are used by exactly one template, so they
  stay page-local until a second page needs them. The 2 legal sections are used
  by one template that covers 2 routes.
- **The build effort is the home page.** Seven of the 12 sections are home-only
  and each is a self-running animated block: the hero episode, use cases,
  integrations grid, control-center loop, agent platform stack, security matrix
  and closing stack.
- **Every section is built.** All 12 have an `implementedBy` component.

## Evidence level

The home page's structure and timings were measured against the live original
(see `CLONE_SPEC.md`). The two legal pages are a derived design: the original
serves them as PDFs, so nothing about their layout was measured, and their text
is placeholder.
