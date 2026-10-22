import { memo, Fragment } from 'react'
import { EASE_CSS as E, MONO, BODY, BLINK, NEON, BOOST, DIM, HAIRLINE } from '../../lib/tokens.js'
import {
  PANEL_BORDER, DASH_TITLE, KPIS, KPI_DELAYS, TOWNS, DRIVERS, BAR_MAX, TREND, TREND_END,
  SUBSCRIBERS, isSevere, RED_TEXT, SCHEDULES,
} from './data.js'
import {
  DownloadIcon, SheetIcon, CalendarIcon, CheckIcon, ArrowLeft, BoxIcon, BinIcon, MailIcon, DotsIcon,
  ChevronLeft, ChevronRight, PrintIcon, OpenIcon, ClipIcon, StarIcon, ReplyIcon, ForwardIcon, SmileIcon, DocIcon,
} from './icons.jsx'

// Panel content entrance: opacity + translateY(16px) scale(.965) → none, 450ms EASE, delay 120ms.
export function enter(on) {
  return {
    opacity: on ? 1 : 0,
    transform: on ? 'translateY(0px) scale(1)' : 'translateY(16px) scale(0.965)',
    transition: `opacity 450ms ${E}, transform 450ms ${E}`,
    transitionDelay: on ? '120ms' : '0ms',
  }
}
// Laptop right-side slide.
export function slideRight(on) {
  return { transform: on ? 'translateX(0%)' : 'translateX(100%)', transition: `transform 450ms ${E}` }
}
// Phone bottom sheet.
export function sheet(on, z) {
  return {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 46,
    bottom: 0,
    transform: on ? 'translateY(0)' : 'translateY(calc(100% + 24px))',
    transition: `transform 450ms ${E}`,
    borderRadius: '18px 18px 0 0',
    border: `1px solid ${PANEL_BORDER}`,
    borderBottom: 'none',
    overflow: 'hidden',
    zIndex: z,
  }
}
export function BottomFade({ bg }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, height: 108,
        background: `linear-gradient(to bottom, transparent, ${bg} 68%)`, pointerEvents: 'none',
      }}
    />
  )
}

const fade = (on, d, ms = 300) => ({ opacity: on ? 1 : 0, transition: `opacity ${ms}ms`, transitionDelay: on ? `${d}ms` : '0ms' })
const rise = (on, d, px, ms, ease = E) => ({
  opacity: on ? 1 : 0,
  transform: `translateY(${on ? 0 : px}px)`,
  transition: `opacity ${ms}ms ${ease}, transform ${ms}ms ${ease}`,
  transitionDelay: on ? `${d}ms` : '0ms',
})

// ---- Dashboard ------------------------------------------------------------
function BarList({ title, note, rows, active, titleDelay, rowDelays }) {
  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8, ...rise(active, titleDelay, 6, 320) }}>
        <span style={{ fontFamily: MONO, fontSize: 8.5, letterSpacing: '0.12em', color: DIM }}>{title}</span>
        <span style={{ fontFamily: MONO, fontSize: 8, letterSpacing: '0.08em', color: BLINK, whiteSpace: 'nowrap' }}>{note}</span>
      </div>
      <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 9 }}>
        {rows.map((r, i) => (
          <div
            key={r.label}
            style={{ display: 'grid', gridTemplateColumns: '104px 1fr 22px', gap: 10, alignItems: 'center', ...rise(active, rowDelays[i], 6, 320) }}
          >
            <span style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.8)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {r.label}
            </span>
            <span style={{ position: 'relative', height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
              <span
                style={{
                  position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 3, background: BLINK,
                  width: `${(r.count / BAR_MAX) * 100}%`,
                  transform: active ? 'scaleX(1)' : 'scaleX(0)',
                  transformOrigin: 'left',
                  transition: `transform 500ms ${E}`,
                  transitionDelay: active ? `${rowDelays[i] + 140}ms` : '0ms',
                }}
              />
            </span>
            <span style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(255,255,255,0.75)', textAlign: 'right', ...fade(active, rowDelays[i] + 380, 250) }}>
              {r.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

const badge = { position: 'absolute', right: 0, display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: MONO, fontSize: 8.5, letterSpacing: '0.12em' }
const dot5 = (bg) => ({ width: 5, height: 5, borderRadius: '50%', background: bg, display: 'inline-block' })

export const DashBody = memo(function DashBody({ active }) {
  const card = (d) => rise(active, d, 8, 380)
  return (
    <div style={{ padding: '12px 14px 0', display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box' }}>
      <div style={{ position: 'relative', height: 12, ...fade(active, 80) }}>
        <span style={{ position: 'absolute', left: 0, display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: MONO, fontSize: 8.5, letterSpacing: '0.14em', color: DIM }}>
          {DASH_TITLE}
        </span>
        <span style={{ ...badge, color: BLINK, opacity: active ? 0 : 1, transition: 'opacity 250ms', transitionDelay: active ? '1550ms' : '0ms' }}>
          <span className="l9h2-bad" style={dot5(BLINK)} />
          GENERATING…
        </span>
        <span style={{ ...badge, color: 'rgba(255,255,255,0.55)', ...fade(active, 1600) }}>
          <span style={dot5(NEON)} />
          LIVE · 7:14 AM
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 10 }}>
        {KPIS.map((k, i) => (
          <div key={k.label} style={{ padding: '10px 11px', borderRadius: 9, border: `1px solid ${HAIRLINE}`, background: 'rgba(255,255,255,0.03)', ...card(KPI_DELAYS[i]) }}>
            <div style={{ fontFamily: MONO, fontSize: 7.5, letterSpacing: '0.12em', color: DIM, whiteSpace: 'nowrap' }}>{k.label}</div>
            <div style={{ marginTop: 5, fontSize: 21, fontWeight: 500, letterSpacing: '-0.01em', color: k.valueColor, lineHeight: 1, ...fade(active, KPI_DELAYS[i] + 260) }}>
              {k.value}
            </div>
            <div style={{ marginTop: 5, fontFamily: MONO, fontSize: 7.5, color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap', ...fade(active, KPI_DELAYS[i] + 340) }}>
              {k.sub}
            </div>
          </div>
        ))}
      </div>

      <BarList title="RISK BY TOWN · TOP 3" note="39 ELEV · 3 CRITICAL" rows={TOWNS} active={active} titleDelay={360} rowDelays={[760, 300, 980]} />
      <BarList title="TOP 4 DRIVERS" note="PRICING LEADS" rows={DRIVERS} active={active} titleDelay={200} rowDelays={[260, 620, 1050, 440]} />

      <div style={{ marginTop: 16, ...card(380) }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
          <span style={{ fontFamily: MONO, fontSize: 8.5, letterSpacing: '0.12em', color: DIM }}>AT-RISK ACCOUNTS 30D</span>
          <span style={{ fontFamily: MONO, fontSize: 8, letterSpacing: '0.08em', color: BLINK, whiteSpace: 'nowrap', ...fade(active, 1500) }}>42 TODAY ↑</span>
        </div>
        <svg viewBox="0 0 552 64" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: 58, marginTop: 8 }}>
          <polygon
            points={`0,64 ${TREND} 552,64`}
            fill={BLINK}
            style={{ opacity: active ? 0.08 : 0, transition: 'opacity 500ms', transitionDelay: active ? '1200ms' : '0ms' }}
          />
          <polyline
            points={TREND}
            fill="none"
            stroke={BLINK}
            strokeWidth={1.6}
            strokeLinejoin="round"
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={1}
            style={{ strokeDashoffset: active ? 0 : 1, transition: `stroke-dashoffset 900ms ${E}`, transitionDelay: active ? '520ms' : '0ms' }}
          />
          <circle cx={TREND_END[0]} cy={TREND_END[1]} r={3.4} fill={BLINK} style={fade(active, 1420, 250)} />
        </svg>
      </div>

      <div style={{ marginTop: 10, paddingTop: 11, borderTop: `1px solid ${HAIRLINE}`, fontSize: 11, lineHeight: 1.55, color: 'rgba(255,255,255,0.7)', ...card(1250) }}>
        <span style={{ color: BLINK, fontFamily: MONO, fontSize: 9, letterSpacing: '0.1em' }}>{'› KEY INSIGHT  '}</span>
        most flagged accounts have promos ending soon.
      </div>

      <div
        style={{
          marginTop: 'auto', padding: '12px 0 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
          fontFamily: MONO, fontSize: 7.5, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.35)', ...fade(active, 1400),
        }}
      >
        <span>SOURCES · BILLING / TICKETS / TELEMETRY</span>
        <span>UPDATED · 7:14 AM</span>
      </div>
    </div>
  )
})

// Laptop dashboard: enters from translateX(100%), shifts to -100%, exits to -200%.
export const DashPanel = memo(function DashPanel({ on, shifted, exiting }) {
  const tx = exiting ? '-200%' : on ? (shifted ? '-100%' : '0%') : '100%'
  return (
    <div
      style={{
        transform: `translateX(${tx})`, transition: `transform 450ms ${E}`,
        position: 'absolute', top: 0, right: 0, bottom: 0, width: 580, display: 'flex', flexDirection: 'column',
        background: '#141416', borderLeft: `1px solid ${PANEL_BORDER}`, overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex', alignItems: 'center', height: 38, boxSizing: 'border-box', padding: '0 14px',
          background: 'rgba(255,255,255,0.03)', borderBottom: `1px solid ${HAIRLINE}`, flex: 'none',
          fontFamily: MONO, fontSize: 9.5, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.6)',
        }}
      >
        {DASH_TITLE}
        <span style={{ marginLeft: 'auto', color: DIM, display: 'inline-flex' }}>
          <DownloadIcon size={12} sw={1.8} />
        </span>
      </div>
      <div style={{ position: 'relative', flex: 1, minHeight: 0 }}>
        <DashBody active={on} />
      </div>
    </div>
  )
})

// ---- Spreadsheet ----------------------------------------------------------
const XL_GREEN = '#21A366'
const GRID = '1px solid rgba(255,255,255,0.08)'
const COLS = '34px 1.35fr 0.85fr 0.65fr 1.15fr'

export const SheetPanel = memo(function SheetPanel({ on }) {
  const f = (d) => fade(on, d, 320)
  const hd = {
    padding: '5px 8px', fontFamily: MONO, fontSize: 8.5, letterSpacing: '0.06em', color: '#9aa0a6',
    background: '#252526', borderRight: GRID, borderBottom: GRID, textAlign: 'center',
  }
  const cell = (extra) => ({
    padding: '7px 9px', fontSize: 11, color: 'rgba(255,255,255,0.88)', borderRight: GRID, borderBottom: GRID,
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', ...extra,
  })
  return (
    <div style={{ ...enter(on), width: '100%', height: '100%', boxSizing: 'border-box', background: '#1b1b1d', fontFamily: BODY, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, height: 38, boxSizing: 'border-box', padding: '0 14px', background: '#185C37', flex: 'none', ...f(40) }}>
        <span style={{ display: 'grid', placeItems: 'center', width: 16, height: 16, borderRadius: 3, background: 'rgba(255,255,255,0.16)', flex: 'none', color: '#fff' }}>
          <SheetIcon size={10} sw={1.8} />
        </span>
        <span style={{ fontSize: 11.5, fontWeight: 500, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>retention-watch-1.xlsx</span>
        <span style={{ marginLeft: 'auto', fontFamily: MONO, fontSize: 8.5, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.55)', whiteSpace: 'nowrap' }}>SAVED</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderBottom: GRID, background: '#202021', flex: 'none', ...f(110) }}>
        <span style={{ fontFamily: MONO, fontSize: 9.5, color: '#9aa0a6', fontStyle: 'italic', flex: 'none' }}>fx</span>
        <span style={{ fontFamily: MONO, fontSize: 9.5, color: 'rgba(255,255,255,0.6)', whiteSpace: 'nowrap', overflow: 'hidden' }}>=FILTER(subs, subs[Risk]&gt;70)</span>
      </div>
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', ...f(170) }}>
        <div style={{ display: 'grid', gridTemplateColumns: COLS }}>
          <div style={hd} />
          {['A', 'B', 'C', 'D'].map((c) => <div key={c} style={hd}>{c}</div>)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: COLS }}>
          <div style={hd}>1</div>
          {['NAME', 'TIER', 'SCORE', 'TOWN'].map((c) => (
            <div key={c} style={cell({ fontWeight: 600, fontSize: 10, fontFamily: MONO, letterSpacing: '0.06em', color: '#fff', background: 'rgba(255,255,255,0.03)' })}>{c}</div>
          ))}
        </div>
        {SUBSCRIBERS.map(([name, tier, score, town], i) => (
          <div key={name} style={{ display: 'grid', gridTemplateColumns: COLS, ...f(230 + 60 * i) }}>
            <div style={hd}>{i + 2}</div>
            <div style={cell(i === 0 ? { outline: `1.5px solid ${XL_GREEN}`, outlineOffset: -1.5 } : undefined)}>{name}</div>
            <div style={cell({ color: isSevere(tier) ? RED_TEXT : 'rgba(255,96,46,0.9)' })}>{tier}</div>
            <div style={cell({ fontFamily: MONO, fontSize: 10.5 })}>{score}</div>
            <div style={cell()}>{town}</div>
          </div>
        ))}
        <div style={{ padding: '8px 12px', fontFamily: MONO, fontSize: 8, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.35)', ...f(560) }}>
          +37 ROWS BELOW · HIGHEST FIRST
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 12px', borderTop: GRID, background: '#202021', flex: 'none', ...f(300) }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: 6, background: 'rgba(33,163,102,0.16)', fontSize: 10, fontWeight: 600, color: XL_GREEN }}>
          Watch
          <svg width="8" height="5" viewBox="0 0 8 5" aria-hidden="true"><path d="M1 0.5h6L4 4.5Z" fill={XL_GREEN} /></svg>
        </span>
        <span style={{ fontSize: 12, color: '#9aa0a6', lineHeight: 1 }}>+</span>
        <span style={{ marginLeft: 'auto', fontFamily: MONO, fontSize: 8, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.35)' }}>42 ROWS</span>
      </div>
    </div>
  )
})

// ---- Email client ---------------------------------------------------------
export const MAIL_BG = '#202124'
const M_TEXT = '#e8eaed'
const M_DIM = '#9aa0a6'
const M_BODY = '#bdc1c6'
const M_LINE = 'rgba(255,255,255,0.08)'

export const EmailPanel = memo(function EmailPanel({ on }) {
  const r = (d) => rise(on, d, 5, 380, '')
  const tools = [ArrowLeft, BoxIcon, BinIcon, MailIcon, DotsIcon]
  return (
    <div style={{ ...enter(on), width: '100%', height: '100%', boxSizing: 'border-box', background: MAIL_BG, color: M_TEXT, fontFamily: BODY, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, height: 38, boxSizing: 'border-box', padding: '0 18px', borderBottom: `1px solid ${M_LINE}`, color: M_DIM, ...r(60) }}>
        {tools.map((T, i) => (
          <Fragment key={i}>
            <T size={15} />
            {i === 0 && <span style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.12)', flex: 'none' }} />}
          </Fragment>
        ))}
        <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12, flex: 'none' }}>
          <span style={{ fontSize: 10.5 }}>3 of 864</span>
          <ChevronLeft size={13} />
          <ChevronRight size={13} />
        </span>
      </div>
      <div style={{ position: 'relative', flex: 1, minHeight: 0, padding: '13px 26px 14px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, ...r(120) }}>
          <span style={{ fontSize: 17, fontWeight: 500, letterSpacing: '-0.01em', color: M_TEXT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Retention watch — week 41
          </span>
          <span style={{ flex: 'none', display: 'inline-flex', alignItems: 'center', gap: 5, padding: '2px 7px', borderRadius: 4, background: 'rgba(255,255,255,0.08)', fontSize: 9.5, color: M_DIM }}>
            Inbox <span style={{ fontSize: 10, lineHeight: 1 }}>×</span>
          </span>
          <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 14, color: M_DIM, flex: 'none' }}>
            <PrintIcon size={13} />
            <OpenIcon size={13} />
          </span>
        </div>
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10, ...r(180) }}>
          <span style={{ display: 'grid', placeItems: 'center', width: 30, height: 30, borderRadius: '50%', background: BOOST, color: '#fff', fontSize: 13, fontWeight: 500, flex: 'none' }}>A</span>
          <span style={{ minWidth: 0 }}>
            <span style={{ display: 'block', fontSize: 12.5, lineHeight: 1.25, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <span style={{ fontWeight: 600, color: M_TEXT }}>Acme</span>
              <span style={{ color: M_DIM }}>{' <reports@acme.example>'}</span>
            </span>
            <span style={{ display: 'block', fontSize: 10.5, lineHeight: 1.3, color: M_DIM }}>to support-leads ▾</span>
          </span>
          <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, color: M_DIM, flex: 'none' }}>
            <ClipIcon size={13} />
            <span style={{ fontSize: 10.5 }}>7:14 AM (3 minutes ago)</span>
            <StarIcon size={13} />
            <ReplyIcon size={14} />
          </span>
        </div>
        <div style={{ marginTop: 12, borderTop: `1px solid ${M_LINE}`, paddingTop: 12 }}>
          <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.25, color: M_TEXT, ...r(280) }}>42 subscribers flagged this week</div>
          <div style={{ marginTop: 7, fontSize: 11.5, fontWeight: 700, color: M_TEXT, ...r(360) }}>Escalated 3 · Elevated 39 · Promo ending 11</div>
          <div style={{ marginTop: 7, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {SUBSCRIBERS.slice(0, 3).map(([name, tier, score], i) => (
              <div key={name} style={{ fontSize: 11.5, lineHeight: 1.6, color: M_BODY, ...r(420 + 50 * i) }}>
                {`•  ${name} — ${tier} · score ${score}`}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 8, fontSize: 11.5, lineHeight: 1.55, color: M_BODY, ...r(580) }}>
            <span style={{ fontWeight: 700, color: M_TEXT }}>Insight:</span> most flagged accounts have a promotional rate ending within 30 days; an offer is the fix.
          </div>
          <div style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 10, padding: '7px 14px 7px 8px', borderRadius: 9, border: '1px solid rgba(255,255,255,0.14)', ...r(650) }}>
            <span style={{ display: 'grid', placeItems: 'center', width: 28, height: 28, borderRadius: 6, background: '#1e8e3e', flex: 'none', color: '#fff' }}>
              <DocIcon size={14} />
            </span>
            <span>
              <span style={{ display: 'block', fontSize: 11.5, fontWeight: 500, color: M_TEXT, lineHeight: 1.3 }}>retention-watch.csv</span>
              <span style={{ display: 'block', fontSize: 9.5, color: M_DIM, lineHeight: 1.3 }}>6 KB · 42 rows</span>
            </span>
          </div>
        </div>
        <div style={{ marginTop: 13, display: 'flex', alignItems: 'center', gap: 8, ...r(720) }}>
          {[['Reply', ReplyIcon], ['Forward', ForwardIcon]].map(([label, I]) => (
            <span key={label} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '6px 16px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.2)', fontSize: 11.5, fontWeight: 500, color: M_DIM, whiteSpace: 'nowrap' }}>
              <I size={12} sw={1.7} />
              {label}
            </span>
          ))}
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', color: M_DIM, flex: 'none' }}>
            <SmileIcon size={13} />
          </span>
        </div>
      </div>
    </div>
  )
})

// ---- Scheduled reports ----------------------------------------------------
export const SchedulePanel = memo(function SchedulePanel({ on, compact = false }) {
  const list = compact ? SCHEDULES.slice(0, 4) : SCHEDULES
  const r = (d) => rise(on, d, 6, 350, '')
  return (
    <div style={{ ...enter(on), width: '100%', height: '100%', boxSizing: 'border-box', background: '#141416', display: 'flex', flexDirection: 'column', overflow: 'hidden', paddingBottom: compact ? 96 : undefined }}>
      <div style={{ display: 'flex', alignItems: 'center', height: 38, boxSizing: 'border-box', padding: '0 16px', borderBottom: `1px solid ${HAIRLINE}`, flex: 'none', ...r(40) }}>
        <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.7)' }}>AUTOMATED REPORTS</span>
        <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: MONO, fontSize: 8.5, letterSpacing: '0.1em', color: NEON }}>
          <CheckIcon size={11} sw={2.2} />
          AUTOMATION ON
        </span>
      </div>
      <div style={{ flex: 1, minHeight: 0, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {list.map((s, i) => (
          <div
            key={s.name}
            style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '13px 15px', borderRadius: 11,
              border: `1px solid ${s.isNew ? `${NEON}55` : HAIRLINE}`,
              background: s.isNew ? `${NEON}0d` : 'rgba(255,255,255,0.025)',
              ...r(120 + 110 * i),
            }}
          >
            <span style={{ display: 'grid', placeItems: 'center', width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: `1px solid ${HAIRLINE}`, flex: 'none', color: s.isNew ? NEON : DIM }}>
              <CalendarIcon size={13} sw={1.5} />
            </span>
            <span style={{ minWidth: 0, flex: 1 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</span>
                {s.isNew && (
                  <span style={{ fontFamily: MONO, fontSize: 7.5, letterSpacing: '0.12em', color: NEON, border: `1px solid ${NEON}55`, borderRadius: 4, padding: '1px 5px', flex: 'none' }}>NEW</span>
                )}
              </span>
              <span style={{ display: 'block', marginTop: 3, fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>
                {`→ ${s.to} · pdf + csv`}
                {compact && (
                  <span style={{ fontFamily: MONO, fontSize: 8.5, letterSpacing: '0.06em', color: s.isNew ? 'rgba(255,255,255,0.8)' : DIM }}>{` · ${s.cadence}`}</span>
                )}
              </span>
            </span>
            {!compact && (
              <span style={{ fontFamily: MONO, fontSize: 8.5, letterSpacing: '0.08em', color: s.isNew ? 'rgba(255,255,255,0.8)' : DIM, whiteSpace: 'nowrap', flex: 'none' }}>{s.cadence}</span>
            )}
          </div>
        ))}
      </div>
      <div style={{ padding: '11px 16px', borderTop: `1px solid ${HAIRLINE}`, display: 'flex', justifyContent: 'space-between', fontFamily: MONO, fontSize: 8, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.35)', flex: 'none', ...r(700) }}>
        <span>{compact ? '5 ACTIVE' : '5 ACTIVE · RUN BY ACME AGENTS'}</span>
        <span>NEXT · MON 7:00 AM</span>
      </div>
    </div>
  )
})
