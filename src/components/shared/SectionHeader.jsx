import { EYEBROW, H2, LEDE_STYLE } from '../../lib/tokens'

export default function SectionHeader({ eyebrow, title, lede, ledeClassName, style }) {
  return (
    <div style={{ maxWidth: 980, margin: '0 auto', textAlign: 'center', ...style }}>
      {eyebrow && <p style={EYEBROW}>{eyebrow}</p>}
      <h2 style={{ ...H2, marginTop: eyebrow ? 20 : 0 }}>{title}</h2>
      {lede && (
        <p className={ledeClassName} style={LEDE_STYLE}>
          {lede}
        </p>
      )}
    </div>
  )
}
