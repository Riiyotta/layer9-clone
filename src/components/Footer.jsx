import { LEDE } from '../lib/tokens'
import { openCookiePreferences } from './CookieBanner'
import { PRIVACY_PATH, TERMS_PATH } from '../lib/routes'

// CLONE_SPEC §9. Link hover + hit areas live in sections.css.
export default function Footer() {
  return (
    <footer
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '6px 24px',
        width: '100%',
        maxWidth: 1560,
        margin: '0 auto',
        padding: '14px 24px 22px',
        fontSize: 14.5,
        color: LEDE,
      }}
    >
      <span>© 2026 Acme Inc. Made for ISPs.</span>
      <span className="l9-footer-links" style={{ color: 'rgba(255,255,255,0.5)' }}>
        <a href={PRIVACY_PATH}>Privacy</a> · <a href={TERMS_PATH}>Terms</a> ·{' '}
        <button
          type="button"
          onClick={openCookiePreferences}
          style={{
            background: 'none',
            border: 'none',
            font: 'inherit',
            color: 'inherit',
            textDecoration: 'none',
            cursor: 'pointer',
          }}
        >
          Cookies
        </button>
      </span>
    </footer>
  )
}
