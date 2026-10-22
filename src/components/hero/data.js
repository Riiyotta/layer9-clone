// Hero episode content and geometry. Copy and data are original placeholders
// for the fictional "Acme" brand; character counts track CLONE_SPEC.md §2.
import { BLINK } from '../../lib/tokens.js'

export const RED = '#D52B3A'
export const RED_TEXT = '#FF8089'
export const PANEL_BORDER = '#2A2B2E'

export const EYEBROW_TEXT = 'THE ISP AI PLATFORM' // c19
export const H1_TEXT = 'The Autonomous Brain for Modern ISPs.' // c37
export const PLACEHOLDER = 'Ask a question about your network…' // c34 (spec c32)

// Five typed prompts: 39 / 64 / 37 / 39 / 48 chars.
export const PROMPTS = [
  'Which subscribers look likely to leave?',
  'Turn this into a dashboard grouped by risk tier and root causes.',
  'Export these results to a spreadsheet',
  'Send this summary to the support leads.',
  'Set this report to go out every Monday at 7 a.m.',
]

export const PHASES = ['type', 'reveal', 'type2', 'dash', 'type3', 'excel', 'type4', 'email', 'type5', 'sched', 'reset']
// Typing phase → index into PROMPTS, and what follows each phase.
export const TYPE_INDEX = { type: 0, type2: 1, type3: 2, type4: 3, type5: 4 }
export const NEXT = {
  type: 'reveal', reveal: 'type2', type2: 'dash', dash: 'type3', type3: 'excel',
  excel: 'type4', type4: 'email', email: 'type5', type5: 'sched', sched: 'reset',
}
// Non-typing phase → prompt left showing in the bar.
export const SHOWN_INDEX = { reveal: 0, dash: 1, excel: 2, email: 3, sched: 4, reset: 4 }
export const HOLD_MS = { reveal: 1600, dash: 2400, excel: 2400, email: 2200, sched: 4200, reset: 560 }
export const CHAR_MS = 26
export const TYPE_HOLD_MS = 350

// ---- Map layer -----------------------------------------------------------
export const MAP_ZOOM = 12
export const MAP_X_FRAC = 0.24494805555555554 // lon ≈ -91.82
export const MAP_LAT = 30.0035
export const tileSrc = (x, y) => `/assets/map/${y}_${x - 1000}.png`

// Seeded LCG (16807 mod 2^31-1).
function lcg(seed) {
  let s = seed
  return () => ((s = (16807 * s) % 2147483647) - 1) / 2147483646
}
const r2 = (v) => Math.round(100 * v) / 100

export const AMBIENT = (() => {
  const rand = lcg(41)
  const out = []
  const clusters = [[545, 430, 26], [380, 335, 16], [700, 295, 14], [300, 520, 10], [765, 525, 12], [950, 350, 13], [900, 555, 10], [160, 400, 9]]
  for (const [cx, cy, n] of clusters) {
    for (let k = 0; k < n; k++) {
      const ang = rand() * Math.PI * 2
      const rad = rand() * rand() * 85
      out.push({ x: r2(cx + Math.cos(ang) * rad * 1.25), y: r2(cy + Math.sin(ang) * rad), a: 0.25 + 0.4 * rand() })
    }
  }
  return out.filter((d) => !(d.x > 470 && d.x < 700 && d.y > 330 && d.y < 400))
})()

// Phone composition (360x760 space). Not in the spec text; values from the reference bundle.
export const AMBIENT_PHONE = (() => {
  const rand = lcg(97)
  const out = []
  const clusters = [[115, 205, 16], [262, 365, 18], [155, 545, 13], [90, 415, 9], [285, 545, 9], [205, 140, 8]]
  for (const [cx, cy, n] of clusters) {
    for (let k = 0; k < n; k++) {
      const ang = rand() * Math.PI * 2
      const rad = rand() * rand() * 62
      out.push({ x: r2(cx + Math.cos(ang) * rad), y: r2(cy + Math.sin(ang) * rad * 1.25), a: 0.25 + 0.4 * rand() })
    }
  }
  return out
})()

const mk = (pts, c) => pts.map(([x, y]) => ({ x, y, c }))
export const RISK_DOTS = [
  ...mk([[330, 360], [300, 342], [268, 398], [382, 395], [248, 436], [352, 508], [700, 290], [672, 262], [712, 316], [738, 330], [652, 308], [520, 498], [566, 468], [480, 540], [614, 516], [448, 512]], BLINK),
  ...mk([[352, 318], [622, 452]], RED),
]
export const RISK_DOTS_PHONE = [
  ...mk([[108, 192], [86, 222], [138, 214], [72, 176], [128, 162], [252, 348], [284, 382], [236, 396], [268, 330], [298, 414], [224, 362], [148, 538], [184, 562], [122, 574], [166, 512]], BLINK),
  ...mk([[262, 300], [140, 480]], RED),
]

export const CALLOUTS = [
  { left: 118, top: 470, accent: BLINK, color: BLINK, text: '39 ELEVATED RISK · PINE HOLLOW / MARLOWE / ASHFORD', delay: 700 },
  { left: 246, top: 256, accent: RED, color: RED_TEXT, text: '3 CRITICAL', delay: 1000 },
  { left: 748, top: 238, accent: BLINK, color: BLINK, text: '7 RECENT OUTAGES', delay: 1150 },
]
export const SMALL_CALLOUTS = [
  { x: 366, y: 306, text: 'WEAK RX · −27.0 dBm', delay: 1250 },
  { x: 455, y: 498, text: 'WEAK RX · −25.0 dBm', delay: 1450 },
  { x: 240, y: 430, text: 'LINK FLAPPED', delay: 1650 },
]
export const CALLOUTS_PHONE = [
  { left: '6%', top: '44%', accent: BLINK, color: BLINK, text: '39 ELEVATED RISK · ACROSS 3 TOWNS', delay: 700 },
  { left: '58%', top: '30%', accent: RED, color: RED_TEXT, text: '3 CRITICAL', delay: 1000 },
]
export const SMALL_CALLOUTS_PHONE = [
  { left: '54%', top: '38.5%', text: 'WEAK RX · −27.0 dBm', delay: 1250 },
  { left: '10%', top: '65%', text: 'LINK FLAPPED', delay: 1650 },
]

// ---- Panels --------------------------------------------------------------
export const SUBSCRIBERS = [
  ['Dana Whitlock', 'Escalated', 92, 'Pine Hollow'],
  ['Marco Reyes', 'Escalated', 88, 'Marlowe'],
  ['Priya Lund', 'Elevated', 74, 'Ashford'],
  ['Owen Brask', 'Elevated', 71, 'Pine Hollow'],
  ['Tessa Kimura', 'Elevated', 69, 'Marlowe'],
]
export const isSevere = (tier) => tier === 'Escalated'

export const DASH_TITLE = 'RETENTION RISK · PAST 30D'
export const KPIS = [
  { label: 'AT RISK', value: '42', valueColor: '#fff', sub: 'of 52,180 subs' },
  { label: 'ESCALATED', value: '3', valueColor: RED_TEXT, sub: 'score ≥ 80' },
  { label: 'PROMO ENDING', value: '11', valueColor: '#fff', sub: 'of 42 at risk' },
]
export const KPI_DELAYS = [480, 140, 760]
export const TOWNS = [
  { label: 'Pine Hollow', count: 17 },
  { label: 'Marlowe', count: 15 },
  { label: 'Ashford', count: 10 },
]
export const DRIVERS = [
  { label: 'Promo expiring', count: 19 },
  { label: 'Slow speeds', count: 12 },
  { label: 'Repeat outages', count: 7 },
  { label: 'Other', count: 4 },
]
export const BAR_MAX = 19
// Own trend series in a 552x64 box; last point carries the end marker.
export const TREND = '0,50 46,48 92,50 138,45 184,46 230,41 276,42 322,36 368,37 414,31 460,28 506,23 552,17'
export const TREND_END = [552, 17]

export const SCHEDULES = [
  { name: 'Retention watch', to: 'Support leads', cadence: 'MON · 7:00 AM', isNew: true },
  { name: 'Network health', to: 'NOC', cadence: 'DAILY · 5:30 AM' },
  { name: 'Exec scorecard', to: 'Leadership', cadence: 'FRI · 3:00 PM' },
  { name: 'Upsell candidates', to: 'Sales', cadence: '1ST OF MONTH' },
  { name: 'Capex payback review', to: 'Finance', cadence: 'QUARTERLY' },
]
