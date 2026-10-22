import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import SectionHeader from './shared/SectionHeader.jsx'
import useReducedMotion from '../lib/useReducedMotion.js'
import { EASE, snappySpring, NEON, BOOST, STOP_ORANGE, DIM, HAIRLINE, MONO, HEAD } from '../lib/tokens.js'
import '../styles/controlcenter.css'

// CLONE_SPEC.md §5. All geometry is in the 1080x542 canvas space.
const QUESTION = 'Why does 88 Birch Rd keep dropping?'
const ANSWER =
  'Light levels on the fiber drop are failing, so the line keeps resetting. A tech visits Thu 1–3pm; we will text ahead.'

const HUB = { x: 300, y: 274 }
const RAIL_Y = 274

const NODES = [
  { id: 'billing', label: 'BILLING', scattered: { x: 700, y: 150 }, stall: { x: 622, y: 150 }, tag: 'SESSION TIMEOUT', railX: 470, finding: 'BALANCE $0' },
  { id: 'ont', label: 'OPTICAL LEVEL', scattered: { x: 596, y: 196 }, stall: { x: 528, y: 212 }, tag: 'ASK NOC', railX: 596, finding: 'RX POWER · −27.4 dBm', cause: true },
  { id: 'nms', label: 'NMS', scattered: { x: 762, y: 254 }, stall: { x: 694, y: 252 }, tag: 'VPN REQUIRED', railX: 722, finding: 'ALL GREEN' },
  { id: 'gis', label: 'SERVICE AREA', scattered: { x: 648, y: 336 }, stall: { x: 574, y: 326 }, tag: 'QUEUE: 9 MIN', railX: 848, finding: 'ZONE QUIET' },
  { id: 'crm', label: 'CRM', scattered: { x: 716, y: 428 }, stall: { x: 648, y: 408 }, tag: 'COPY + PASTE', railX: 974, finding: '3 RECENT CALLS' },
]

// Tangle curves: cubic from the hub to each stall point, control points
// pushed alternately above/below the rail so the paths cross each other.
const r = (n) => Math.round(n)
function tangleCurve({ x, y }, i) {
  const dx = x - HUB.x
  const swing = i % 2 === 0 ? 96 : -96
  return `M${HUB.x} ${HUB.y} C${r(HUB.x + dx * 0.42)} ${HUB.y + swing}, ${r(x - dx * 0.28)} ${r(y - swing * 0.75)}, ${x} ${y}`
}
NODES.forEach((n, i) => (n.d = tangleCurve(n.stall, i)))

const SHELL_LEFT = 384
const SHELL_W = NODES[NODES.length - 1].railX + 58 + 26 - SHELL_LEFT // 674
const RAIL_END = SHELL_LEFT + SHELL_W // 1058
const RET_X = Math.min(RAIL_END + 28, 1070)
const INBOUND = `M270 ${RAIL_Y} L${SHELL_LEFT} ${RAIL_Y}`
const RAIL_LINE = `M${SHELL_LEFT} ${RAIL_Y} L${RAIL_END} ${RAIL_Y}`
const RETURN_PATH = `M${RAIL_END} ${RAIL_Y} L${RET_X - 12} ${RAIL_Y} A12 12 0 0 1 ${RET_X} ${RAIL_Y + 12} L${RET_X} 455 A12 12 0 0 1 ${RET_X - 12} 467 L278 467`

const TILE_STEP = 320
const CHECK_MS = TILE_STEP * NODES.length + TILE_STEP // 1920

function useStageScale() {
  const ref = useRef(null)
  const [scale, setScale] = useState(1)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / 1080))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return { ref, scale }
}

function Caret({ show }) {
  return (
    <span
      className="l9ctr-caret"
      style={{
        display: show ? 'inline-block' : 'none',
        width: 6,
        height: 14,
        background: 'rgba(255,255,255,0.7)',
        marginLeft: 2,
        verticalAlign: '-2px',
      }}
    />
  )
}

export default function ControlCenter() {
  const sectionRef = useRef(null)
  const inView = useInView(sectionRef, { amount: 0.15, once: true })
  const reduced = useReducedMotion()
  const { ref: stageRef, scale } = useStageScale()

  const [typed, setTyped] = useState(0)
  const [phase, setPhase] = useState('type')

  useEffect(() => {
    if (reduced || !inView) return
    let t
    if (phase === 'type') {
      t = typed < QUESTION.length ? setTimeout(() => setTyped((n) => n + 1), 14) : setTimeout(() => setPhase('tangle'), 200)
    } else if (phase === 'tangle') t = setTimeout(() => setPhase('rail'), 1600)
    else if (phase === 'rail') t = setTimeout(() => setPhase('check'), 750)
    else if (phase === 'check') t = setTimeout(() => setPhase('answer'), CHECK_MS)
    else
      t = setTimeout(() => {
        setTyped(0)
        setPhase('type')
      }, 3000)
    return () => clearTimeout(t)
  }, [phase, typed, inView, reduced])

  const sent = reduced || phase !== 'type'
  const tangle = !reduced && phase === 'tangle'
  const routed = reduced || phase === 'rail' || phase === 'check' || phase === 'answer'
  const answered = reduced || phase === 'answer'
  const checked = answered || phase === 'check'
  const questionText = reduced ? QUESTION : QUESTION.slice(0, typed)
  const caret = !reduced && phase === 'type' && typed > 0

  const stateLabel = answered ? 'Answered' : routed ? 'Acme is routing' : tangle ? 'Working by hand' : 'New request'
  const stateColor = routed ? 'rgba(255,255,255,0.65)' : tangle ? STOP_ORANGE : DIM
  const modeColor = routed ? 'rgba(255,255,255,0.75)' : tangle ? STOP_ORANGE : 'rgba(255,255,255,0.6)'

  const canvas = useMemo(
    () => (
      <>
        <div className="l9ctr-mode-label">
          <strong style={{ color: modeColor }}>{routed ? 'COORDINATED BY ACME' : 'MANUAL PATH'}</strong>
          <span>{routed ? 'One pass through every source' : 'Five tools, no shared picture'}</span>
        </div>
        <div className="l9ctr-case-label">Ticket AC-55210 · Home broadband</div>

        <svg width={1080} height={542} aria-hidden style={{ position: 'absolute', inset: 0, transform: 'translateY(-24px)', overflow: 'visible' }}>
          <motion.path
            d={INBOUND}
            fill="none"
            stroke="rgba(255,255,255,0.45)"
            strokeOpacity={routed ? 0.52 : 0.46}
            strokeWidth={1.1}
            initial={false}
            animate={{ pathLength: sent ? 1 : 0, opacity: sent ? 1 : 0 }}
            transition={{ pathLength: { duration: 0.3 }, opacity: { duration: 0.22 } }}
          />
          <circle cx={HUB.x} cy={HUB.y} r={3} fill="#fff" opacity={routed ? 0 : sent ? 0.8 : 0.25} style={{ transition: 'opacity 300ms' }} />

          <g style={{ opacity: routed ? 0 : 1, transition: 'opacity 450ms' }}>
            {NODES.map((n, i) => (
              <g key={n.id}>
                <motion.path
                  d={n.d}
                  fill="none"
                  stroke="rgba(255,255,255,0.28)"
                  strokeWidth={1.1}
                  initial={false}
                  animate={{ pathLength: tangle || routed ? 1 : 0 }}
                  transition={{ duration: 0.36, delay: tangle ? 0.13 * i : 0, ease: EASE }}
                />
                <g
                  style={{
                    opacity: tangle ? 1 : 0,
                    transition: 'opacity 300ms',
                    transitionDelay: tangle ? `${130 * i + 380}ms` : '0ms',
                  }}
                >
                  <line x1={n.stall.x - 5} y1={n.stall.y - 5} x2={n.stall.x + 5} y2={n.stall.y + 5} stroke={STOP_ORANGE} strokeWidth={1.8} strokeLinecap="round" />
                  <line x1={n.stall.x + 5} y1={n.stall.y - 5} x2={n.stall.x - 5} y2={n.stall.y + 5} stroke={STOP_ORANGE} strokeWidth={1.8} strokeLinecap="round" />
                </g>
              </g>
            ))}
          </g>

          <motion.path
            d={RAIL_LINE}
            fill="none"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth={1}
            initial={false}
            animate={{ pathLength: routed ? 1 : 0 }}
            transition={{ duration: 0.6, delay: routed ? 0.35 : 0 }}
          />

          {NODES.map((n) => (
            <motion.circle
              key={n.id}
              r={9}
              fill="none"
              stroke="rgba(255,255,255,0.26)"
              strokeWidth={1.1}
              initial={false}
              animate={{ cx: routed ? n.railX : n.scattered.x, cy: routed ? RAIL_Y : n.scattered.y, opacity: routed ? 0 : 1 }}
              transition={{ cx: snappySpring, cy: snappySpring, opacity: { duration: 0.12, delay: routed ? 0.26 : 0 } }}
            />
          ))}

          <motion.path
            d={RETURN_PATH}
            fill="none"
            stroke="rgba(255,255,255,0.6)"
            strokeWidth={1.35}
            strokeLinecap="round"
            strokeLinejoin="miter"
            initial={false}
            animate={{ pathLength: answered ? 1 : 0, opacity: answered ? 0.84 : 0 }}
            transition={{ pathLength: { duration: 0.9, ease: EASE }, opacity: { duration: 0.2 } }}
          />
        </svg>

        <motion.div
          className="l9ctr-control-shell"
          aria-hidden
          initial={false}
          animate={{
            opacity: routed ? 1 : 0,
            scaleX: routed ? 1 : 0,
            borderColor: answered ? 'rgba(46,235,133,0.32)' : 'rgba(46,235,133,0.18)',
          }}
          transition={{
            opacity: { duration: 0.22, delay: routed ? 0.22 : 0 },
            scaleX: { duration: 0.58, delay: routed ? 0.22 : 0, ease: EASE },
            borderColor: { duration: 0.35 },
          }}
          style={{ left: SHELL_LEFT, top: 193, width: SHELL_W, height: 114, transformOrigin: 'left center' }}
        >
          <motion.div
            className="l9ctr-control-label"
            initial={false}
            animate={{ opacity: routed ? 1 : 0, x: routed ? 0 : -6 }}
            transition={{ duration: 0.24, delay: routed ? 0.66 : 0 }}
          >
            <i aria-hidden />
            Acme orchestration
          </motion.div>
        </motion.div>

        {NODES.map((n, i) => {
          const d = reduced || answered ? 0 : TILE_STEP * i
          const geo = { duration: 0.33, delay: routed ? 0.26 : 0, ease: EASE }
          return (
            <Fragment key={n.id}>
              <motion.div
                initial={false}
                animate={{
                  left: (routed ? n.railX : n.scattered.x) - 70,
                  top: (routed ? 292 : n.scattered.y + 14) - 24,
                  opacity: routed ? 0 : 1,
                }}
                transition={{ left: snappySpring, top: snappySpring, opacity: { duration: 0.2, delay: routed ? 0.12 : 0 } }}
                style={{
                  position: 'absolute',
                  width: 140,
                  textAlign: 'center',
                  fontFamily: MONO,
                  fontSize: 11,
                  letterSpacing: '0.12em',
                  color: 'rgba(255,255,255,0.75)',
                }}
              >
                {n.label}
              </motion.div>
              <div
                style={{
                  position: 'absolute',
                  left: n.stall.x - 70,
                  top: n.stall.y + 12 - 24,
                  width: 140,
                  textAlign: 'center',
                  fontFamily: MONO,
                  fontSize: 9.5,
                  letterSpacing: '0.1em',
                  color: STOP_ORANGE,
                  opacity: tangle ? 1 : 0,
                  transition: 'opacity 300ms',
                  transitionDelay: tangle ? `${130 * i + 430}ms` : '0ms',
                }}
              >
                {n.tag}
              </div>
              <motion.div
                className="l9ctr-system-tile"
                initial={false}
                animate={{
                  left: n.railX - (routed ? 58 : 9),
                  top: RAIL_Y - (routed ? 31 : 9) - 24,
                  width: routed ? 116 : 18,
                  height: routed ? 62 : 18,
                  borderRadius: 9,
                  opacity: routed ? 1 : 0,
                }}
                transition={{ left: geo, top: geo, width: geo, height: geo, opacity: { duration: 0.12, delay: routed ? 0.22 : 0 } }}
                style={{
                  position: 'absolute',
                  border: `1px solid ${checked ? 'rgba(255,255,255,0.28)' : HAIRLINE}`,
                  background: '#101112',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 7,
                  padding: '0 8px',
                  boxSizing: 'border-box',
                  transition: `border-color 300ms ${d}ms`,
                }}
              >
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 9.5,
                    letterSpacing: '0.1em',
                    whiteSpace: 'nowrap',
                    color: checked ? '#fff' : 'rgba(255,255,255,0.65)',
                    opacity: routed ? 1 : 0,
                    transform: routed ? 'translateY(0)' : 'translateY(3px)',
                    transition: `color 300ms ${d}ms, opacity 220ms ${routed ? 510 : 0}ms, transform 220ms ${routed ? 510 : 0}ms`,
                  }}
                >
                  {n.label}
                </div>
                <div
                  className="l9ctr-system-result"
                  style={{
                    fontFamily: MONO,
                    color: n.cause ? '#fff' : DIM,
                    opacity: checked ? 1 : 0,
                    transition: `opacity 300ms ${d + 120}ms`,
                  }}
                >
                  <span className="l9ctr-system-check">✓</span>
                  <span className="l9ctr-system-finding">{n.finding}</span>
                </div>
              </motion.div>
            </Fragment>
          )
        })}

        <div
          style={{
            position: 'absolute',
            left: 362,
            top: 228,
            width: 44,
            height: 44,
            borderRadius: 10,
            background: '#fff',
            display: 'grid',
            placeItems: 'center',
            fontFamily: HEAD,
            fontWeight: 600,
            fontSize: 28,
            color: '#090909',
            lineHeight: 1,
            zIndex: 2,
            boxSizing: 'border-box',
            border: `1px solid ${answered ? 'rgba(255,255,255,0.3)' : HAIRLINE}`,
            opacity: routed ? 1 : 0,
            transform: routed ? 'scale(1)' : 'scale(0.8)',
            transition: 'opacity 400ms, transform 400ms, box-shadow 350ms, border-color 350ms',
            transitionDelay: routed ? '250ms' : '0ms',
            boxShadow: answered ? '0 0 22px rgba(255,255,255,0.16)' : '0 6px 16px rgba(0,0,0,0.5)',
          }}
        >
          A
        </div>
      </>
    ),
    [sent, tangle, routed, checked, answered, reduced, modeColor],
  )

  return (
    <section ref={sectionRef} id="csr" className="l9ctr-section">
      <div className="l9ctr-intro">
        <SectionHeader
          eyebrow="03 · MEET ACME · THE CARE AGENT"
          title={
            <span style={{ position: 'relative', display: 'block' }}>
              <span aria-hidden={answered} style={{ display: 'block', opacity: answered ? 0 : 1, transition: 'opacity 500ms' }}>
                The queue keeps growing<span style={{ color: BOOST }}>.</span>
              </span>
              <span
                aria-hidden={!answered}
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: 0,
                  display: 'block',
                  opacity: answered ? 1 : 0,
                  transform: answered ? 'translateY(0)' : 'translateY(10px)',
                  transition: 'opacity 500ms, transform 500ms',
                }}
              >
                Solved on first ask<span style={{ color: NEON }}>.</span>
              </span>
            </span>
          }
          lede={<span className="l9ctr-lede">Five back-office systems queried at once, so every agent gives one clear answer.</span>}
        />
      </div>

      <div className="l9ctr-frame">
        <div className="l9ctr-frame-head">
          <div className="l9ctr-frame-brand">
            <span className="l9ctr-mark">A</span>
            <strong>Support desk workspace</strong>
            <span>Open case · 88 Birch Road</span>
          </div>
          <div className="l9ctr-frame-state" style={{ color: stateColor }}>
            <i aria-hidden />
            {stateLabel}
          </div>
        </div>

        <div ref={stageRef} className="l9ctr-stage">
          <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 542, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
            {canvas}
            <div style={{ position: 'absolute', left: 8, top: 152, width: 262 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: MONO, fontSize: 10.5, letterSpacing: '0.14em', color: DIM }}>
                <span
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)',
                    border: `1px solid ${HAIRLINE}`,
                    display: 'grid',
                    placeItems: 'center',
                    fontFamily: MONO,
                    fontSize: 7.5,
                    letterSpacing: '0.04em',
                    color: 'rgba(255,255,255,0.8)',
                    flex: 'none',
                  }}
                >
                  AGT
                </span>
                TO ACME · 9:14 AM
              </div>
              <div
                style={{
                  marginTop: 12,
                  padding: '14px 16px',
                  borderRadius: '14px 14px 14px 4px',
                  background: '#0A0B0C',
                  border: '1px solid rgba(255,255,255,0.14)',
                  fontSize: 16,
                  lineHeight: 1.45,
                  color: '#fff',
                  minHeight: 68,
                }}
              >
                {questionText}
                <Caret show={caret} />
              </div>
              <div
                style={{
                  marginTop: 10,
                  fontFamily: MONO,
                  fontSize: 9.5,
                  letterSpacing: '0.12em',
                  color: answered ? NEON : DIM,
                  transition: 'color 300ms',
                  minHeight: 12,
                }}
              >
                {sent ? (answered ? '✓ ANSWERED · FIRST TRY' : routed ? '✓ HANDED TO ACME' : '✓ SENT — CHECKING BY HAND…') : ''}
              </div>
              <div
                style={{
                  marginTop: 70,
                  marginLeft: 40,
                  width: 222,
                  opacity: answered ? 1 : 0,
                  transform: answered ? 'translateY(0)' : 'translateY(8px)',
                  transition: 'opacity 400ms, transform 400ms',
                  transitionDelay: answered ? '820ms' : '0ms',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: 8,
                    height: 22,
                    marginBottom: 8,
                    fontFamily: MONO,
                    fontSize: 10.5,
                    letterSpacing: '0.14em',
                    color: DIM,
                  }}
                >
                  ACME · 9:15 AM
                  <span
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 6,
                      background: '#fff',
                      color: '#090909',
                      display: 'grid',
                      placeItems: 'center',
                      fontFamily: HEAD,
                      fontWeight: 600,
                      fontSize: 13,
                      lineHeight: 1,
                      flex: 'none',
                    }}
                  >
                    A
                  </span>
                </div>
                <div
                  style={{
                    padding: '13px 15px',
                    boxSizing: 'border-box',
                    borderRadius: '14px 14px 4px 14px',
                    background: 'rgba(46,235,133,0.06)',
                    border: `1px solid ${answered ? 'rgba(46,235,133,0.3)' : HAIRLINE}`,
                    boxShadow: answered ? '0 0 26px rgba(46,235,133,0.07)' : 'none',
                    fontSize: 13.5,
                    lineHeight: 1.5,
                    color: 'rgba(255,255,255,0.92)',
                    transition: 'border-color 400ms, box-shadow 400ms',
                    transitionDelay: answered ? '820ms' : '0ms',
                  }}
                >
                  {ANSWER}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="l9ctr-mobile">
          <div className="l9ctr-mobile-question">
            {questionText}
            <Caret show={caret} />
          </div>
          <div className={`l9ctr-mobile-flow${routed ? ' is-routed' : ''}`}>
            {NODES.map((n) => (
              <div key={n.id} className="l9ctr-mobile-row" style={{ borderColor: routed ? 'rgba(46,235,133,0.18)' : HAIRLINE }}>
                <i aria-hidden style={{ borderColor: routed ? 'rgba(255,255,255,0.45)' : STOP_ORANGE }} />
                <strong>{n.label}</strong>
                <span style={{ color: routed ? 'rgba(255,255,255,0.65)' : STOP_ORANGE }}>{routed ? `✓ ${n.finding}` : n.tag}</span>
              </div>
            ))}
          </div>
          <div className="l9ctr-mobile-answer" style={{ opacity: answered ? 1 : 0, transform: `translateY(${answered ? 0 : 6}px)` }}>
            {ANSWER}
          </div>
        </div>

        <div className="l9ctr-frame-foot">
          <div className="l9ctr-metric">
            <strong>5</strong>
            <span>sources queried</span>
          </div>
          <div className="l9ctr-metric">
            <strong>1</strong>
            <span>fault isolated</span>
          </div>
          <div className="l9ctr-metric">
            <strong>0</strong>
            <span>escalations needed</span>
          </div>
          <span className="l9ctr-audit">Every lookup logged for later review</span>
        </div>
      </div>
    </section>
  )
}
