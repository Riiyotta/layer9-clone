# Extraction notes: structurally unusual things

These were noted BEFORE building (BUILD-GUIDE section 0) and built around, not normalised away.

## 1. No navbar, no sticky header
`src/pages/Home.jsx` renders `Hero` first. The only element above the headline is the logo inside the hero (`.l9h2-logo`, height clamp(32px, 2.3vw, 40px)); it scrolls with the page. The only `position: fixed` element on the site is the cookie banner (and its modal). Consequences: there is no `shell.navbar` section type, no `mustFollowNav` constraint, and the hero is the first node of the home template (rule `HERO_FIRST_ON_HOME`).

## 2. No scroll-linked motion
No scroll listener, `useScroll` or scroll-based transform exists in `src/`. Motion triggers are: framer-motion `useInView` (IntersectionObserver) with the thresholds recorded in `tokens/00-foundation/motion.json` (`motion.threshold.*`), timers (typing, phase loops, autoplay), hover, and click. The closing CTA's progress value `p` animates 0->1 over 2.4s when the section is >=45% in view and back over 0.9s when it leaves: an IntersectionObserver trigger, not scroll position. Every section contract carries `scrollLinked: false` and `verify_all.py` enforces it.

## 3. The testimonial carousel is a deliberate scope exclusion
The original's bundle contains a "From the field" carousel (6s interval, 0.6s AnimatePresence fade). It is not rendered on the live page and the clone deliberately omits it. Do not add a section type, template node or schema entry for it.

## 4. Global overlays are nodes, not sections of a page body
`App.jsx` renders `<Page/> <Footer/> <DemoDialog/> <CookieBanner/>` for every route. They are therefore explicit nodes at the end of each template (`chrome.footer`, `overlay.demo-dialog`, `overlay.cookie-banner`), guarded by rules `FOOTER_AFTER_CONTENT`, `OVERLAYS_AFTER_FOOTER`, `DEMO_CTA_REQUIRES_DIALOG` and `COOKIES_LINK_REQUIRES_BANNER`.

## 5. Derived legal pages
The original serves privacy and terms as PDFs. The clone builds one `LegalPage` from the home page's own system and renders both documents from `src/content/legal.js` (placeholder text for a fictional company, flagged on the page). The template `legal-prose` and sections `legal.header` / `legal.body` carry `evidence: derived`; their maxWords ceilings are not measured.

## 6. Placeholder clone of a real site
Brand "Acme"; copy is original placeholder text sized to the original's character/line counts (originalChars in section contracts are LENGTHS of the original's text roles, never its words). Fonts are Inter Tight (head, 350) and Inter (body) for licensed originals. Integrations logos are monogram tiles. Wordmark and chip mark are placeholders. Illustrations, cell frames and icons are original drawings. See `assets/asset-roles.json`.

## 7. Map tiles
35 CARTO dark tiles at `public/assets/map/{y}_{i}.png`, credit "© CARTO © OpenStreetMap". The tiles were fetched using the original site's API key (visible as a `key=` parameter in `recon/network-1280.txt`) and CARTO's free tier is non-commercial. Re-fetch under your own credentials before any commercial or public use.

## 8. Demo form
The clone simulates a 900ms send and shows a success state; nothing is submitted. The original POSTs JSON to its own live endpoint with a submission-id header. The field names in the clone mirror the original's payload names (full_name, email, number_of_subscribers, coverage_areas, how_did_you_hear_about_us, honeypot `website`, `privacyPolicy`), which is why they are listed as fixed internals rather than invented.

## 9. Pinned animation library
`framer-motion` 12.42.2 exact + `overrides.motion-dom` 12.42.2. Load-bearing: it makes the spring-to-WAAPI `linear()` durations match the original; motion-dom 12.43+ breaks the match because SVG paths start using WAAPI. Floating either version silently changes animation timing.

## 10. Routes were derived from code
No `ia.json`, `IA.md` or `matrix.csv` exists for this project. The route map comes from `src/App.jsx` (`PAGES` table, `Home` fallback) and `src/lib/routes.js`. Only `/` is a real route for Home; unknown paths fall back to Home in the clone but are not modelled.
