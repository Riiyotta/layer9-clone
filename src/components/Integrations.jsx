import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { EYEBROW, H2, LEDE_STYLE, SECTION_PAD, MONO, DIM, EASE_CSS, snappySpring } from '../lib/tokens'
import useReducedMotion from '../lib/useReducedMotion'
import { CATEGORIES, VENDORS, accentOf } from './integrations/vendors'
import CellFrame from './integrations/CellFrame'
import Monogram from './integrations/Monogram'

// CLONE_SPEC §4.
export default function Integrations({ num = '03' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { amount: 0.3 })
  const reduced = useReducedMotion()
  const [hovered, setHovered] = useState(null)
  const [selected, setSelected] = useState(null)
  const active = hovered ?? selected
  const toggle = (key) => setSelected((cur) => (cur === key ? null : key))

  return (
    <div ref={ref} style={{ maxWidth: 1440, margin: '0 auto', padding: SECTION_PAD, color: '#fff' }}>
      <div style={{ textAlign: 'center', marginBottom: 52 }}>
        <div style={EYEBROW}>{num} · CONNECTORS</div>
        <motion.h2
          initial={false}
          animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 14 }}
          transition={{ type: 'spring', damping: 28 }}
          style={{ ...H2, margin: '20px 0 0' }}
        >
          Plugs into the tools you run now.
        </motion.h2>
        <motion.p
          initial={false}
          animate={{ opacity: inView ? 0.75 : 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          style={{ ...LEDE_STYLE, color: '#fff' }}
        >
          Routers, radios, monitoring and billing: Acme already speaks all of them.
        </motion.p>
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 44, flexWrap: 'wrap' }}>
        {CATEGORIES.map((c) => {
          const on = active === c.key
          return (
            <button
              key={c.key}
              type="button"
              className="l9int-pill"
              aria-pressed={selected === c.key}
              onMouseEnter={() => setHovered(c.key)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => toggle(c.key)}
              style={{
                fontFamily: MONO,
                fontSize: 12,
                lineHeight: 'normal',
                letterSpacing: '0.12em',
                borderRadius: 999,
                border: `1px solid ${on ? c.accent : 'rgba(255,255,255,0.14)'}`,
                color: on ? c.accent : 'rgba(255,255,255,0.6)',
                background: on ? 'rgba(255,255,255,0.03)' : 'none',
                cursor: 'pointer',
                transition: 'color 300ms, border-color 300ms',
              }}
            >
              {c.label}
            </button>
          )
        })}
      </div>

      <div className="l9int-grid">
        {VENDORS.map((v) => {
          const match = active === v.cat
          const delay = !inView || reduced ? 0 : (v.col + v.row) * 0.045
          return (
            <div
              key={`${v.col}-${v.row}`}
              style={{ aspectRatio: '1 / 1', position: 'relative', display: 'grid', placeItems: 'center' }}
            >
              <CellFrame />
              <motion.button
                type="button"
                aria-label={v.name}
                title={v.name}
                initial={false}
                animate={{
                  opacity: inView ? (active && !match ? 0.2 : 1) : 0,
                  scale: inView ? 1 : 0.7,
                }}
                transition={{
                  opacity: { duration: reduced ? 0 : 0.9, ease: 'easeInOut', delay },
                  scale: { ...snappySpring, delay },
                }}
                onMouseEnter={() => setHovered(v.cat)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => toggle(v.cat)}
                style={{
                  width: '66%',
                  aspectRatio: '1 / 1',
                  borderRadius: '12%',
                  border: `4px solid ${match ? '#3a3a3e' : '#232327'}`,
                  background: '#0b0b0c',
                  boxShadow: '0 10px 26px rgba(0,0,0,0.55)',
                  color: '#fff',
                  display: 'grid',
                  placeItems: 'center',
                  cursor: 'pointer',
                  transition: 'border-color 350ms',
                  padding: 6,
                  overflow: 'hidden',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: `linear-gradient(to top, ${accentOf(v.cat)}, transparent)`,
                    opacity: match ? 0.22 : 0,
                    transition: `opacity 425ms ${EASE_CSS}`,
                    pointerEvents: 'none',
                    zIndex: 2,
                  }}
                />
                <Monogram letters={v.mono} />
              </motion.button>
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: 20, textAlign: 'center', fontFamily: MONO, fontSize: 12, color: DIM }}>
        45 systems connected out of the box · nothing to build, nothing to migrate · fresh connectors ship every month
      </div>
    </div>
  )
}
