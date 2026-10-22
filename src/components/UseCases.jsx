import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { EASE, snappySpring, SECTION_PAD, MONO, HEAD, BODY, DIM, HAIRLINE, GRAPHITE, TILE } from '../lib/tokens'
import useReducedMotion from '../lib/useReducedMotion'
import SectionHeader from './shared/SectionHeader'
import { ChipMark } from './shared/Brand'
import { SYSTEMS } from './usecases/systems'
import { PERSONAS } from './usecases/personas'
import AnswerDash from './usecases/AnswerDash'

// Canvas geometry (1080x678 space), CLONE_SPEC §3.
const C0 = (1080 - (80 * SYSTEMS.length + (SYSTEMS.length - 1) * 40)) / 2
const tileX = (i) => C0 + 120 * i + 40
const HUB_X = 540
const HUB_Y = 190
const HUB_R = 40
const connector = (i) => {
  const x = tileX(i)
  return `M ${x} 90 C ${x} 128, ${HUB_X} ${HUB_Y - 88}, ${HUB_X} ${HUB_Y - HUB_R - 4}`
}
const WIN = { left: 40, top: 254, width: 1000, height: 408 }
const SPINE = `M 540 ${HUB_Y + HUB_R + 4} L 540 ${WIN.top - 4}`
const PIN_TILES = [1, 4, 7]

function useCanvasScale() {
  const ref = useRef(null)
  const [scale, setScale] = useState(1)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setScale(Math.min(width / 1080, height / 678))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return { ref, scale }
}

export default function UseCases() {
  const { ref: stageRef, scale } = useCanvasScale()
  const sectionRef = useRef(null)
  const seen = useInView(sectionRef, { once: true, amount: 0.2 })
  const inView = useInView(sectionRef, { amount: 0.3 })
  const reduced = useReducedMotion()

  // Reduced motion: final state, no timers.
  const shown = seen || reduced
  const [activeState, setActive] = useState(false)
  const active = activeState || reduced
  useEffect(() => {
    if (!seen || active) return
    const t = setTimeout(() => setActive(true), 1150)
    return () => clearTimeout(t)
  }, [seen, active])

  const [pi, setPi] = useState(0)
  const [qi, setQi] = useState(0)
  const [bump, setBump] = useState(0)
  useEffect(() => {
    if (!inView || reduced || !active) return
    const id = setInterval(() => {
      setPi((p) => (p + 1) % PERSONAS.length)
      setQi(0)
    }, 7000)
    return () => clearInterval(id)
  }, [inView, reduced, active, bump])

  const pickPersona = (i) => {
    if (i !== pi) {
      setPi(i)
      setQi(0)
    }
    setBump((b) => b + 1)
  }
  const pickPrompt = (i) => {
    setQi(i)
    setBump((b) => b + 1)
  }

  const p = PERSONAS[pi]
  const prompt = p.prompts[qi]
  const counting = inView && !reduced && active
  const pins = shown && inView && !reduced && active
  const draw = (delay, duration = 0.55) => (reduced ? { duration: 0 } : { duration, delay, ease: EASE })

  return (
    <section ref={sectionRef} id="use-cases" style={{ position: 'relative', padding: SECTION_PAD, color: '#fff', fontFamily: BODY }}>
      <SectionHeader
        eyebrow="02 · HOW ACME WORKS"
        title={
          <>
            Link Every Tool You Run.
            <br />
            Then Act On Every Answer.
          </>
        }
        lede="Ask in plain words and get the answer, the proof behind it, and what to do next."
      />

      <div
        ref={stageRef}
        className="l9uc-stage"
        style={{ position: 'relative', width: '100%', maxWidth: 1380, margin: '64px auto 0', aspectRatio: '1080 / 678' }}
      >
        <div
          style={{
            position: 'absolute', left: '50%', top: '50%', width: 1080, height: 678,
            transform: `translate(-50%, -50%) scale(${scale})`, transformOrigin: 'center',
          }}
        >
          <svg width={1080} height={678} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            {SYSTEMS.map((s, i) => (
              <motion.path
                key={s.label}
                d={connector(i)}
                fill="none"
                stroke="rgba(255,255,255,0.32)"
                strokeWidth={0.9}
                initial={false}
                animate={{ pathLength: shown ? 1 : 0, opacity: shown ? 1 : 0 }}
                transition={draw(0.25 + 0.05 * i)}
              />
            ))}
            <motion.path
              d={SPINE}
              fill="none"
              stroke={p.accent}
              strokeOpacity={0.7}
              strokeWidth={1.3}
              initial={false}
              animate={{ pathLength: shown ? 1 : 0, opacity: shown ? 1 : 0 }}
              transition={draw(0.85, 0.35)}
              style={{ transition: 'stroke 400ms' }}
            />
            {pins &&
              PIN_TILES.map((t, i) => (
                <circle key={`pin-${t}`} r={2.4} fill="#fff" opacity={0.9}>
                  <animateMotion dur={`${2.4 + 0.5 * i}s`} begin={`${-(0.8 * i)}s`} repeatCount="indefinite" path={connector(t)} />
                </circle>
              ))}
            {pins && (
              <circle r={2.8} fill={p.accent} opacity={0.95}>
                <animateMotion dur="1.4s" repeatCount="indefinite" path={SPINE} />
              </circle>
            )}
          </svg>

          {SYSTEMS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={false}
              animate={{ opacity: shown ? 1 : 0, scale: shown ? 1 : 0.7 }}
              transition={reduced ? { duration: 0 } : { ...snappySpring, delay: 0.05 * i }}
              style={{
                position: 'absolute', left: tileX(i) - 40, top: 10, width: 80, height: 80, borderRadius: '12%',
                border: '4px solid #232327', background: '#0b0b0c', boxShadow: '0 10px 26px rgba(0,0,0,0.5)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5, boxSizing: 'border-box',
              }}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.92)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
                {s.icon}
              </svg>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', whiteSpace: 'nowrap', letterSpacing: '0.02em' }}>{s.label}</span>
            </motion.div>
          ))}

          <div
            style={{
              position: 'absolute', left: HUB_X - HUB_R - 4, top: HUB_Y - HUB_R - 4, width: (HUB_R + 4) * 2, height: (HUB_R + 4) * 2,
              pointerEvents: 'none',
              filter: active ? 'drop-shadow(0 0 16px rgba(46,235,133,0.4))' : 'drop-shadow(0 8px 20px rgba(0,0,0,0.6))',
              transition: 'filter 600ms',
            }}
          >
            <ChipMark size={88} active={active} />
          </div>

          <div
            style={{
              position: 'absolute', ...WIN, borderRadius: 12, border: `1px solid ${HAIRLINE}`, background: GRAPHITE, boxSizing: 'border-box',
              opacity: active ? 1 : 0.3, transition: 'opacity 500ms', display: 'flex', overflow: 'hidden',
            }}
          >
            <div style={{ width: 248, flex: 'none', borderRight: `1px solid ${HAIRLINE}`, display: 'flex', flexDirection: 'column' }}>
              {PERSONAS.map((x, i) => {
                const on = pi === i
                return (
                  <button
                    key={x.key}
                    type="button"
                    onClick={() => pickPersona(i)}
                    aria-label={`Show ${x.name} questions`}
                    style={{
                      flex: 1, textAlign: 'left', padding: '16px 18px 14px', background: on ? 'rgba(255,255,255,0.03)' : 'none', border: 'none',
                      borderBottom: i < PERSONAS.length - 1 ? `1px solid ${HAIRLINE}` : 'none', cursor: 'pointer', fontFamily: BODY, color: '#fff',
                      transition: 'background 350ms', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 7,
                    }}
                  >
                    <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: '0.16em', color: on ? 'rgba(255,255,255,0.6)' : DIM, transition: 'color 350ms' }}>{x.persona}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: x.accent, flex: 'none', opacity: on ? 1 : 0.45, transition: 'opacity 350ms' }} />
                      <span style={{ fontSize: 17, fontWeight: 500, color: on ? '#fff' : 'rgba(255,255,255,0.5)', transition: 'color 350ms' }}>{x.name}</span>
                    </span>
                    <span style={{ display: 'block', height: 2, borderRadius: 1, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                      {on && counting ? (
                        <span key={`${pi}-${bump}`} className="l9uc-count" style={{ display: 'block', height: '100%', width: '100%', background: x.line }} />
                      ) : (
                        <span style={{ display: 'block', height: '100%', width: on ? '100%' : '0%', background: x.accent, transition: 'width 300ms linear' }} />
                      )}
                    </span>
                  </button>
                )
              })}
            </div>

            <div style={{ flex: 1, minWidth: 0, display: 'flex', gap: 14, padding: 14 }}>
              <div style={{ flex: '0 0 322px', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                <div key={p.key} style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {p.prompts.map((q, i) => {
                    const on = qi === i
                    return (
                      <motion.button
                        key={q.q}
                        type="button"
                        onClick={() => pickPrompt(i)}
                        aria-label={`Ask: ${q.q}`}
                        className="l9uc-card"
                        initial={reduced ? false : { opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={reduced ? { duration: 0 } : { duration: 0.28, ease: EASE, delay: 0.06 * i }}
                        style={{
                          flex: 1, minHeight: 0, minWidth: 0, textAlign: 'left', cursor: 'pointer', display: 'flex', flexDirection: 'column',
                          justifyContent: 'center', gap: 8, padding: '12px 16px', borderRadius: 12,
                          border: `1px solid ${on ? `${p.accent}66` : HAIRLINE}`, background: on ? TILE : 'rgba(255,255,255,0.02)',
                          fontFamily: BODY, color: '#fff', transition: 'border-color 300ms ease, background 300ms ease',
                        }}
                      >
                        <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.14em', color: p.accent, opacity: on ? 1 : 0.6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', transition: 'opacity 300ms', flex: 'none' }}>
                          {q.tag}
                        </span>
                        <span style={{ fontFamily: HEAD, fontWeight: 350, fontSize: 20, lineHeight: 1.25, color: on ? '#fff' : 'rgba(255,255,255,0.8)', transition: 'color 300ms' }}>
                          “{q.q}”
                        </span>
                      </motion.button>
                    )
                  })}
                </div>
              </div>
              <div key={`${p.key}-a${qi}`} style={{ flex: '1 1 0', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                <AnswerDash dash={prompt.dash} accent={p.accent} action={prompt.action} reduced={reduced} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="l9uc-mobile">
        <div className="l9uc-m-rail">
          {PERSONAS.map((x, i) => {
            const on = pi === i
            return (
              <button
                key={x.key}
                type="button"
                onClick={() => pickPersona(i)}
                aria-label={`Show ${x.name} questions`}
                className="l9uc-m-pillar"
                style={{ fontFamily: BODY, borderColor: on ? `${x.accent}66` : undefined, background: on ? 'rgba(255,255,255,0.05)' : undefined }}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: x.accent, flex: 'none', opacity: on ? 1 : 0.45, transition: 'opacity 350ms' }} />
                <span style={{ fontSize: 14.5, fontWeight: 500, color: on ? '#fff' : 'rgba(255,255,255,0.55)', transition: 'color 350ms' }}>{x.name}</span>
              </button>
            )
          })}
        </div>
        <div className="l9uc-m-prompts">
          {p.prompts.map((q, i) => {
            const on = qi === i
            return (
              <button
                key={q.q}
                type="button"
                onClick={() => pickPrompt(i)}
                aria-label={`Ask: ${q.q}`}
                className="l9uc-m-prompt"
                style={{ fontFamily: BODY, border: `1px solid ${on ? `${p.accent}66` : HAIRLINE}`, background: on ? TILE : 'rgba(255,255,255,0.02)' }}
              >
                <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.14em', color: p.accent, opacity: on ? 1 : 0.6, transition: 'opacity 300ms' }}>{q.tag}</span>
                <span
                  style={{
                    fontFamily: HEAD, fontWeight: 350, fontSize: 15.5, lineHeight: 1.3, color: on ? '#fff' : 'rgba(255,255,255,0.7)', transition: 'color 300ms',
                    whiteSpace: on ? 'normal' : 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%',
                  }}
                >
                  “{q.q}”
                </span>
              </button>
            )
          })}
        </div>
        <div key={`m-${p.key}-a${qi}`} className="l9uc-m-dash">
          <AnswerDash dash={prompt.dash} accent={p.accent} action={prompt.action} reduced={reduced} />
        </div>
      </div>
    </section>
  )
}
