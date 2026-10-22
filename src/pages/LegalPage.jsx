import { useEffect } from 'react'
import { Wordmark } from '../components/shared/Brand.jsx'
import '../styles/hero.css'
import { DIM, EYEBROW, H2, HAIRLINE, HEAD, LEDE, MONO } from '../lib/tokens'

// The reference serves its legal docs as PDFs, so this layout is built from the
// home page's own system: hero logo, eyebrow + H2 scale, lede colour, hairlines.
export default function LegalPage({ doc }) {
  useEffect(() => {
    document.title = `${doc.title} — Acme OS`
    window.scrollTo(0, 0)
  }, [doc])

  return (
    <main style={{ padding: '36px 24px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <a href="/" aria-label="Acme OS home" style={{ display: 'inline-flex' }}>
          <span className="l9h2-logo">
            <Wordmark />
          </span>
        </a>
      </div>

      <article style={{ maxWidth: 760, margin: '0 auto', padding: 'clamp(56px, 6vw, 96px) 0 clamp(84px, 8.5vw, 148px)' }}>
        <header style={{ textAlign: 'center', paddingBottom: 40, borderBottom: `1px solid ${HAIRLINE}` }}>
          <p style={EYEBROW}>Legal</p>
          <h1 style={{ ...H2, marginTop: 20 }}>{doc.title}</h1>
          <p style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.12em', color: DIM, marginTop: 22, textTransform: 'uppercase' }}>
            Last updated {doc.updated}
          </p>
          <p
            style={{
              display: 'inline-block',
              marginTop: 22,
              padding: '8px 14px',
              border: '1px solid rgba(255,96,46,0.35)',
              borderRadius: 999,
              background: 'rgba(255,96,46,0.06)',
              fontFamily: MONO,
              fontSize: 11,
              letterSpacing: '0.08em',
              color: 'rgba(255,255,255,0.75)',
            }}
          >
            PLACEHOLDER TEXT — REPLACE WITH YOUR COUNSEL-REVIEWED POLICY
          </p>
        </header>

        <p style={{ fontSize: 17, lineHeight: 1.6, color: LEDE, marginTop: 40 }}>{doc.intro}</p>

        {doc.sections.map((s, i) => (
          <section key={s.heading} style={{ marginTop: 44 }}>
            <h2 style={{ display: 'flex', alignItems: 'baseline', gap: 14, fontFamily: HEAD, fontSize: 24, fontWeight: 350, lineHeight: 1.25, letterSpacing: '-0.01em' }}>
              <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.32)' }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              {s.heading}
            </h2>
            {s.body.map((para, j) =>
              Array.isArray(para) ? (
                <ul key={j} style={{ margin: '14px 0 0', paddingLeft: 20, color: LEDE, fontSize: 15, lineHeight: 1.6 }}>
                  {para.map((li) => (
                    <li key={li} style={{ marginTop: 6 }}>
                      {li}
                    </li>
                  ))}
                </ul>
              ) : (
                <p key={j} style={{ marginTop: 14, fontSize: 15, lineHeight: 1.6, color: LEDE }}>
                  {para}
                </p>
              ),
            )}
          </section>
        ))}

        <p style={{ marginTop: 56, paddingTop: 20, borderTop: `1px solid ${HAIRLINE}`, fontSize: 14, color: DIM }}>
          Questions? Write to <a href="mailto:legal@acme.example" style={{ color: 'rgba(255,255,255,0.85)' }}>legal@acme.example</a>.
        </p>
      </article>
    </main>
  )
}
