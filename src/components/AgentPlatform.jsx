import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { heavySpring, snappySpring, NEON, DIM, HAIRLINE, WHITE_LINE, MONO, BODY, SECTION_PAD } from '../lib/tokens'
import useReducedMotion from '../lib/useReducedMotion'
import SectionHeader from './shared/SectionHeader'
import { ChipMark } from './shared/Brand'
import Connectors from './platform/Connectors'
import {
  EYEBROW_LABEL,
  TITLE,
  LEDE_TEXT,
  TOP_TITLE,
  CHIPS,
  CARDS,
  SLAB_LABEL,
  SLAB_LINE,
} from './platform/content'

const accentBar = (background) => (
  <div aria-hidden="true" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background }} />
)

// CLONE_SPEC.md §6. Builds bottom-up whenever ≥35% in view; reverses when out.
export default function AgentPlatform({ num = '04' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { amount: 0.35 })
  const reduced = useReducedMotion()
  const march = inView && !reduced

  return (
    <section ref={ref} style={{ position: 'relative', padding: SECTION_PAD, color: '#fff', fontFamily: BODY }}>
      <motion.div
        initial={false}
        animate={{ opacity: inView ? 1 : 0, y: inView || reduced ? 0 : 14 }}
        transition={heavySpring}
      >
        <SectionHeader
          eyebrow={`${num} · ${EYEBROW_LABEL}`}
          title={<span style={{ textWrap: 'balance' }}>{TITLE}</span>}
          lede={<span className="l9dp-lede">{LEDE_TEXT}</span>}
        />
      </motion.div>

      <div className="l9dp-stack" style={{ maxWidth: 1120, margin: '52px auto 0', position: 'relative' }}>
        {/* 1. top block */}
        <motion.div
          className="l9dp-top"
          initial={false}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: reduced ? 0 : -18 }}
          transition={{ ...snappySpring, delay: inView ? 1.4 : 0 }}
          style={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.12)',
            background: '#141616',
            boxShadow: '0 16px 36px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.035)',
            minHeight: 96,
            padding: '24px 26px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 14,
          }}
        >
          {accentBar(WHITE_LINE)}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: NEON, flex: 'none' }} />
            <span className="l9dp-top-title" style={{ fontSize: 20, fontWeight: 500, whiteSpace: 'nowrap' }}>
              {TOP_TITLE}
            </span>
          </div>
          <div className="l9dp-chips" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {CHIPS.map((chip) => (
              <span
                key={chip}
                className="l9dp-chip"
                style={{
                  fontFamily: MONO,
                  fontSize: 11.5,
                  letterSpacing: '0.06em',
                  color: 'rgba(255,255,255,0.78)',
                  whiteSpace: 'nowrap',
                  padding: '6px 14px',
                  borderRadius: 999,
                  border: '1px solid rgba(255,255,255,0.14)',
                  background: 'rgba(255,255,255,0.03)',
                }}
              >
                {chip}
              </span>
            ))}
          </div>
        </motion.div>

        {/* 2. upper connectors */}
        <Connectors count={CARDS.length} on={inView} march={march} delayBase={1.7} />

        {/* 3. cards */}
        <div className="l9dp-row">
          {CARDS.map((card, i) => (
            <motion.div
              key={card.label}
              className="l9dp-card"
              initial={false}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: reduced ? 0 : 14 }}
              transition={{ ...heavySpring, delay: inView ? 0.6 + 0.22 * i : 0 }}
              style={{
                flex: 1,
                minWidth: 0,
                position: 'relative',
                borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.12)',
                background: '#111114',
                padding: '22px 22px',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
              }}
            >
              {accentBar(card.line)}
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(255,255,255,0.95)"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ flex: 'none' }}
                aria-hidden="true"
              >
                {card.icon}
              </svg>
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 12.5,
                    letterSpacing: '0.14em',
                    color: 'rgba(255,255,255,0.95)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {card.label}
                </div>
                <div style={{ marginTop: 5, fontSize: 13, lineHeight: 1.45, color: DIM }}>{card.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 4. lower connectors */}
        <Connectors count={CARDS.length} on={inView} march={march} delayBase={0.9} />

        {/* 5. slab */}
        <motion.div
          className="l9dp-slab"
          initial={false}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: reduced ? 0 : 22 }}
          transition={{ ...heavySpring, delay: inView ? 0.1 : 0 }}
          style={{
            position: 'relative',
            borderRadius: 14,
            overflow: 'hidden',
            border: `1px solid ${HAIRLINE}`,
            background: '#101013',
            padding: '22px 26px',
            display: 'flex',
            alignItems: 'center',
            gap: 20,
          }}
        >
          {accentBar(WHITE_LINE)}
          <div className="l9dp-mark" style={{ width: 54, height: 54, flex: 'none' }}>
            <ChipMark size={54} />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.18em', color: DIM }}>{SLAB_LABEL}</div>
            <div
              className="l9dp-slab-line"
              style={{ marginTop: 6, fontSize: 17, lineHeight: 1.45, color: 'rgba(255,255,255,0.88)' }}
            >
              {SLAB_LINE}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
