# Changelog

<!-- counts: {"allowlistEntries": 57, "assetRoles": 9, "componentTokens": 111, "components": 26, "foundationTokens": 433, "graphRules": 12, "layoutTokens": 36, "primitives": 19, "routes": 3, "sections": 12, "semanticRoles": 30, "templates": 2, "themes": 1, "tokenCategories": 14, "tokens": 610} -->

## 1.1.0 (design-review-pending)

Minor release: contract and gate hardening. Counts are unchanged (sections stay 12, allowlist entries stay 57); `allowlistVersion` is now 1.1.0 (machine-checked), `repositoryVersion` and `pageSpecVersion` 1.1.0 (documentation-only).

- Duplicate numeral 03 (D-4) resolved with evidence: the built page really renders 02,03,03,04,05 and nothing about the original's numerals is recoverable, so the example is unchanged. The warning is replaced by an explicit, evidenced `acknowledgedDuplicates` entry on `EYEBROW_NUMBER_UNIQUE`; only that exact pair is skipped, new or spreading duplicates still warn, and stale acknowledgements fail (check Q).
- `retrievalEligible` (closed boolean): `false` on `overlay.cookie-banner` and `overlay.demo-dialog`, `true` elsewhere. Wired through every section contract, the PageSpec schema (optional node field, `const false` on the two overlays), the allowlist (`nodeProperties`, `retrievalIneligibleSections`), `semantic_validate.py` and `verify_all.py`, with a pin kept in both scripts independent of the registry.
- Provenance split from taxonomy: each section contract has `source` {sourceId, citation, mountedAt, domSelectors, inFlow} and `semantic` {semanticId, category}, closed by the new `schema/section-contract.schema.json` and checked by `verify_all.py` check O. Every new citation has a ledger entry (ledger 885 -> 894).
- Whole-page-wrapper gate (check P): `sectionHeights` measured at 1440px by the new `extraction/measure_sections.mjs` and recorded in `extraction/measured-values.json`; HERO >1800px warns, >3000px fails unless whitelisted in the new `extraction/quality-gate.json`; a section holding over half a page warns (the two `legal.body` entries are reviewed). Measured: hero.episode 1296px, `/` 7885px, privacy 1835px, terms 1787px.
- Tests: adversarial suite 79 -> 148 checks; `prove_drift.py` 21 -> 45 injected cases (including WARN-mode cases that must exit 0).
- Not done: visual-parity gate. There is no live-site capture, so no parity figure is recorded.

## 1.0.0 (design-review-pending)

First build of the design-repo from the finished Acme landing-page clone (3 routes, 2 templates).

Built, in order: tokens (610: 433 foundation, 36 layout, 30 semantic roles, 111 component) -> 19 primitives -> 26 components -> 12 section contracts -> 2 templates / 3 routes -> 12 compatibility rules -> closed Draft-07 PageSpec schema -> home example + legal-prose example -> semantic validator -> adversarial suite -> manifest, allowlist (57 entries, allowlistVersion 1.0.0), 9 asset roles, docs.

Evidence handling:
- Home template, its seven sections, footer, dialog and cookie banner: measured (CLONE_SPEC + recon) and cross-checked against the clone source.
- Legal template and sections: DERIVED and labelled so everywhere.
- QA corrections preferred over the spec text: hero typing ~27ms/char, hero loop ~21.3s, pill glimmer easing linear, CSR label changes 4 times per ~8.0s cycle.
- Disagreements found and recorded (see `extraction/measured-values.json`, sourceDiscrepancies): use-cases eyebrow c19 (spec) vs c17 (recon); "six" vs seven answer kinds; glimmer easing still EASE in the clone CSS; duplicate section numeral 03; map tiles saved with the original site's key; brief says CLONE_SPEC is 347 lines, the file has 451.
- Deliberate exclusion recorded: the "From the field" testimonial carousel.

Drift protection: `extraction/verify_all.py` (allowlist parity both ways, allowlistVersion parity, citation range AND content, recomputed counts, 1:1 route map, maxWords, entryPoints inside the folder, no absolute paths, pinned asset-role values, policy categories vs catalogue keys, animation-library pin, docstring file claims) and `extraction/prove_drift.py` (proves each check fails on injected drift).

Known: repositoryVersion and pageSpecVersion are documentation-only markers.
