import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'
import useReducedMotion from '../lib/useReducedMotion.js'
import { H1, EYEBROW, MONO, BODY, DIM, HAIRLINE, EASE_CSS } from '../lib/tokens.js'
import Pill from './shared/Pill.jsx'
import { Wordmark } from './shared/Brand.jsx'
import {
  EYEBROW_TEXT, H1_TEXT, PLACEHOLDER, PROMPTS, PHASES, TYPE_INDEX, SHOWN_INDEX, NEXT, HOLD_MS, CHAR_MS, TYPE_HOLD_MS,
  AMBIENT, AMBIENT_PHONE, RISK_DOTS, RISK_DOTS_PHONE, CALLOUTS, SMALL_CALLOUTS, CALLOUTS_PHONE,
  SMALL_CALLOUTS_PHONE, PANEL_BORDER,
} from './hero/data.js'
import { MapLayer, AmbientDots, RiskDots } from './hero/scene.jsx'
import {
  DashPanel, DashBody, SheetPanel, EmailPanel, SchedulePanel, MAIL_BG, slideRight, sheet, BottomFade,
} from './hero/panels.jsx'
import { PlusIcon, SendArrow, SignalIcon, BatteryIcon } from './hero/icons.jsx'
import '../styles/hero.css'

const PROMPT_SHADOW =
  '0 0 0 1px rgba(255,255,255,0.05), 0 0 36px rgba(255,255,255,0.09), 0 0 90px rgba(255,255,255,0.04), 0 18px 50px rgba(0,0,0,0.55)'
const PROMPT_SHADOW_PHONE = '0 0 0 1px rgba(255,255,255,0.05), 0 0 36px rgba(255,255,255,0.09), 0 18px 50px rgba(0,0,0,0.55)'

// 1160x725 canvas scaled to the screen width.
function useCanvasScale() {
  const ref = useRef(null)
  const [scale, setScale] = useState(1)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / 1160))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, scale]
}

function usePhone() {
  const [phone, setPhone] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 720px)')
    const on = () => setPhone(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return phone
}

// Episode: type → reveal → type2 → dash → type3 → excel → type4 → email → type5 → sched → reset.
// Runs only while `running`; clearing the pending timeout pauses it in place.
function useEpisode(running, reduced) {
  const [phase, setPhase] = useState('type')
  const [typed, setTyped] = useState(0)
  const [episode, setEpisode] = useState(0)

  useEffect(() => {
    if (reduced || !running) return
    let t
    if (phase in TYPE_INDEX) {
      const len = PROMPTS[TYPE_INDEX[phase]].length
      t =
        typed < len
          ? setTimeout(() => setTyped((n) => n + 1), CHAR_MS)
          : setTimeout(() => {
              setTyped(0)
              setPhase(NEXT[phase])
            }, TYPE_HOLD_MS)
    } else if (phase === 'reset') {
      t = setTimeout(() => {
        setTyped(0)
        setEpisode((k) => k + 1)
        setPhase('type')
      }, HOLD_MS.reset)
    } else {
      t = setTimeout(() => setPhase(NEXT[phase]), HOLD_MS[phase])
    }
    return () => clearTimeout(t)
  }, [phase, typed, running, reduced])

  const at = (p) => PHASES.indexOf(phase) >= PHASES.indexOf(p)
  const typing = phase in TYPE_INDEX
  const text = reduced
    ? PROMPTS[4]
    : typing
      ? PROMPTS[TYPE_INDEX[phase]].slice(0, typed)
      : PROMPTS[SHOWN_INDEX[phase]]

  return {
    episode,
    text,
    caret: !reduced && typing && typed > 0,
    started: reduced || phase !== 'type', // send-button glow + risk dots on
    callouts: !reduced && at('reveal') && !at('excel'),
    phoneCallouts: !reduced && at('reveal') && !at('dash'),
    dash: reduced || at('dash'),
    shifted: reduced || at('excel'),
    exiting: !reduced && phase === 'reset',
    excel: reduced || (at('excel') && phase !== 'reset'),
    email: reduced || (at('email') && phase !== 'reset'),
    sched: reduced || phase === 'sched',
  }
}

function PromptText({ text, caret, phone }) {
  const empty = text.length === 0
  return (
    <span
      style={
        phone
          ? { flex: 1, fontSize: 13, lineHeight: 1.35, color: empty ? DIM : '#fff', overflow: 'hidden', maxHeight: '3.9em' }
          : { flex: 1, fontSize: 15, color: empty ? DIM : '#fff', whiteSpace: 'nowrap', overflow: 'hidden' }
      }
    >
      {empty ? PLACEHOLDER : text}
      <span
        className="l9h2-caret"
        style={{
          display: caret ? 'inline-block' : 'none',
          width: phone ? 5 : 6,
          height: phone ? 13 : 15,
          background: 'rgba(255,255,255,0.7)',
          marginLeft: 2,
          verticalAlign: '-2px',
        }}
      />
    </span>
  )
}

function SendButton({ size, glow }) {
  return (
    <span
      style={{
        width: size, height: size, borderRadius: '50%', background: '#fff', display: 'grid', placeItems: 'center', flex: 'none',
        boxShadow: glow ? '0 0 20px rgba(255,255,255,0.45)' : 'none', transition: 'box-shadow 400ms',
      }}
    >
      <SendArrow size={size === 30 ? 12 : 11} />
    </span>
  )
}

const bigCallout = {
  position: 'absolute', padding: '6px 10px', borderRadius: 8, background: 'rgba(12,12,14,0.92)', fontFamily: MONO, whiteSpace: 'nowrap',
}
const smallCallout = {
  position: 'absolute', padding: '3px 7px', borderRadius: 5, background: 'rgba(12,12,14,0.88)', border: `1px solid ${HAIRLINE}`,
  fontFamily: MONO, fontSize: 8.5, letterSpacing: '0.06em', color: 'rgba(255,255,255,0.75)', whiteSpace: 'nowrap',
}
const show = (on, ms, delay) => ({ opacity: on ? 1 : 0, transition: `opacity ${ms}ms`, transitionDelay: on ? `${delay}ms` : '0ms' })

function Laptop({ ep, blink }) {
  const [hostRef, scale] = useCanvasScale()
  return (
    <div aria-hidden="true" className="l9h2-laptop" style={{ width: 'min(1260px, 90vw)', position: 'relative', marginTop: 72, flex: 'none', zIndex: 1 }}>
      <div style={{ borderRadius: '16px 16px 0 0', background: '#1a1a1c', padding: '12px 12px 0', boxShadow: '0 40px 120px rgba(0,0,0,0.7)' }}>
        <div ref={hostRef} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', background: '#0d0d0f', aspectRatio: '1160 / 725' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: 1160, height: 725, transform: `scale(${scale})`, transformOrigin: 'top left', display: 'flex' }}>
            <div style={{ position: 'relative', flex: 1, overflow: 'hidden' }}>
              <MapLayer attribution={!ep.dash} />
              <AmbientDots dots={AMBIENT} viewBox="0 0 1160 725" />
              <RiskDots dots={RISK_DOTS} viewBox="0 0 1160 725" on={ep.started} blink={blink} />
              {CALLOUTS.map((c) => (
                <div key={c.text} style={{ ...bigCallout, left: c.left, top: c.top, border: `1px solid ${c.accent}`, fontSize: 10.5, color: c.color, ...show(ep.callouts, 500, c.delay) }}>
                  {c.text}
                </div>
              ))}
              {SMALL_CALLOUTS.map((c) => (
                <div key={c.text} style={{ ...smallCallout, left: c.x, top: c.y, ...show(ep.callouts, 400, c.delay) }}>
                  {c.text}
                </div>
              ))}

              <DashPanel key={ep.episode} on={ep.dash} shifted={ep.shifted} exiting={ep.exiting} />
              <div style={{ ...slideRight(ep.excel), position: 'absolute', top: 0, right: 0, bottom: 0, width: 584, borderLeft: `1px solid ${PANEL_BORDER}`, overflow: 'hidden' }}>
                <SheetPanel on={ep.excel} />
              </div>
              <div
                style={{
                  transform: ep.email ? 'translateX(0%)' : 'translateX(-100%)', transition: `transform 450ms ${EASE_CSS}`,
                  position: 'absolute', top: 0, left: 0, bottom: 0, width: 580, borderRight: `1px solid ${PANEL_BORDER}`, overflow: 'hidden',
                }}
              >
                <EmailPanel on={ep.email} />
              </div>
              <div style={{ ...slideRight(ep.sched), position: 'absolute', top: 0, right: 0, bottom: 0, width: 580, borderLeft: `1px solid ${PANEL_BORDER}`, overflow: 'hidden' }}>
                <SchedulePanel on={ep.sched} />
              </div>

              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                <div
                  style={{
                    transform: 'translate(0px, 224px) scale(0.92)', width: 660, display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px',
                    borderRadius: 14, background: 'rgba(16,16,18,0.96)', border: '1px solid rgba(255,255,255,0.16)', boxShadow: PROMPT_SHADOW,
                  }}
                >
                  <span style={{ display: 'inline-flex', opacity: 0.5, color: '#fff' }}><PlusIcon size={13} sw={1.8} /></span>
                  <PromptText text={ep.text} caret={ep.caret} />
                  <SendButton size={30} glow={ep.started} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div style={{ height: 16, borderRadius: '0 0 18px 18px', background: 'linear-gradient(180deg, #232326, #151517)', boxShadow: '0 24px 60px rgba(0,0,0,0.6)' }} />
      <div style={{ margin: '0 auto', width: '16%', height: 5, borderRadius: '0 0 8px 8px', background: '#0f0f11' }} />
    </div>
  )
}

function Phone({ ep, blink }) {
  const VB = '0 0 360 760'
  return (
    <div aria-hidden="true" className="l9h2-phone" style={{ width: '100%', position: 'relative', marginTop: 52, flex: 'none', zIndex: 1 }}>
      <div style={{ width: 'min(340px, calc(100vw - 40px))', borderRadius: 54, background: '#1a1a1c', padding: 10, boxShadow: '0 40px 120px rgba(0,0,0,0.7)' }}>
        <div style={{ position: 'relative', borderRadius: 44, overflow: 'hidden', background: '#0d0d0f', aspectRatio: '360 / 760' }}>
          <MapLayer cols={3} rows={4} attribution={!ep.dash} />
          <AmbientDots dots={AMBIENT_PHONE} viewBox={VB} slice />
          <RiskDots dots={RISK_DOTS_PHONE} viewBox={VB} slice on={ep.started} blink={blink} />
          {CALLOUTS_PHONE.map((c) => (
            <div key={c.text} style={{ ...bigCallout, left: c.left, top: c.top, border: `1px solid ${c.accent}`, fontSize: 10, color: c.color, zIndex: 2, ...show(ep.phoneCallouts, 500, c.delay) }}>
              {c.text}
            </div>
          ))}
          {SMALL_CALLOUTS_PHONE.map((c) => (
            <div key={c.text} style={{ ...smallCallout, left: c.left, top: c.top, zIndex: 2, ...show(ep.phoneCallouts, 400, c.delay) }}>
              {c.text}
            </div>
          ))}
          <div
            style={{
              position: 'absolute', inset: 0, background: '#0d0d0f', opacity: ep.dash && !ep.exiting ? 1 : 0,
              transition: `opacity 450ms ${EASE_CSS}`, zIndex: 2, pointerEvents: 'none',
            }}
          />
          <div key={`m-dash-${ep.episode}`} style={{ ...sheet(ep.dash && !ep.exiting, 3), background: '#141416' }}>
            <DashBody active={ep.dash} />
            <BottomFade bg="#141416" />
          </div>
          <div style={{ ...sheet(ep.excel, 4), background: '#1b1b1d' }}>
            <SheetPanel on={ep.excel} />
            <BottomFade bg="#1b1b1d" />
          </div>
          <div style={{ ...sheet(ep.email, 5), background: MAIL_BG }}>
            <EmailPanel on={ep.email} />
            <BottomFade bg={MAIL_BG} />
          </div>
          <div style={{ ...sheet(ep.sched, 6), background: '#141416' }}>
            <SchedulePanel on={ep.sched} compact />
            <BottomFade bg="#141416" />
          </div>

          <div
            style={{
              position: 'absolute', left: 18, right: 18, bottom: 20, zIndex: 8, display: 'flex', alignItems: 'center', gap: 10, padding: '10px 13px',
              borderRadius: 16, background: 'rgba(16,16,18,0.96)', border: '1px solid rgba(255,255,255,0.16)', boxShadow: PROMPT_SHADOW_PHONE,
            }}
          >
            <span style={{ display: 'inline-flex', opacity: 0.5, color: '#fff' }}><PlusIcon size={12} sw={1.8} /></span>
            <PromptText text={ep.text} caret={ep.caret} phone />
            <SendButton size={27} glow={ep.started} />
          </div>

          <div style={{ position: 'absolute', left: 24, top: 13, zIndex: 9, fontSize: 11.5, fontWeight: 600, color: 'rgba(255,255,255,0.92)', fontFamily: BODY }}>7:14</div>
          <div style={{ position: 'absolute', right: 22, top: 16, zIndex: 9, display: 'flex', alignItems: 'center', gap: 5 }}>
            <SignalIcon />
            <BatteryIcon />
          </div>
          <div style={{ position: 'absolute', left: '50%', top: 9, transform: 'translateX(-50%)', width: 88, height: 25, borderRadius: 14, background: '#000', zIndex: 9 }} />
        </div>
      </div>
    </div>
  )
}

export default function Hero() {
  const sectionRef = useRef(null)
  const inView = useInView(sectionRef, { amount: 0.3 })
  const reduced = useReducedMotion()
  const phone = usePhone()
  const ep = useEpisode(inView, reduced)
  const blink = inView && !reduced && ep.started

  return (
    <section
      ref={sectionRef}
      style={{
        position: 'relative', minHeight: '100svh', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '36px 24px 96px', overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', zIndex: 2 }}>
        <div className="l9h2-logo">
          <Wordmark />
        </div>
        <div style={{ ...EYEBROW, marginTop: 44 }}>{EYEBROW_TEXT}</div>
        <h1 style={{ ...H1, margin: '22px 0 0' }}>{H1_TEXT}</h1>
        <div data-cta-location="hero" style={{ marginTop: 38, display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Pill href="#demo" variant="solid" glim>Get a demo</Pill>
          <Pill href="#use-cases" variant="ghost">How it works</Pill>
        </div>
      </div>
      <Laptop ep={ep} blink={blink} />
      {phone ? <Phone ep={ep} blink={blink} /> : null}
    </section>
  )
}
