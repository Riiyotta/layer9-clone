Source: https://layer9.com/

# Layer 9 landing page: clone spec (single route `/`)

Measured live on 2026-10-22 with Playwright at 1280x800 and 390x844. Timing constants were read from the client bundle (`_files/26vu-do0ky51s.js`: hero, use-cases, integrations, CSR, data-plane and CTA; `_files/0du17xxvf9akf.js`: demo dialog; `_files/1v4yxbbii5bv5.js`: tokens and cookie banner). Where possible they were then checked against live sampling. Per the brief, copy is **not** transcribed here. Take the words from the saved HTML. Text is described by role, character count (`c`), line count at 1280 (`L`) and typography. Raw measurements are in `recon/` (`text-roles-1280.json`, `layout-390.json`, `style-blocks.css` (all 11 scoped style blocks verbatim), `network-1280.txt`, `mut-hero.json`).

## 0. Global tokens (module 85111)

| token | value |
|---|---|
| EASE | `cubic-bezier(0.4,0,0.2,1)` (`[.4,0,.2,1]`) |
| heavySpring / snappySpring | framer-motion spring `{stiffness:180,damping:28}` / `{stiffness:200,damping:24}` |
| NEON / BLINK / BOOST | `#2EEB85` / `#FF602E` / `#BE6CF3` |
| STOP_ORANGE / FUCHSIA / GREEN / PURPLE | `#FF5722` / `#AB0052` / `#1DE97B` / `#B14EF1` |
| DIM / LEDE / HAIRLINE | `rgba(255,255,255,.55)` / `rgba(255,255,255,.75)` / `rgba(255,255,255,.1)` |
| GRAPHITE / TILE | `#191919` / `#1E1E1E` |
| *_LINE (2px top accent bars) | `linear-gradient(270deg,#FFFFFF 1.53%, A 21.8%, B 62.35%, C 102.91%)`. BLINK_LINE A,B,C = `#FF5722,#AB0052,rgba(148,0,151,0)`. NEON_LINE = `#1DE97B,#004549,rgba(177,78,241,0)`. BOOST_LINE = `#B14EF1,#950059,rgba(172,7,175,0)`. WHITE_LINE = `#FFFFFF,rgba(255,255,255,.4),rgba(255,255,255,0)` |
| H1 | `clamp(46px,5.2vw,92px)`, lh 1.05, ls -0.02em, weight 350, font head. Measured 66.56px at 1280 and 46px at 390 |
| H2 | `clamp(36px,3.9vw,66px)`, lh 1.05, ls -0.015em, weight 350. Measured 49.92px at 1280 and 36px at 390 |
| LEDE | `clamp(17px,1.4vw,23px)`, lh 1.4, maxWidth 800, marginTop 24. Measured 17.92px at 1280 |
| Eyebrow | MONO 13px, ls 0.2em (2.6px), DIM, lh 18.2px |
| SECTION_PAD | `clamp(84px,8.5vw,148px) 24px` (108.8px at 1280, 84px at 390) |
| MONO | `ui-monospace, SFMono-Regular, Menlo, monospace` |
| HEAD / BODY | `var(--font-head), ABCDiatype, Inter, system-ui, sans-serif` / `var(--font-body), Inter, system-ui, sans-serif` |

The global CSS is `_files/0i1ir0s1au-9x.css`:

- `@font-face` `head` = KMR_Apparat_Book woff2, weight 350. Fallback is `local(Arial)` with ascent 92.57%, descent 24.29%, line-gap 9.75%, size-adjust 102.52%.
- `body` = ABCDiatype Regular 400 and Medium 500. Fallback is `local(Arial)` with ascent 97.41%, descent 26.97%, line-gap 0%, size-adjust 99.38%.
- `*{box-sizing:border-box}`, `html{color-scheme:dark}`, and body `#090909`, 14px/1.4, antialiased, margin 0.
- `h1-h4` use the head font.
- `::selection{background:#2eeb8559}`.
- `font-display: swap`.

All components respect `prefers-reduced-motion`: CSS animations are set to none, and JS episodes render their final state with no timers.

`SectionHeader` is a shared component: a centred wrapper with maxWidth 980, containing an eyebrow, then an H2 with marginTop 20, then the lede.

## 1. Page structure and section boxes

There is **no navbar**. The top of the hero is just a centred logo image (`/stack-assets/layer9-lockup.svg`, height `clamp(32px,2.3vw,40px)`), not sticky. The page has no scroll listeners and no scroll-linked transforms. All motion is triggered by framer-motion `useInView` (IntersectionObserver), timers, hover or click. The only fixed element is the cookie banner.

| # | element / hook | y@1280 | h@1280 | y@390 | h@390 |
|---|---|---|---|---|---|
| 0 | `main > section` hero (`.l9h2-laptop` / `.l9h2-phone`) | 0 | 1218 | 0 | 1295 |
| 1 | `section#use-cases` (`.l9uc-stage` / `.l9uc-mobile`) | 1218 | 1247 | 1295 | 1103 |
| 2 | `div` integrations (`.l9int-grid`, `.l9int-pill`), maxWidth 1440 | 2466 | 1209 | 2399 | 1275 |
| 3 | `section#csr.l9ctr-section` | 3674 | 1081 | 3674 | 911 |
| 4 | `section` agent platform (`.l9dp-stack`) | 4755 | 771 | 4585 | 962 |
| 5 | `section#security` (`.l9-security-matrix`) | 5526 | 953 | 5548 | 1525 |
| 6 | `div` closing CTA (`.l9cc-stage`), 100vh tall | 6479 | 800 | 7073 | 844 |
| 7 | `footer` | 7279 | 56 | 7917 | 83 |
| 8 | `dialog` (demo form, hidden) | – | – | – | – |

Document height: 7335 at 1280 and 7999 at 390.

The bundle also contains a "From the field" testimonial carousel (`.l9-fld-tab`, 6s interval, AnimatePresence fade 0.6s). It is **not rendered** on the live page, so skip it.

## 2. Hero (`section`, minHeight 100svh, padding `36px 24px 96px`, overflow hidden, column, centred)

### Static layout at 1280

- Logo at y 36, height 29.4px.
- Eyebrow at y 112 (marginTop 44): c19, L1, MONO 13px.
- H1 at y 152 (margin 22 0 0): c37, L1 at 1280 (1061px wide) and L3 at 390 (145px tall).
- CTA row: marginTop 38, gap 14, wraps, centred, `data-cta-location="hero"`.
  - **Pill solid** 160x52 at x 468: padding 15px 36px, radius 999, body 17px/1.2 weight 500, bg #fff, color #090909. It includes `.l9pill-glim`.
  - **Pill ghost** 171x52: border 1px rgba(255,255,255,.25), color rgba(255,255,255,.88), weight 400.
- **Laptop** `.l9h2-laptop` (aria-hidden), marginTop 72, width `min(1260px,90vw)` (1152 at 1280), y 384.
  - Bezel: radius 16 16 0 0, bg #1a1a1c, padding 12 12 0, shadow `0 40px 120px rgba(0,0,0,.7)`.
  - Screen: radius 8, bg #0d0d0f, aspect 1160/725. Its inner 1160x725 canvas is `transform:scale(width/1160)` via ResizeObserver, origin top left.
  - Under the screen: a base 16px tall with radius 0 0 18 18 and shadow `0 24px 60px rgba(0,0,0,.6)`. Then a notch 16% wide, 5px tall, radius 0 0 8 8, colour #0f0f11.
- Below 720px the laptop is hidden and `.l9h2-phone` is shown instead.
  - Frame: marginTop 52, width `min(340px, calc(100vw - 40px))`, radius 54, padding 10, bg #1a1a1c. Screen: radius 44, aspect 360/760.
  - Status bar: time label 11.5px/600 at left 24, top 13. Signal and battery SVGs at right 22, top 16. Dynamic island 88x25, radius 14, #000, top 9.
  - At 390 the phone box is 342x696 at y 504.

### Laptop scene layers (in 1160x725 space)

1. Map: CARTO dark basemap, 7x5 tiles of 256px at zoom 12 (tiles 1000-1006 by 1687-1691 @2x), centred on lat 30.0035, lon -91.82. The attribution label is 7.5px, rgba(255,255,255,.35), at right 8 / bottom 4. It fades out (opacity 300ms) once the dash phase starts.
2. Ambient dots: seeded LCG with seed 41, 16807 mod 2^31-1. Clusters `[cx,cy,n]`: [545,430,26] [380,335,16] [700,295,14] [300,520,10] [765,525,12] [950,350,13] [900,555,10] [160,400,9]. Each dot: angle = rand·2π, radius = rand·rand·85, x offset ×1.25. Dots are r 3.2, #fff, opacity 0.5·(0.25+0.4·rand). Dots inside the box x 470-700, y 330-400 are dropped.
3. Risk dots: 16 BLINK and 2 `#D52B3A`. Each is r10 at 0.16 opacity plus r5 with stroke #0a0a0c 1.5. Group fade-in uses `opacity 350ms EASE`, staggered **45ms × index**. The r5 circles get `.l9h2-bad`: opacity 1→0.45→1, 1.8s EASE, infinite.
4. Callouts: 3 large ones (MONO 10.5px, padding 6 10, radius 8, bg rgba(12,12,14,.92), 1px accent border), fading in over 500ms with delays 700, 1000 and 1150ms. Then 3 small ones (8.5px, ls .06em, padding 3 7, radius 5, HAIRLINE border), fading in over 400ms with delays 1250, 1450 and 1650ms. Visible only during the reveal…dash phases.
5. Panels. All slide with `transform 450ms EASE`, and their content uses the `m()` entrance: opacity 0→1 plus `translateY(16px) scale(.965)`→none over 450ms EASE, delay 120ms.
   - Dashboard (right, w580, #141416): enters from translateX(100%). Shifts to -100% when the spreadsheet arrives, and exits to -200% on reset.
   - Spreadsheet (right, w584): green title bar #185C37, grid colour #1b1b1d. Rows fade in 320ms with delays 230+60i.
   - Email client (left, w580, bg #202124): slides from translateX(-100%).
   - Scheduled-reports list (right, w580).
6. Prompt bar: fixed at `translate(0,224px) scale(.92)`, width 660, padding 13 16, radius 14, bg rgba(16,16,18,.96), border rgba(255,255,255,.16), with a multi-shadow glow. Text is 15px. The placeholder (c32) is DIM. The caret `.l9h2-caret` is 6x15, rgba(255,255,255,.7), blinking 0.9s step-end. The send button is a 30px white circle that gains a `0 0 20px rgba(255,255,255,.45)` glow (400ms) once typing has started.

### Episode state machine

The episode loops for as long as the section is ≥30% in view (`useInView amount:.3`, not once). When it leaves view it pauses where it is and resumes when it returns.

| phase | what happens | duration |
|---|---|---|
| `type` | types prompt 1 (c39), 26ms per char (≈27ms measured), caret on | 39×26ms, then 350ms hold |
| `reveal` | map dots and callouts appear | 1600ms |
| `type2` | prompt 2 (c64) | 64×26ms + 350ms |
| `dash` | dashboard panel slides in; inner items stagger in (see below) | 2400ms |
| `type3` | prompt 3 (c37) | 37×26ms + 350ms |
| `excel` | spreadsheet slides in from right; dashboard shifts left | 2400ms |
| `type4` | prompt 4 (c39) | 39×26ms + 350ms |
| `email` | email client slides in from left | 2200ms |
| `type5` | prompt 5 (c48) | 48×26ms + 350ms |
| `sched` | schedule list slides in from right | 4200ms |
| `reset` | panels exit, counters reset, episode key bumps | 560ms, then back to `type` |

The full loop is about **21.0s**. The caret only shows while a string is mid-typing. The previous prompt stays shown in the bar until the next typing phase starts.

**Dashboard inner timings** (all EASE, delay relative to the panel turning on):

- Header label fades at 80ms.
- A "generating" badge hides at 1550ms, and a "live" badge appears at 1600ms.
- 3 KPI cards use translateY 8px plus opacity over 380ms, with delays [480, 140, 760]. Each card's value fades in at +260ms and its sub-label at +340ms.
- Two bar lists (`O`). Rows use opacity plus translateY 6px over 320ms. Bar fill is `scaleX 0→1` over 500ms at row delay +140ms. The count fades in at +380ms. List 1 rows: title 360, rows [760, 300, 980]. List 2 rows: title 200, rows [260, 620, 1050, 440].
- The trend block appears at 380ms, and its note at 1500ms.

Other panel staggers:

- Email: rows use opacity plus translateY 5px over 380ms, at 60, 120, …
- Schedule list: cards use opacity plus translateY 6px over 350ms, at 120+110i.

### Phone variant (≤720px)

Same state machine. Panels stack as bottom sheets with `top:46`, radius 18 18 0 0, and a 108px bottom fade gradient. Each slides `translateY(calc(100%+24px))`→0 over 450ms EASE, with z-index 3-6. Callouts hide once the dash phase starts. The prompt bar is pinned at bottom 20, left and right 18, with 13px/1.35 text, maxHeight 3.9em and a 27px send button.

### Pill glimmer (`.l9pill-glim`, solid hero pill only)

An absolutely positioned span, 46% wide and full height, with `linear-gradient(105deg, transparent, rgba(17,17,17,.14) 50%, transparent)`. Animation `l9PillGlim` runs 3.4s EASE infinite with keyframes `0% {left:-50%}` and `55%,100% {left:105%}`, so the sweep takes about 1.87s followed by about 1.53s of rest. The pill has `overflow:hidden`. Pills have **no hover styles**.

## 3. Use cases (`section#use-cases`, padding SECTION_PAD)

- Header: eyebrow c19 · H2 c44, 2 lines with a `<br>` (980 wide, 105 tall at 1280) · lede c~75.
- `.l9uc-stage`: marginTop 64, maxWidth 1380, aspect 1080/678. It holds a 1080x678 canvas scaled by `min(w/1080, h/678)`, centred. At 1280 it measures 1232x773.

### Canvas content

- 9 system tiles: 80x80, radius 12%, `4px solid #232327`, bg #0b0b0c, shadow `0 10px 26px rgba(0,0,0,.5)`, top 10. They sit at x = c+120i+40, where c=(1080-(80·9+8·40))/2. Each holds a 26px stroke icon (stroke rgba(255,255,255,.92), width 1.6) and a 10px label.
- Bezier connectors run from each tile to a central chip. Each is `M x 90 C x 128, 540 102, 540 146`, stroke rgba(255,255,255,.32), width .9.
- Central chip image `/stack-assets/chip9-clean.png`: 88x88 box centred at (540,190). Its filter is `drop-shadow(0 8px 20px rgba(0,0,0,.6))` and changes to `drop-shadow(0 0 16px rgba(46,235,133,.4))` when active (600ms).
- Spine `M540 234 L540 250` in the accent colour, opacity .7, width 1.3.
- App window at left 40, top 254, 1000x408: radius 12, HAIRLINE border, bg #191919. Opacity starts at .3 and goes to 1 over 500ms when active.
  - Left rail, 248px wide: 3 persona buttons, each with padding 16 18 14, a mono 9.5px label, an 8px accent dot and a 17px/500 name. Below each is a 2px progress track rgba(255,255,255,.07).
  - Prompt column, 322px: 3 `.l9uc-card` buttons with radius 12, padding 12 16, mono 9px tag, and the question in head font 20px/1.25 weight 350.
  - Answer dashboard (`k`) fills the rest. Padding 14, gap 14.

### Behaviour

- Entrance is `useInView once, amount .2`.
  - Tiles: opacity 0→1 and scale .7→1 using snappySpring, delay 0.05·i.
  - Connectors: pathLength 0→1 over 0.55s EASE, delay 0.25+0.05i. Spine: delay 0.85, duration 0.35.
- **1150ms after first in-view** the stage becomes "active" (`C`). The window goes to full opacity and the chip glows.
- Data pins appear while active and in view: SVG `<animateMotion>` dots (r2.4, white, .9) travel along the curves from tiles 1, 4 and 7. Durations are 2.4, 2.9 and 3.4s, begin offsets 0, -0.8 and -1.6s, looping indefinitely. One accent dot (r2.8) runs the spine on a 1.4s loop.
- **Autoplay**: once active and ≥30% in view, `setInterval` 7000ms advances the persona (3 personas, cyclic) and resets the prompt to index 0. Measured: the first switch came 8.0s after scroll (1.15s + 7s) and later switches every 7.0s.
  - Persona order and accents: BOOST purple, then NEON, then BLINK.
  - The active persona's track holds `.l9uc-count`: full width, filled with the persona's *_LINE gradient, animating `translateX(-100%)→0` over 7000ms linear (forwards).
  - Inactive tracks have width 0%, or 100% plain accent while autoplay is paused, with `width 300ms linear`.
- **Click** on a persona or prompt card selects it and bumps a key, which restarts the 7s interval and the bar.
- Active persona button: bg rgba(255,255,255,.03), label rgba(255,255,255,.6), name #fff, dot opacity 1. Inactive: no bg, name rgba(255,255,255,.5), dot .45. All transitions 350ms.
- Active prompt card: border `${accent}66`, bg #1E1E1E, question #fff. Inactive: HAIRLINE border, bg rgba(255,255,255,.02), question rgba(255,255,255,.8). Transitions 300ms. **Hover**: `.l9uc-card:hover{border-color:rgba(255,255,255,.26)!important}`.
- Cards re-enter on persona change: opacity 0 and y 6 → visible over 0.28s EASE, delay 0.06i.

### Answer dashboard `k`

Remounts on every persona or prompt change, so its entrance replays each time.

- Container: radius 12, HAIRLINE border, bg rgba(0,0,0,.32), padding 14 16.
- Items use heavySpring with opacity 0 and y 8, at delay 0.08+0.1·n.
- A "querying" label fades out over 0.25s at a 0.85s delay. A "live" pill (radius 999, `${accent}44` border) fades in over 0.3s at 0.9s.
- Six body kinds:
  - tiles: sparkline pathLength over 0.55s at 0.2+0.08i
  - bars: height via heavySpring at 0.16+0.08i
  - rows
  - report
  - kpi
  - steps
  - map: 3x3 CARTO tiles. Fibre path pathLength over 0.7s at 0.25s, dashed dead path over 0.45s at 1.0s, hub at 1.4s, rays at 1.5s.
- A finding strip sits at the bottom.

### ≤720px (`.l9uc-mobile`, marginTop 28)

At 390 it is 342x646 at y 1668.

- Rail: 3 columns, gap 8. Pillars are min-height 44, padding 10 6, radius 10, 14.5px/500 names.
- Prompts list: gap 7. Each prompt has padding 10 12 and radius 11, with the question in head font 15.5px/1.3. Inactive questions are clamped to a single ellipsis line; the active one wraps.
- Dash: height 400.
- Same 7s autoplay but **no progress bar**.

## 4. Integrations (`div`, maxWidth 1440, padding SECTION_PAD)

### Layout

- Header (marginBottom 52): eyebrow c17, H2 c33 L1, lede c74 at opacity .75.
  - H2 animates opacity and y 14→0 with a spring (damping 28) whenever it is ≥30% in view. It reverses when out of view.
  - The p animates opacity 0→.75 over 0.6s with a 0.15s delay.
- Filter pills: 8 of them, gap 10, marginBottom 44.
  - Style: MONO 12px, ls .12em, padding 9 18 (12 16 at ≤720), radius 999, border rgba(255,255,255,.14), color rgba(255,255,255,.6). Height is 34 at 1280 and 40 at 390.
  - Category accents: fiber BLINK, fixed-wireless BOOST, wi-fi NEON, core NEON, oss BLINK, nms #E8E8E8, channels BOOST, other #E8E8E8.
- `.l9int-grid`: 9 columns × 5 rows (5 columns × 9 rows at ≤720). Cells are aspect 1/1 (137px at 1280).
  - Each cell has a bracket-frame SVG: viewBox 112x111, fill #2E2E2E with mask `l9ig2-cell-mask`, inset -1px. The path is in the saved HTML.
  - Tile button: 66% wide (63px at 1280), radius 12%, `4px solid #232327`, bg #0b0b0c, shadow `0 10px 26px rgba(0,0,0,.55)`, padding 6.
- Footnote: MONO 12px, DIM, marginTop 20, c111.

### Logo rendering modes

| mode | rendering |
|---|---|
| tile | img covering the tile |
| white | contained at `scale%`, no filter |
| mono | contained, `filter:brightness(0) invert(1)` |
| photo fallback | Google s2 favicon, then DuckDuckGo ico, with `grayscale(1) invert(1) contrast(1.15)` |
| text fallback | — |

The cell map (name→col,row,category,file,mode,scale) is in the bundle, chunk `20247`.

### Behaviour

- Entrance repeats every time the grid is ≥30% in view.
  - Tile opacity 0→1 over 0.9s easeInOut.
  - Tile scale .7→1 with spring {stiffness 200, damping 24}.
  - Both delayed by **(col+row)×45ms**, a diagonal wave. Verified live: tile 0 is fully in at about 900ms and tile 8 at about 1300ms.
- **Hover** (mouseenter on a pill or tile) sets the highlighted category, and click toggles a sticky selection. Hover takes priority over the sticky selection.
  - Matching pill: color and border become the accent, bg rgba(255,255,255,.03), 300ms.
  - Non-matching tiles: opacity 0.2 (0.9s easeInOut, no delay).
  - Matching tiles: border #3a3a3e (350ms), plus an accent overlay `linear-gradient(to top, accent, transparent)` at opacity .22 (425ms EASE).
  - mouseleave clears the hover.

## 5. CSR / control center (`section#csr.l9ctr-section`)

All static CSS is verbatim in `recon/style-blocks.css` (block 5). Several colours in that block are template values driven by the phase, as listed below.

### Layout

- `::before` glow: 900px or 76vw, 520px tall, radial purple/green, blur 42.
- Header: eyebrow c~33 · H2 · lede c~85, which is nowrap above 1080px.
  - The H2 holds two stacked titles (c22 and c19). Each ends with a period in BOOST or NEON. They crossfade on the answer phase: opacity 500ms, and the incoming title moves translateY 10→0.
- `.l9ctr-frame`: max 1216, radius 18, marginTop `clamp(42px,5vw,64px)`. At 1280 it is 1216x660.
- Head: 60px.
- `.l9ctr-stage`: aspect 1080/542 and `width: calc(100% - 48px)`. Its 1080x542 canvas is scaled by w/1080.
- Foot: 56px, with 3 metrics and an audit note.

### Phase loop

Starts once the section is ≥15% in view (`once`), then loops forever.

| phase | timing | frame-state label length |
|---|---|---|
| `type` | question c35 at **14ms per char**, then 200ms | 11 |
| `tangle` | 1600ms | 15, color BLINK `#FF5722` |
| `rail` | 750ms | 15, color rgba(255,255,255,.65) |
| `check` | 320×5+320 = **1920ms** | (same) |
| `answer` | 3000ms, then reset | 8 |

Measured cycle: 8.0s (state changes at 0, 0.81, 2.43, 5.06 and 8.09s).

### Canvas choreography

Coordinates are in the 1080x542 canvas; SVG is shifted -24px. Nodes are BILLING, ONT, NMS, GIS, CRM.

- **Question bubble**: left 8, top 152, width 262. Radius 14 14 14 4, bg #0A0B0C, 16px/1.45, min-height 68. It types with `.l9ctr-caret` (6x14).
- **Status line** below the bubble, mono 9.5px: shows one of 3 messages, turns NEON on answer, 300ms.
- **Inbound line**: `M270 274 H384` animates pathLength over 0.3s once typing ends.
- **tangle**:
  - 5 grey bezier paths draw from the hub to scattered nodes, pathLength 0.36s EASE, staggered 130ms.
  - Orange X marks (stroke #FF5722, 1.8) fade in at 130i+380ms.
  - Orange tags (mono 9.5px) fade in at 130i+430ms.
  - Node circles (r9) and node labels (mono 11px) sit at scattered positions.
- **rail**:
  - The tangle group fades out over 450ms.
  - Nodes spring to a horizontal rail at y 274, railX = 470, 596, 722, 848, 974, using spring {200, 24}.
  - Node circles turn into `.l9ctr-system-tile` cards 116x62 (from 18x18), radius 9, bg #101112. Their geometry animates over 0.33s EASE after a 0.26s delay. Labels appear at 510ms.
  - `.l9ctr-control-shell` at left 384, top 193, height 114 runs scaleX 0→1 over 0.58s EASE after 0.22s, with origin left.
  - Its label slides in x -6→0 over 0.24s after 0.66s.
  - A "9" badge 44x44 (white, radius 10, head 28/600) scales .8→1 over 400ms after 250ms.
  - A rail line draws over 0.6s after 0.35s.
- **check**: each tile shows its finding with a NEON ✓. The border becomes rgba(255,255,255,.28) and the label turns #fff, staggered **320ms per tile**. The result fades in at +120ms.
- **answer**:
  - Return path draws, pathLength over 0.9s EASE.
  - Shell border becomes rgba(46,235,133,.32).
  - The answer bubble (left 48, top ~370, width 222, radius 14 14 4 14, bg rgba(46,235,133,.06), 13.5px/1.5) fades and rises 8px over 400ms after **820ms**. Its border goes to rgba(46,235,133,.3) with a glow.

### ≤720px (`.l9ctr-mobile`)

- The stage is hidden. The frame is radius 14, and the head stacks into a column.
- Question box, then 5 rows (`.l9ctr-mobile-row`, 40px), then the answer, which fades and rises 6px over 350ms.
- Rows show their orange tags, then switch to "✓ finding" at the rail phase. The border, the dot and the flow line turn green over 320ms.
- Foot: 3 columns.
- At 390 the frame is 342x516.

## 6. Agent platform (`section`, `.l9dp-*`)

### Layout

- Header (motion wrapper with heavySpring, opacity and y 14): H2 c30 (textWrap balance) · lede c83, nowrap above 1080px.
- `.l9dp-stack`: max 1120, marginTop 52, with these layers top to bottom:
  1. **`.l9dp-top`**: radius 12, border rgba(255,255,255,.12), bg #141616, padding 24 26, min-height 96, shadow `0 16px 36px rgba(0,0,0,.28)`, a 2px WHITE_LINE top bar, a NEON 7px dot, a title (20px/500) and chips.
     - Chips: mono 11.5px, ls .06em, padding 6 14, radius 999, border rgba(255,255,255,.14), bg rgba(255,255,255,.03).
  2. **Connector SVG**: 1120x26, one vertical dashed line per card, `stroke-dasharray 4.07 4.07`, width .815, opacity .25.
  3. **`.l9dp-row`**: flex, gap 12, holding 3 cards.
     - Cards: radius 10, border rgba(255,255,255,.12), bg #111114, padding 22, a 2px *_LINE top bar, a 26px icon, a mono 12.5px label (ls .14em), and a 13px/1.45 DIM description.
  4. **Connector SVG** (same as layer 2).
  5. **`.l9dp-slab`**: radius 14, HAIRLINE border, bg #101013, padding 22 26, gap 20, a 54px Layer 9 mark SVG, a mono 12px label (ls .18em) and a 17px line.

### Motion

Triggered whenever the section is ≥35% in view. Not once: it reverses out of view. It builds **bottom-up**:

- slab: y 22→0 with heavySpring, delay 0.1s
- cards: y 14→0 with heavySpring, delay 0.6+0.22i
- lower connectors: opacity 0.4s, delay 0.9+0.08i
- top block: y -18→0 with snappySpring, delay 1.4
- upper connectors: delay 1.7+0.08i

While in view the lines carry `.l9dp-march`: `stroke-dashoffset 0→-8.14`, 1.6s linear, infinite (marching dashes).

### ≤760px

The row becomes a column with gap 10. Padding shrinks (see style block 6): top padding 16, title 17px, chips 10.5px centred, cards padding 14 16, slab padding 16, mark 42px, slab line 15px.

## 7. Security (`section#security`, server-rendered, no JS motion)

### Layout

- Header: eyebrow c13, H2 c26 L1, lede c82 (nowrap above 1080px).
- `.l9-security-matrix`: 2x2 grid, max 940, at 1280 it is 940x531. Radius 16, border rgba(255,255,255,.1).
- Each quadrant: min-height 236, padding `clamp(28px,3vw,36px)`.
  - 36px icon box: radius 9, border rgba(46,235,133,.18), bg rgba(46,235,133,.045).
  - Index: mono 10px, ls .14em, opacity .28.
  - h3: head font 18px/500/1.25, c14-21.
  - p: 15px/1.55 LEDE, max 46ch, c~106, 2 lines.
  - Proof line: mono 10.5px, ls .1em, DIM, border-top rgba(255,255,255,.07), c~48.

### Hover

Only with `(hover:hover) and (pointer:fine)`. All transitions 220ms ease.

- Quadrant bg becomes rgba(255,255,255,.018).
- Icon border becomes rgba(46,235,133,.28) and its bg rgba(46,235,133,.065).

### ≤720px

Single column, radius 14, quadrant padding 26 24. At 390 the matrix is 342x1128.

## 8. Closing CTA (`div` → 100vh stage, `.l9cc-stage`)

### Layout

- Inner box: height 100vh, padding 80 24 10, column, centred.
- Text block, max 980, centred: eyebrow c7 · title c29 (H2 size) · lede c67 at opacity .75.
- `.l9cc-stage`: `height:min(100%,66vh)`, aspect 572/687. At ≤720px it switches to width 100%, max 420, height auto.
- The stage is an inline SVG (viewBox 572x687) showing an isometric layer stack with the chip on top. It has a mask of `linear-gradient(to bottom, transparent 0, #000 7%, #000 62%, transparent 88%)`. **Copy the SVG from the saved HTML** (ids `l9ncsx-*`, `clip0_167_2148`).
- CTA row: marginTop -64, z 2, a single solid pill (165x50), `data-cta-location="closing"`.

### Motion

- A motion value `p` animates 0→1 over 2.4s easeInOut when ≥45% in view. When the section leaves view it returns to 0 over 0.9s easeOut.
- Layer offsets are springs on the transform of `p`:

| element | input range of p | output | spring |
|---|---|---|---|
| chip y | 0.24-0.88 | 0→172 | {190, 14, mass 1} (bouncy) |
| layers | 0.08-0.5 | 0→93 | {210, 16} |
| layers | 0.12-0.54 | 0→14 | {210, 16} |
| layers | 0.12-0.58 | 0→24 | {210, 16} |
| layers | 0.16-0.56 | 0→14 | {210, 16} |
| four highlight overlays (opacity) | 0.42-0.86 / 0.48-0.89 / 0.54-0.92 / 0.6-0.95 | 0→0.5 | {120, 22} |

- Four vertical dashed lines march (`strokeDashoffset 0→8.14`, 0.8s linear, repeat while in view). Their opacity is .3, or .55 once seated.
- **Seated** (p ≥ 0.92) fires three effects:
  - A full-bleed radial flash (`radial-gradient(62% 56% at 50% 52%, #FF57223d, #AB005226 40%, #B14EF114 58%, transparent 74%)`) runs opacity [0, .3, 0] over 2.4s easeOut with times [0, .22, 1].
  - 3 rings (orange, fuchsia, green, stroke 1.2) expand from r 10→620 while opacity goes .45→0, over 2.4s easeOut, with delays .25, .5 and .75s. They play once.
  - Diagonal sweeps (`l9ncsx-sweep` gradient rect 160x340, rotated 24°) run x -300→300 with opacity [0, .75, 0], 2.1s easeInOut. Delays per layer are 0, .25, .31, .33 and .38s. They repeat forever with a 3.4s repeatDelay.

## 9. Footer

- flex, space-between, wrap, gap 6 24, max 1560, padding 14 24 22, 14.5px.
- Left text c31 at rgba(255,255,255,.75).
- Right `.l9-footer-links` at rgba(255,255,255,.5): 2 links plus a "Cookies" button separated by " · ".
- Hit areas use `padding:13px 4px; margin:-13px -4px`.
- **Hover**: color becomes rgba(255,255,255,.85) over 200ms.
- The Cookies button opens the preferences modal.

## 10. Demo dialog (`<dialog aria-label>`)

- **Opens** from a document-level click handler on any `a[href="#demo"]` (preventDefault, then `showModal()`). It also opens on load if `location.hash === '#demo'`, after which the hash is stripped.
- Analytics events are optional to replicate.
- Closes on a backdrop click (target === dialog), the × button, or Esc (native).
- No open or close animation.
- Styles:
  - dialog: padding 0, transparent, `max-width:min(92vw,460px)`, width 100%.
  - `::backdrop`: rgba(0,0,0,.62).
  - Card: bg #101112, border rgba(255,255,255,.14), radius 16, padding 34 34 30.
- Header row: mono 11px label (ls .16em, DIM) and a × button (DIM, 18px, padding 4). Title: head font 27px/1.2, weight 350, marginTop 14. Intro: 14px/1.5, rgba(255,255,255,.65), marginTop 10.
- Form: marginTop 24, column, gap 16. Fields share `.l9demo-field`:
  - Style: transparent, no border except bottom 1px HAIRLINE, radius 0, padding 10 2 9, 15px, white.
  - Placeholder: rgba(255,255,255,.38).
  - Focus: bottom border becomes rgba(255,255,255,.7).
- Fields in order:
  1. full_name (required)
  2. email (type email, required)
  3. select number_of_subscribers: 7 options (placeholder "N/A", then 6 bands), `appearance:none`, color rgba(255,255,255,.8)
  4. coverage_areas
  5. how_did_you_hear_about_us
  6. hidden honeypot `website` (positioned off-screen)
  7. required checkbox privacyPolicy: label 12.5px/1.45, rgba(255,255,255,.6), accentColor #fff, with 2 links
- Submit: padding 13 30, radius 999, white bg, #090909 text, 15px/500, marginTop 6. While sending: opacity .7, cursor wait, label changes.
- Error: mono 11px uppercase, rgba(255,120,96,.9).
- POST `/api/submit-form/` with a JSON body and an `x-l9-submission-id` uuid header. Success shows a centred "received" state: mono label, head 26px line, and a ghost Close button (padding 11 30, radius 999, HAIRLINE border).

## 11. Cookie banner and preferences

- Banner shows when there is no stored consent: localStorage `l9.consent-v1` is absent, legacy key `l9-consent-v1` is also checked, and GPC auto-rejects.
  - Position: fixed, left 20, bottom 20, z 60, width `min(calc(100vw - 40px),420px)`.
  - Card: #101112, border rgba(255,255,255,.14), radius 16, padding 20 22, shadow `0 24px 60px rgba(0,0,0,.5)`.
  - Mono 10.5px label, and p 13.5px/1.5 at rgba(255,255,255,.8).
  - Buttons: padding 10 22, radius 999, 14px. Solid is white with border #fff and weight 500. Ghost has border rgba(255,255,255,.25). The text link is 13.5px rgba(255,255,255,.6), underlined, offset 3.
  - At 1280 the banner is 420x162; at 390 it is 350x225.
- Preferences modal (`role=dialog`, fixed inset 0, z 60): backdrop rgba(0,0,0,.62), card `min(92vw,480px)`, padding 30 30 26, two option rows (radius 11, padding 13 15) and 3 buttons. It also opens on the `#cookies` hash.

## 12. Breakpoints

| query | what changes |
|---|---|
| `max-width:1080px` | `.l9ctr-lede`, `.l9dp-lede` and `.l9sec-lede` go from nowrap to normal wrapping |
| `max-width:760px` | data-plane row stacks; data-plane padding and type shrink |
| `max-width:720px` | laptop becomes phone; use-cases stage becomes mobile list; integrations grid 9→5 columns with larger pills; CSR stage becomes mobile rows and the foot becomes 3 columns; security goes to 1 column; `.l9cc-stage` becomes width-driven |
| `(hover:hover) and (pointer:fine)` | security hover |
| `prefers-reduced-motion:reduce` | all animation off; episodes show their final state |

Fluid values everywhere use `clamp`: H1, H2, lede, section padding, the logo, the CSR frame margin and the security padding.

## 13. Assets

**Third-party brand logos** (integrations grid, 45 cells), served from `/logos/*`. Most are already in `public/assets/`. **Missing locally:** `zabbix.svg` (137x36), `zhone.png` (2000x642) and `zendesk-tile.svg` (150x150).

**Own brand**:

- `/stack-assets/layer9-lockup.svg` (logo)
- inline Layer 9 mark SVG (data-plane slab)
- `/favicon-32x32.svg`

**Generic UI art**:

- `/stack-assets/chip9-clean.png` (use-cases hub chip)
- CARTO dark basemap tiles (third-party map service; saved locally as `1687-1691@2x*.png`, covering the hero 7x5 tiles; the 3x3 tiles for the use-cases map card are a subset)
- All icons, the stack illustration and the cell frames are inline SVG (take them from the saved HTML)

**Fonts**: `public/fonts/` does **not exist** in the project yet. The live URLs are listed in the report.

No video, Lottie or canvas assets are loaded.
