import { BOOST, NEON, BLINK, BOOST_LINE, NEON_LINE, BLINK_LINE } from '../../lib/tokens'

// Fictional placeholder copy and data for "Acme". Persona order and accents
// follow CLONE_SPEC §3: BOOST, then NEON, then BLINK.
export const PERSONAS = [
  {
    key: 'fin',
    name: 'Finance',
    persona: 'FOR FINANCE TEAM',
    accent: BOOST,
    line: BOOST_LINE,
    prompts: [
      {
        tag: 'TRACK THE MONEY',
        q: 'Summarize this month’s revenue.',
        action: 'View the revenue report →',
        dash: {
          kind: 'kpi',
          caption: 'REVENUE SNAPSHOT · THIS MONTH',
          sources: 'BILLING / LEDGER / CRM / TICKETS',
          updated: '07:52 AM',
          stats: [
            { v: '36,905', l: 'PAYING SUBS', delta: '+418 net · 30d' },
            { v: '$2.64M', l: 'RECURRING', delta: '+2.4% MoM' },
            { v: '$71.55', l: 'AVG REVENUE', delta: '+$0.95 · 30d', hot: true },
          ],
          split: {
            title: 'REVENUE PER PLAN TIER',
            note: 'BLENDED $71.55',
            rows: [
              { label: 'GIGABIT', v: '$92.10', pct: 92, hot: true },
              { label: 'BASIC', v: '$54.80', pct: 55 },
            ],
          },
          foot: 'Gigabit plans now drive 61% of revenue',
        },
      },
      {
        tag: 'SPOT THE LEAKS',
        q: 'Which promos are costing us the most?',
        action: 'Review promo expirations →',
        dash: {
          kind: 'tiles',
          caption: 'PROMO COST · LAST 90 DAYS',
          sources: 'BILLING / PROMOS / CRM',
          updated: '3M AGO',
          tiles: [
            { l: 'SPRING BUNDLE', v: '$41.2K', delta: '+12% vs plan', spark: [4, 6, 5, 8, 9, 12, 14], detail: '2,140 accts still on promo', hot: true },
            { l: 'FREE INSTALL', v: '$18.7K', delta: 'flat', spark: [7, 6, 7, 7, 6, 7, 7], detail: 'offset by 9% lower churn' },
            { l: 'LOYALTY CREDIT', v: '$9.3K', delta: '-3%', spark: [5, 5, 4, 4, 3, 3, 2], detail: 'auto-expires in 21 days' },
            { l: 'STAFF PLANS', v: '$3.1K', delta: 'flat', spark: [3, 3, 3, 4, 3, 3, 3], detail: '64 employee lines' },
          ],
          foot: 'Spring bundle runs $4.9K/mo over budget',
        },
      },
      {
        tag: 'PLAN THE QUARTER',
        q: 'How did collections trend this quarter?',
        action: 'Open the aging report →',
        dash: {
          kind: 'bars',
          caption: 'COLLECTIONS RATE · BY MONTH',
          sources: 'BILLING / PAYMENTS / LEDGER',
          updated: '1H AGO',
          marker: { at: 90, label: 'TARGET 90%' },
          bars: [
            { label: 'JUN', value: '84%', h: 74 },
            { label: 'JUL', value: '86%', h: 75 },
            { label: 'AUG', value: '93%', h: 81, hot: true },
            { label: 'SEP MTD', value: '61%', h: 55 },
          ],
          foot: 'August beat target as autopay rose 6 pts',
        },
      },
    ],
  },
  {
    key: 'net',
    name: 'NetOps',
    persona: 'FOR NETWORK OPERATORS',
    accent: NEON,
    line: NEON_LINE,
    prompts: [
      {
        tag: 'FIND ROOT CAUSE',
        q: 'Why is this subscriber dropping at night?',
        action: 'Ship a replacement router →',
        dash: {
          kind: 'steps',
          caption: 'SUBSCRIBER DIAGNOSIS · LIVE',
          sources: 'OPTICS / CPE MGMT / TICKETS',
          updated: '7S AGO',
          steps: [
            { text: 'Light levels sit within range on every reading', stat: 'OK' },
            { text: 'Router resets nightly near 01:10 and 03:40', stat: '2 RESETS', hot: true },
            { text: 'An escalated ticket has waited for 4 days', stat: 'AGING' },
            { text: 'Likely the router power supply, not the fiber', stat: 'VERDICT' },
          ],
          foot: 'Root cause isolated in 7 seconds, any vendor',
        },
      },
      {
        tag: 'SHRINK OUTAGES',
        q: 'Show me where this outage begins.',
        action: 'Send a splice crew to the break →',
        dash: {
          kind: 'map',
          caption: 'OUTAGE PATH · LIVE',
          sources: 'NMS / FIBER PLANT / ALARMS',
          updated: '5S AGO',
          hotColor: '#FF453A',
          fiber: {
            d: 'M 40 40 L 88 58 L 126 72 L 156 96',
            site: { x: 40, y: 40, label: 'OLT-2' },
            cut: [156, 96],
            cutLabel: 'BREAK',
            dead: { d: 'M 156 96 L 184 112 L 214 130', hub: { x: 214, y: 130, label: 'CAB-7' } },
          },
          dots: {
            dim: [[30, 148], [58, 116], [52, 190], [96, 156], [80, 100], [114, 52], [158, 34], [198, 42], [240, 56], [286, 66], [306, 108], [292, 186], [116, 194], [146, 214], [76, 214], [186, 204], [312, 146], [262, 200]],
            hot: [[222, 134], [232, 126], [244, 136], [226, 146], [240, 152], [254, 144], [232, 160], [248, 164], [260, 154], [218, 154], [256, 130], [264, 166]],
          },
          ring: { x: 240, y: 146, r: 34, label: '58 MODEMS DOWN' },
          legend: [
            { label: 'MODEM DOWN', tone: 'hot' },
            { label: 'MODEM UP', tone: 'dim' },
          ],
          foot: 'One broken span · 58 modems sit behind it',
        },
      },
      {
        tag: 'UPGRADE SAFELY',
        q: 'Schedule firmware 4.1 for all routers on Sunday.',
        action: 'Approve the staged plan →',
        dash: {
          kind: 'rows',
          caption: 'STAGED UPDATE · 512 ROUTERS',
          sources: 'CPE MGMT / INVENTORY / CRM',
          updated: '12S AGO',
          rows: [
            { left: 'Wave 1 · quietest nodes go first', sub: 'no business accounts · 3 nodes', right: '180 CPES', meta: 'SUN 01:00', hot: true },
            { left: 'Wave 2 · waits on wave 1 health', sub: 'auto-revert above 1.5% errors', right: '170 CPES', meta: 'SUN 01:50' },
            { left: 'Wave 3 · remaining fleet', sub: 'finishes the rollout · 4 nodes', right: '162 CPES', meta: 'SUN 02:40' },
          ],
          foot: '512 routers over 9 nodes · about 2h 30m',
        },
      },
    ],
  },
  {
    key: 'care',
    name: 'Care Desk',
    persona: 'FOR SUPPORT LEADS',
    accent: BLINK,
    line: BLINK_LINE,
    prompts: [
      {
        tag: 'KEEP SLAS GREEN',
        q: 'Rank today’s open tickets by customer impact.',
        action: 'Open the ranked ticket queue →',
        dash: {
          kind: 'rows',
          caption: 'OPEN TICKETS · IMPACT × SLA',
          sources: 'TICKETS / NMS / CRM / SLA',
          updated: '10S AGO',
          rows: [
            { left: 'TKT-7713 · Maple Ridge', sub: 'node 4 · intermittent loss', right: '74 SUBS · 26M', meta: 'SLA IN 19M', hot: true },
            { left: 'TKT-7709 · Lakeview', sub: 'business line · tech en route', right: '33 SUBS · 14M', meta: 'ETA 9M' },
            { left: 'TKT-7716 · Pine Hollow', sub: 'Wi-Fi channel clash · fix queued', right: '9 SUBS', meta: 'REMOTE' },
          ],
          foot: 'Maple Ridge raised to P1 · crew alerted',
        },
      },
      {
        tag: 'STOP REPEAT VISITS',
        q: 'Where do our techs keep going back?',
        action: 'Open the callback list →',
        dash: {
          kind: 'map',
          caption: 'REPEAT VISITS · LAST 12 MONTHS',
          sources: 'WORK ORDERS / CPE DATA / GIS',
          updated: '40S AGO',
          dots: {
            dim: [[28, 44], [56, 62], [84, 30], [112, 68], [140, 38], [168, 72], [292, 74], [318, 60], [44, 112], [72, 142], [104, 104], [134, 150], [36, 180], [64, 204], [98, 176], [128, 206], [302, 172], [320, 196], [278, 198], [188, 44]],
            hot: [],
          },
          heat: [
            { x: 206, y: 124, n: 4 },
            { x: 222, y: 140, n: 3 },
            { x: 190, y: 138, n: 3 },
            { x: 232, y: 112, n: 2 },
            { x: 210, y: 156, n: 2 },
            { x: 248, y: 84, n: 2 },
            { x: 164, y: 176, n: 2 },
          ],
          ring: { x: 208, y: 132, r: 40, label: 'SHARED CABINET' },
          legend: [
            { label: 'REPEAT SITE · SIZE = VISITS', tone: 'hot' },
            { label: 'ONE VISIT', tone: 'dim' },
          ],
          foot: '$86K in repeats · $8.1K avoidable now',
        },
      },
      {
        tag: 'LEARN EACH WEEK',
        q: 'Recap last week’s field tickets.',
        action: 'Open the weekly summary →',
        dash: {
          kind: 'report',
          caption: 'FIELD TICKETS · LAST WEEK',
          sources: 'TICKETS / DISPATCH / CPE MGMT',
          updated: 'MON 06:30',
          lines: [
            { text: '187 tickets closed across 6 crews', stat: 'WEEK' },
            { text: '91% fixed on the very first visit', stat: '+3 PTS', hot: true },
            { text: '15 repeats, 9 of them tied to one cabinet', stat: 'REPEATS' },
            { text: '27 solved remotely with no truck sent', stat: 'SAVED' },
            { text: '4 installs queued for quality review', stat: 'QA' },
          ],
          foot: 'Repeat visits fell 3 pts from the prior week',
        },
      },
    ],
  },
]
