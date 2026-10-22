import { useEffect, useState } from 'react'
import { MONO, HEAD, DIM, HAIRLINE } from '../lib/tokens'

// CLONE_SPEC §11.
const STORAGE_KEY = 'acme.consent-v1'
const OPEN_EVENT = 'acme:cookie-preferences'
const ACCEPT = { analytics: true, marketing: false }
const REJECT = { analytics: false, marketing: false }

// Footer "Cookies" button calls this.
export function openCookiePreferences() {
  window.dispatchEvent(new Event(OPEN_EVENT))
}

function readConsent() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const v = JSON.parse(raw)
    if (typeof v?.analytics !== 'boolean' || typeof v?.marketing !== 'boolean') return null
    return { analytics: v.analytics, marketing: v.marketing }
  } catch {
    return null
  }
}

function writeConsent(v) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(v))
  } catch {
    /* storage unavailable */
  }
}

const btn = { padding: '10px 22px', borderRadius: 999, fontSize: 14, lineHeight: 1.2, whiteSpace: 'nowrap', cursor: 'pointer' }
const solid = { ...btn, border: '1px solid #fff', background: '#fff', color: '#090909', fontWeight: 500 }
const ghost = { ...btn, border: '1px solid rgba(255,255,255,0.25)', background: 'transparent', color: 'rgba(255,255,255,0.88)' }
const card = { background: '#101112', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 16, color: '#fff' }
const closeBtn = { background: 'none', border: 'none', color: DIM, fontSize: 18, lineHeight: 1, cursor: 'pointer', padding: 4 }

export default function CookieBanner() {
  const [consent, setConsent] = useState(null)
  const [hydrated, setHydrated] = useState(false)
  const [prefsOpen, setPrefsOpen] = useState(false)

  useEffect(() => {
    let c = readConsent()
    if (c === null && navigator.globalPrivacyControl) {
      c = REJECT
      writeConsent(c)
    }
    setConsent(c)
    setHydrated(true)
    if (window.location.hash === '#cookies') {
      history.replaceState(null, '', window.location.pathname + window.location.search)
      setPrefsOpen(true)
    }
    const open = () => setPrefsOpen(true)
    window.addEventListener(OPEN_EVENT, open)
    return () => window.removeEventListener(OPEN_EVENT, open)
  }, [])

  const save = (v) => {
    writeConsent(v)
    setPrefsOpen(false)
    setConsent(v)
  }

  const showBanner = hydrated && consent === null && !prefsOpen

  return (
    <>
      {showBanner ? (
        <div
          role="region"
          aria-label="Cookie consent"
          style={{ position: 'fixed', left: 20, bottom: 20, zIndex: 60, width: 'min(calc(100vw - 40px), 420px)' }}
        >
          <div style={{ ...card, padding: '20px 22px', boxShadow: '0 24px 60px rgba(0,0,0,0.5)' }}>
            <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: '0.16em', color: DIM }}>YOUR PRIVACY</div>
            <p style={{ margin: '10px 0 0', fontSize: 13.5, lineHeight: 1.5, color: 'rgba(255,255,255,0.8)' }}>
              We’d like to measure anonymous site usage. Storage the site needs to run is always on. See our{' '}
              <a href="/privacy-policy/" style={{ color: 'rgba(255,255,255,0.95)', textDecoration: 'underline' }}>
                privacy notice
              </a>
              .
            </p>
            <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
              <button type="button" onClick={() => save(ACCEPT)} style={solid}>
                Accept
              </button>
              <button type="button" onClick={() => save(REJECT)} style={ghost}>
                Reject optional ones
              </button>
              <button
                type="button"
                onClick={() => setPrefsOpen(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '10px 6px',
                  fontSize: 13.5,
                  color: 'rgba(255,255,255,0.6)',
                  textDecoration: 'underline',
                  textUnderlineOffset: 3,
                  cursor: 'pointer',
                }}
              >
                Customize
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {prefsOpen ? <Preferences initial={consent} onClose={() => setPrefsOpen(false)} onSave={save} /> : null}
    </>
  )
}

function Preferences({ initial, onClose, onSave }) {
  const [analytics, setAnalytics] = useState(initial?.analytics ?? false)

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Privacy settings"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.62)', border: 'none', cursor: 'pointer' }}
      />
      <div
        style={{
          ...card,
          position: 'relative',
          width: 'min(92vw, 480px)',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '30px 30px 26px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.16em', color: DIM }}>PRIVACY SETTINGS</div>
          <button type="button" aria-label="Close" onClick={onClose} style={closeBtn}>
            ×
          </button>
        </div>
        <div style={{ fontFamily: HEAD, fontSize: 24, fontWeight: 350, lineHeight: 1.25, marginTop: 12 }}>
          Pick what we can store.
        </div>
        <p style={{ margin: '10px 0 0', fontSize: 13, lineHeight: 1.5, color: 'rgba(255,255,255,0.65)' }}>
          Essential storage for security and spam protection on our forms is always active. More in our{' '}
          <a href="/privacy-policy/" style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'underline' }}>
            privacy notice
          </a>
          .
        </p>
        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Option label="Essential" description="Needed for pages and forms to work at all. This one can’t be turned off." checked disabled />
          <Option
            label="Analytics"
            description="Shows us, anonymously, which pages people read and use."
            checked={analytics}
            onChange={setAnalytics}
          />
        </div>
        <div style={{ marginTop: 24, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <button type="button" onClick={() => onSave({ analytics, marketing: false })} style={solid}>
            Save choices
          </button>
          <button type="button" onClick={() => onSave(REJECT)} style={ghost}>
            Decline all
          </button>
          <button type="button" onClick={() => onSave(ACCEPT)} style={ghost}>
            Allow all
          </button>
        </div>
      </div>
    </div>
  )
}

function Option({ label, description, checked, onChange, disabled }) {
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: '13px 15px',
        border: `1px solid ${HAIRLINE}`,
        borderRadius: 11,
        background: 'rgba(255,255,255,0.025)',
        cursor: disabled ? 'default' : 'pointer',
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={onChange ? (e) => onChange(e.target.checked) : undefined}
        readOnly={!onChange}
        style={{ marginTop: 2, accentColor: '#fff' }}
      />
      <span style={{ minWidth: 0 }}>
        <span style={{ display: 'block', fontSize: 14, color: 'rgba(255,255,255,0.92)' }}>
          {label}
          {disabled ? (
            <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.1em', color: DIM, marginLeft: 8 }}>
              REQUIRED
            </span>
          ) : null}
        </span>
        <span style={{ display: 'block', marginTop: 3, fontSize: 12.5, lineHeight: 1.45, color: 'rgba(255,255,255,0.55)' }}>
          {description}
        </span>
      </span>
    </label>
  )
}
