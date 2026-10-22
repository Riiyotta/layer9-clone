import { BLINK, BOOST, NEON } from '../../lib/tokens'

// Filter pills, in display order (CLONE_SPEC §4 category accents).
export const CATEGORIES = [
  { key: 'fiber', label: 'FIBER', accent: BLINK },
  { key: 'fixed-wireless', label: 'FIXED WIRELESS', accent: BOOST },
  { key: 'wi-fi', label: 'WI-FI', accent: NEON },
  { key: 'core', label: 'CORE', accent: NEON },
  { key: 'oss', label: 'OSS/BSS', accent: BLINK },
  { key: 'nms', label: 'NMS', accent: '#E8E8E8' },
  { key: 'channels', label: 'CHANNELS', accent: BOOST },
  { key: 'other', label: 'OTHER', accent: '#E8E8E8' },
]

export const accentOf = (key) => CATEGORIES.find((c) => c.key === key).accent

// 45 fictional vendors, row-major on the 9x5 desktop grid.
// [name, monogram, category]
const ROWS = [
  [
    ['Quarrel Optics', 'QO', 'fiber'],
    ['Skyvane', 'SV', 'fixed-wireless'],
    ['Chattern', 'CT', 'channels'],
    ['Ledgerline', 'LL', 'oss'],
    ['Tallyhouse', 'TH', 'oss'],
    ['Airloft', 'AL', 'fixed-wireless'],
    ['Lumenvale', 'LV', 'fiber'],
    ['Ringlet', 'RG', 'channels'],
    ['Invoya', 'IV', 'oss'],
  ],
  [
    ['Strandmere', 'SM', 'fiber'],
    ['Meshling', 'ML', 'wi-fi'],
    ['Beamwick', 'BW', 'fixed-wireless'],
    ['Watchtide', 'WT', 'nms'],
    ['Corvane', 'CV', 'core'],
    ['Subscribly', 'SB', 'oss'],
    ['Backbone Forge', 'BF', 'core'],
    ['Provisio', 'PV', 'oss'],
    ['Roomwave', 'RW', 'wi-fi'],
  ],
  [
    ['Ironhop', 'IH', 'core'],
    ['Glintpath', 'GP', 'fiber'],
    ['Mapsmith', 'MS', 'other'],
    ['Ridgecast', 'RC', 'fixed-wireless'],
    ['Pulsewell', 'PW', 'nms'],
    ['Inboxa', 'IX', 'channels'],
    ['Hearthnet', 'HN', 'wi-fi'],
    ['Quotient Grid', 'QG', 'oss'],
    ['Ferrovine', 'FV', 'fiber'],
  ],
  [
    ['Helpwharf', 'HW', 'channels'],
    ['Packetmill', 'PM', 'core'],
    ['Ratebook', 'RB', 'oss'],
    ['Switchyard Labs', 'SY', 'core'],
    ['Opalrun', 'OR', 'fiber'],
    ['Addrly', 'AD', 'other'],
    ['Routewell', 'RO', 'fiber'],
    ['Hollowmast', 'HM', 'fixed-wireless'],
    ['Cozyband', 'CB', 'oss'],
  ],
  [
    ['Pillowlink', 'PL', 'wi-fi'],
    ['Signalgrove', 'SG', 'nms'],
    ['Zephra Radio', 'ZR', 'fixed-wireless'],
    ['Truckwise', 'TW', 'fiber'],
    ['Callbright', 'CL', 'channels'],
    ['Fieldnote', 'FN', 'other'],
    ['Probewick', 'PK', 'fixed-wireless'],
    ['Uptimber', 'UT', 'nms'],
    ['Ticketfox', 'TF', 'oss'],
  ],
]

export const VENDORS = ROWS.flatMap((cells, row) =>
  cells.map(([name, mono, cat], col) => ({ name, mono, cat, col, row })),
)
