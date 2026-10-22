// Hero / closing CTA pills. The originals have no hover styles.
const base = {
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  padding: '15px 36px',
  borderRadius: 999,
  fontFamily: 'var(--font-body)',
  fontSize: 17,
  lineHeight: 1.2,
  textDecoration: 'none',
  whiteSpace: 'nowrap',
}

export default function Pill({ href = '#demo', variant = 'solid', glim = false, children, ...rest }) {
  const style =
    variant === 'solid'
      ? { ...base, background: '#fff', color: '#090909', fontWeight: 500, border: 0 }
      : {
          ...base,
          background: 'transparent',
          color: 'rgba(255,255,255,0.88)',
          fontWeight: 400,
          border: '1px solid rgba(255,255,255,0.25)',
        }
  return (
    <a href={href} style={style} {...rest}>
      {glim && <span className="l9pill-glim" aria-hidden="true" />}
      <span style={{ position: 'relative' }}>{children}</span>
    </a>
  )
}
