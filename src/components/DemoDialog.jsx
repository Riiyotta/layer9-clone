import { useEffect, useRef, useState } from 'react'
import { MONO, HEAD, DIM, HAIRLINE } from '../lib/tokens'

// CLONE_SPEC §10. No network: submit simulates a 900ms send, then success.
const SEND_MS = 900

const field = {
  width: '100%',
  boxSizing: 'border-box',
  background: 'transparent',
  border: 'none',
  borderBottom: `1px solid ${HAIRLINE}`,
  borderRadius: 0,
  padding: '10px 2px 9px',
  fontSize: 15,
  lineHeight: '17px',
  color: '#fff',
  outline: 'none',
}
const label = { fontFamily: MONO, fontSize: 11, letterSpacing: '0.16em', color: DIM }
const inlineLink = { color: 'rgba(255,255,255,0.85)', textDecoration: 'underline' }

export default function DemoDialog() {
  const ref = useRef(null)
  const [status, setStatus] = useState('idle') // idle | sending | sent | error
  const close = () => ref.current?.close()

  useEffect(() => {
    const onClick = (e) => {
      const a = e.target.closest?.('a[href="#demo"]')
      if (!a) return
      e.preventDefault()
      setStatus('idle')
      ref.current?.showModal()
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  useEffect(() => {
    if (window.location.hash === '#demo') {
      history.replaceState(null, '', window.location.pathname + window.location.search)
      ref.current?.showModal()
    }
  }, [])

  const onSubmit = async (e) => {
    e.preventDefault()
    const form = e.currentTarget
    setStatus('sending')
    try {
      await new Promise((r) => setTimeout(r, SEND_MS))
      form.reset()
      setStatus('sent')
    } catch {
      setStatus('error')
    }
  }

  const sending = status === 'sending'

  return (
    <dialog
      ref={ref}
      aria-label="Book a demo"
      onClick={(e) => {
        if (e.target === ref.current) close()
      }}
      style={{ padding: 0, border: 'none', background: 'transparent', maxWidth: 'min(92vw, 460px)', width: '100%' }}
    >
      <div
        style={{
          background: '#101112',
          border: '1px solid rgba(255,255,255,0.14)',
          borderRadius: 16,
          padding: '34px 34px 30px',
          color: '#fff',
          fontFamily: 'inherit',
        }}
      >
        {status === 'sent' ? (
          <div style={{ textAlign: 'center', padding: '26px 0 22px' }}>
            <div style={label}>RECEIVED</div>
            <div style={{ fontFamily: HEAD, fontSize: 26, fontWeight: 350, marginTop: 14 }}>
              Thanks, we’ll reach out soon.
            </div>
            <button
              type="button"
              onClick={close}
              style={{
                marginTop: 26,
                padding: '11px 30px',
                borderRadius: 999,
                border: `1px solid ${HAIRLINE}`,
                background: 'transparent',
                color: 'rgba(255,255,255,0.85)',
                fontSize: 14,
                lineHeight: 'normal',
                cursor: 'pointer',
              }}
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
              <div style={label}>REQUEST DEMO</div>
              <button
                type="button"
                aria-label="Close"
                onClick={close}
                style={{
                  background: 'none',
                  border: 'none',
                  color: DIM,
                  fontSize: 18,
                  lineHeight: 1,
                  cursor: 'pointer',
                  padding: 4,
                }}
              >
                ×
              </button>
            </div>
            <div style={{ fontFamily: HEAD, fontSize: 27, fontWeight: 350, lineHeight: 1.2, marginTop: 14 }}>
              Let’s talk.
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.5, color: 'rgba(255,255,255,0.65)', marginTop: 10 }}>
              Share a little about your network and we’ll line up a walkthrough from there.
            </div>
            <form onSubmit={onSubmit} style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <input className="l9demo-field" style={field} name="full_name" placeholder="Your name" autoComplete="name" required />
              <input
                className="l9demo-field"
                style={field}
                name="email"
                type="email"
                placeholder="Company email"
                autoComplete="email"
                required
              />
              <select
                className="l9demo-field"
                style={{ ...field, appearance: 'none', color: 'rgba(255,255,255,0.8)' }}
                name="number_of_subscribers"
                defaultValue="N/A"
                aria-label="Subscriber count"
              >
                <option value="N/A">Subscriber count</option>
                <option value="under-1000">Under 1,000</option>
                <option value="1000-5000">1,000–5,000</option>
                <option value="5000-10000">5,000–10,000</option>
                <option value="10000-50000">10,000–50,000</option>
                <option value="50000-100000">50,000–100,000</option>
                <option value="100000+">100,000+</option>
              </select>
              <input className="l9demo-field" style={field} name="coverage_areas" placeholder="Service regions" autoComplete="off" />
              <input
                className="l9demo-field"
                style={field}
                name="how_did_you_hear_about_us"
                placeholder="Where did you find us?"
                autoComplete="off"
              />
              <input
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                style={{ position: 'absolute', left: -9999, width: 1, height: 1, opacity: 0 }}
              />
              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 9,
                  fontSize: 12.5,
                  color: 'rgba(255,255,255,0.6)',
                  lineHeight: 1.45,
                  cursor: 'pointer',
                }}
              >
                <input name="privacyPolicy" type="checkbox" required style={{ margin: '3px 3px 3px 4px', accentColor: '#fff' }} />
                <span>
                  By sending, I accept Acme’s{' '}
                  <a href="/privacy-policy/" style={inlineLink}>
                    privacy notice
                  </a>{' '}
                  and{' '}
                  <a href="/terms-of-service/" style={inlineLink}>
                    terms
                  </a>
                  .
                </span>
              </label>
              <button
                type="submit"
                disabled={sending}
                style={{
                  marginTop: 6,
                  padding: '13px 30px',
                  borderRadius: 999,
                  border: 'none',
                  background: '#fff',
                  color: '#090909',
                  fontSize: 15,
                  fontWeight: 500,
                  lineHeight: '17px',
                  cursor: sending ? 'wait' : 'pointer',
                  opacity: sending ? 0.7 : 1,
                }}
              >
                {sending ? 'Sending…' : 'Book'}
              </button>
              {status === 'error' ? (
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 11,
                    letterSpacing: '0.08em',
                    color: 'rgba(255,120,96,0.9)',
                    textTransform: 'uppercase',
                  }}
                >
                  That didn’t go through. Please retry.
                </div>
              ) : null}
            </form>
          </>
        )}
      </div>
    </dialog>
  )
}
