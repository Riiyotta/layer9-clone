// Design tokens measured from the reference build (see CLONE_SPEC.md §0).
export const EASE = [0.4, 0, 0.2, 1]
export const EASE_CSS = 'cubic-bezier(0.4,0,0.2,1)'
export const heavySpring = { type: 'spring', stiffness: 180, damping: 28 }
export const snappySpring = { type: 'spring', stiffness: 200, damping: 24 }

export const NEON = '#2EEB85'
export const BLINK = '#FF602E'
export const BOOST = '#BE6CF3'
export const STOP_ORANGE = '#FF5722'
export const FUCHSIA = '#AB0052'
export const GREEN = '#1DE97B'
export const PURPLE = '#B14EF1'
export const DIM = 'rgba(255,255,255,0.55)'
export const LEDE = 'rgba(255,255,255,0.75)'
export const HAIRLINE = 'rgba(255,255,255,0.1)'
export const GRAPHITE = '#191919'
export const TILE = '#1E1E1E'

const line = (a, b, c) =>
  `linear-gradient(270deg, #FFFFFF 1.53%, ${a} 21.8%, ${b} 62.35%, ${c} 102.91%)`
export const BLINK_LINE = line('#FF5722', '#AB0052', 'rgba(148,0,151,0)')
export const NEON_LINE = line('#1DE97B', '#004549', 'rgba(177,78,241,0)')
export const BOOST_LINE = line('#B14EF1', '#950059', 'rgba(172,7,175,0)')
export const WHITE_LINE = line('#FFFFFF', 'rgba(255,255,255,0.4)', 'rgba(255,255,255,0)')

export const MONO = 'var(--font-mono)'
export const HEAD = 'var(--font-head)'
export const BODY = 'var(--font-body)'

export const SECTION_PAD = 'clamp(84px, 8.5vw, 148px) 24px'

export const H1 = {
  fontFamily: HEAD,
  fontSize: 'clamp(46px, 5.2vw, 92px)',
  lineHeight: 1.05,
  letterSpacing: '-0.02em',
  fontWeight: 350,
  margin: 0,
}
export const H2 = {
  fontFamily: HEAD,
  fontSize: 'clamp(36px, 3.9vw, 66px)',
  lineHeight: 1.05,
  letterSpacing: '-0.015em',
  fontWeight: 350,
  margin: 0,
}
export const LEDE_STYLE = {
  fontSize: 'clamp(17px, 1.4vw, 23px)',
  lineHeight: 1.4,
  maxWidth: 800,
  margin: '24px auto 0',
  color: LEDE,
}
export const EYEBROW = {
  fontFamily: MONO,
  fontSize: 13,
  letterSpacing: '0.2em',
  lineHeight: '18.2px',
  color: DIM,
  textTransform: 'uppercase',
  margin: 0,
}
