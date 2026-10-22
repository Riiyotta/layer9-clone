import { useEffect, useRef, useState } from 'react'
import { animate, motion, useInView, useMotionValue, useMotionValueEvent } from 'framer-motion'
import { STOP_ORANGE, FUCHSIA, PURPLE, EYEBROW, H2, LEDE_STYLE, BODY } from '../lib/tokens'
import useReducedMotion from '../lib/useReducedMotion'
import Pill from './shared/Pill'
import StackArt from './closing/StackArt'
import Rings from './closing/Rings'

// Placeholder copy for the fictional "Acme" brand (lengths per CLONE_SPEC.md §8).
const EYEBROW_TEXT = 'ACME OS'
const TITLE = 'Put your network on autopilot.'
const LEDE_TEXT = 'Connect each tool, team, and process into one calm, fast operation.'
const CTA_LABEL = 'Talk with us'

const MASK = 'linear-gradient(to bottom, transparent 0, #000 7%, #000 62%, transparent 88%)'
const FLASH = `radial-gradient(62% 56% at 50% 52%, ${STOP_ORANGE}3d, ${FUCHSIA}26 40%, ${PURPLE}14 58%, transparent 74%)`

export default function ClosingCTA() {
  const ref = useRef(null)
  const inView = useInView(ref, { amount: 0.45 })
  const anyInView = useInView(ref)
  const reduced = useReducedMotion()

  const p = useMotionValue(reduced ? 1 : 0)
  const [seated, setSeated] = useState(reduced)

  useEffect(() => {
    if (reduced) {
      p.jump(1)
      setSeated(true)
      return
    }
    const controls = animate(
      p,
      inView ? 1 : 0,
      inView ? { duration: 2.4, ease: 'easeInOut' } : { duration: 0.9, ease: 'easeOut' }
    )
    return () => controls.stop()
  }, [inView, reduced, p])

  useMotionValueEvent(p, 'change', (v) => {
    const next = v >= 0.92
    setSeated((prev) => (prev === next ? prev : next))
  })

  const lit = seated && !reduced

  return (
    <div ref={ref} style={{ position: 'relative', color: '#fff', fontFamily: BODY }}>
      <div
        style={{
          position: 'relative',
          height: '100vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 24px 10px',
          boxSizing: 'border-box',
        }}
      >
        <motion.div
          aria-hidden="true"
          initial={false}
          animate={{ opacity: lit ? [0, 0.3, 0] : 0 }}
          transition={lit ? { duration: 2.4, ease: 'easeOut', times: [0, 0.22, 1] } : { duration: 0.2 }}
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: FLASH }}
        />

        <div style={{ width: '100%', maxWidth: 980, flex: 'none', position: 'relative', textAlign: 'center' }}>
          <div style={{ ...EYEBROW, textTransform: 'none' }}>{EYEBROW_TEXT}</div>
          <h2 style={{ ...H2, marginTop: 20 }}>{TITLE}</h2>
          <p
            style={{
              fontSize: LEDE_STYLE.fontSize,
              lineHeight: 1.4,
              margin: '24px auto 0',
              maxWidth: 800,
              opacity: 0.75,
            }}
          >
            {LEDE_TEXT}
          </p>
        </div>

        <div
          style={{
            position: 'relative',
            flex: 1,
            minHeight: 0,
            maxHeight: '66vh',
            width: '100%',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <div className="l9cc-stage">
            <Rings lit={lit} />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                transform: 'translateZ(0)',
                maskImage: MASK,
                WebkitMaskImage: MASK,
                pointerEvents: 'none',
              }}
            >
              <StackArt progress={p} linesOn={anyInView && !reduced} seated={seated} reduced={reduced} />
            </div>
          </div>
        </div>

        <div
          style={{
            flex: 'none',
            display: 'flex',
            gap: 14,
            justifyContent: 'center',
            marginTop: -64,
            position: 'relative',
            zIndex: 2,
          }}
        >
          <Pill href="#demo" variant="solid" data-cta-location="closing">
            {CTA_LABEL}
          </Pill>
        </div>
      </div>
    </div>
  )
}
