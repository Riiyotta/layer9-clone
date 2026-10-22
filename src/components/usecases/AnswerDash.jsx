import { memo } from 'react'
import { motion } from 'framer-motion'
import { EASE, heavySpring, MONO, HEAD, DIM, HAIRLINE } from '../../lib/tokens'

const CAPTION = { fontFamily: MONO, fontSize: 10, letterSpacing: '0.12em', color: DIM, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }
const FOOT = { fontFamily: MONO, fontSize: 10.5, letterSpacing: '0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }
const ELL = { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }
const HALO = { stroke: '#09090b', strokeWidth: 3, paintOrder: 'stroke', fontFamily: MONO }

// 3x3 CARTO dark tiles (zoom 12), local copies at public/assets/map/{y}_{i}.png.
// Local rows y=1687..1691, columns i=0..6 map to tile x=1000..1006.
const ZOOM = 12
const N = 2 ** ZOOM
const TX = 0.24494805555555554 * N
const LAT = (30.0035 * Math.PI) / 180
const TY = ((1 - Math.log(Math.tan(LAT) + 1 / Math.cos(LAT)) / Math.PI) / 2) * N
const X0 = Math.floor(TX) - 1
const Y0 = Math.floor(TY) - 1
const LOCAL_X0 = 1000
const CELLS = []
for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) CELLS.push([c, r])

const MapTiles = memo(function MapTiles() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#09090b' }}>
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: 768,
          height: 768,
          transform: `translate(${-(256 * (TX - X0))}px, ${-(256 * (TY - Y0))}px)`,
        }}
      >
        {CELLS.map(([c, r]) => (
          <img
            key={`${c}-${r}`}
            src={`/assets/map/${Y0 + r}_${X0 + c - LOCAL_X0}.png`}
            alt=""
            style={{ position: 'absolute', left: 256 * c, top: 256 * r, width: 256, height: 256 }}
          />
        ))}
      </div>
      <div style={{ position: 'absolute', left: 6, bottom: 4, zIndex: 2, fontSize: 6.5, color: 'rgba(255,255,255,0.3)' }}>
        © CARTO © OpenStreetMap
      </div>
    </div>
  )
})

const sparkPoints = (d) => {
  const lo = Math.min(...d)
  const span = Math.max(Math.max(...d) - lo, 1)
  return d.map((v, i) => `${(i / Math.max(d.length - 1, 1)) * 80},${20 - ((v - lo) / span) * 16}`).join(' ')
}

export default function AnswerDash({ dash, accent, action, reduced }) {
  const o = accent
  const item = (n) => ({
    initial: reduced ? false : { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: reduced ? { duration: 0 } : { ...heavySpring, delay: 0.08 + 0.1 * n },
  })
  const tw = (t) => (reduced ? { duration: 0 } : t)
  const from = (v) => (reduced ? false : v)

  let body = null
  if (dash.kind === 'tiles') {
    const many = dash.tiles.length > 3
    body = (
      <div style={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'stretch', gap: 8, padding: '8px 0' }}>
        {dash.tiles.map((t, i) => (
          <motion.div
            key={t.l}
            {...item(1 + i)}
            style={{
              flex: 1, minWidth: 0, borderRadius: 8, padding: '11px 10px 9px',
              border: `1px solid ${t.hot ? `${o}55` : HAIRLINE}`,
              background: t.hot ? `${o}0d` : 'rgba(255,255,255,0.02)',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            }}
          >
            <div style={{ fontFamily: MONO, fontSize: 8.5, letterSpacing: '0.1em', color: DIM, ...ELL }}>{t.l}</div>
            <div style={{ display: 'flex', flexDirection: many ? 'column' : 'row', alignItems: many ? 'flex-start' : 'baseline', gap: many ? 3 : 6, marginTop: 8 }}>
              <span style={{ fontFamily: HEAD, fontWeight: 350, fontSize: many ? 23 : 28, lineHeight: 1, color: t.hot ? o : '#fff', whiteSpace: 'nowrap' }}>{t.v}</span>
              {t.delta ? <span style={{ fontFamily: MONO, fontSize: 8.5, color: t.hot ? o : 'rgba(255,255,255,0.56)', whiteSpace: 'nowrap' }}>{t.delta}</span> : null}
            </div>
            {t.spark ? (
              <svg viewBox="0 0 80 22" preserveAspectRatio="none" style={{ width: '100%', height: 24, marginTop: 9, overflow: 'visible' }}>
                <line x1={0} y1={20} x2={80} y2={20} stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
                <motion.polyline
                  points={sparkPoints(t.spark)}
                  fill="none"
                  stroke={t.hot ? o : 'rgba(255,255,255,0.52)'}
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={from({ pathLength: 0, opacity: 0 })}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={tw({ duration: 0.55, delay: 0.2 + 0.08 * i, ease: EASE })}
                />
              </svg>
            ) : null}
            {t.detail ? <div style={{ marginTop: 7, fontFamily: MONO, fontSize: 8, lineHeight: 1.25, color: 'rgba(255,255,255,0.42)', ...ELL }}>{t.detail}</div> : null}
          </motion.div>
        ))}
      </div>
    )
  } else if (dash.kind === 'bars') {
    body = (
      <div style={{ flex: 1, minHeight: 0, position: 'relative', width: '100%', maxWidth: 350, margin: '4px auto 0', padding: '4px 4px 0' }}>
        {[25, 50, 75].map((g) => (
          <span key={g} style={{ position: 'absolute', zIndex: 0, left: 4, right: 4, bottom: 28 + 1.22 * g, borderTop: '1px solid rgba(255,255,255,0.06)' }} />
        ))}
        {dash.marker ? (
          <span style={{ position: 'absolute', zIndex: 2, left: 4, right: 4, bottom: 28 + 1.22 * dash.marker.at, borderTop: `1px dashed ${o}77` }}>
            <span style={{ position: 'absolute', right: 0, top: -12, fontFamily: MONO, fontSize: 8, letterSpacing: '0.07em', color: o }}>{dash.marker.label}</span>
          </span>
        ) : null}
        <div style={{ position: 'absolute', inset: '0 4px 0', display: 'flex', alignItems: 'flex-end', gap: 14 }}>
          {dash.bars.map((b, n) => (
            <motion.div key={b.label} {...item(1 + n)} style={{ position: 'relative', zIndex: 1, flex: 1, minWidth: 0, textAlign: 'center' }}>
              <div style={{ position: 'relative', height: 150, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                <span style={{ position: 'absolute', bottom: `calc(${b.h}% + 5px)`, left: 0, right: 0, fontFamily: MONO, fontSize: 10, color: b.hot ? o : 'rgba(255,255,255,0.7)', whiteSpace: 'nowrap' }}>{b.value}</span>
                <motion.div
                  initial={from({ height: 0 })}
                  animate={{ height: `${b.h}%` }}
                  transition={tw({ ...heavySpring, delay: 0.16 + 0.08 * n })}
                  style={{
                    width: '56%', minWidth: 18, maxWidth: 34, borderRadius: '4px 4px 1px 1px',
                    background: b.hot ? `linear-gradient(180deg, ${o}, ${o}66)` : 'linear-gradient(180deg, rgba(255,255,255,0.24), rgba(255,255,255,0.08))',
                    boxShadow: b.hot ? `0 0 16px ${o}28` : 'none',
                  }}
                />
              </div>
              <div style={{ marginTop: 7, fontFamily: MONO, fontSize: 9, letterSpacing: '0.05em', color: b.hot ? '#fff' : DIM, whiteSpace: 'nowrap' }}>{b.label}</div>
              {b.detail ? <div style={{ marginTop: 3, fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.36)', ...ELL }}>{b.detail}</div> : null}
            </motion.div>
          ))}
        </div>
      </div>
    )
  } else if (dash.kind === 'rows') {
    body = (
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', gap: 7, padding: '6px 0' }}>
        {dash.rows.map((r, n) => (
          <motion.div
            key={r.left}
            {...item(1 + n)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '9px 11px', borderRadius: 6,
              border: `1px solid ${r.hot ? `${o}3d` : 'transparent'}`,
              background: r.hot ? `${o}12` : 'rgba(255,255,255,0.02)',
            }}
          >
            <span style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontFamily: MONO, fontSize: 10.5, color: r.hot ? 'rgba(255,255,255,0.94)' : 'rgba(255,255,255,0.68)', ...ELL }}>{r.left}</span>
              {r.sub ? <span style={{ fontFamily: MONO, fontSize: 8.5, color: 'rgba(255,255,255,0.38)', ...ELL }}>{r.sub}</span> : null}
            </span>
            <span style={{ flex: 'none', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: MONO, fontSize: 9, letterSpacing: '0.05em', color: r.hot ? o : 'rgba(255,255,255,0.58)', whiteSpace: 'nowrap' }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', flex: 'none', background: r.hot ? o : 'rgba(255,255,255,0.2)', boxShadow: r.hot ? `0 0 7px ${o}66` : 'none' }} />
                {r.right}
              </span>
              {r.meta ? <span style={{ fontFamily: MONO, fontSize: 8, color: DIM, whiteSpace: 'nowrap' }}>{r.meta}</span> : null}
            </span>
          </motion.div>
        ))}
      </div>
    )
  } else if (dash.kind === 'report') {
    body = (
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', padding: '4px 2px' }}>
        {dash.lines.map((l, n) => (
          <motion.div
            key={l.text}
            {...item(1 + n)}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 2px', borderBottom: n < dash.lines.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}
          >
            <span style={{ width: 5, height: 5, borderRadius: '50%', flex: 'none', background: l.hot ? o : 'rgba(255,255,255,0.25)', boxShadow: l.hot ? `0 0 7px ${o}66` : 'none' }} />
            <span style={{ flex: 1, minWidth: 0, fontSize: 12.5, lineHeight: 1.35, color: l.hot ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.76)', ...ELL }}>{l.text}</span>
            {l.stat ? <span style={{ flex: 'none', fontFamily: MONO, fontSize: 9, letterSpacing: '0.06em', color: l.hot ? o : DIM, whiteSpace: 'nowrap' }}>{l.stat}</span> : null}
          </motion.div>
        ))}
      </div>
    )
  } else if (dash.kind === 'kpi') {
    body = (
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', gap: 10, padding: '8px 0 4px' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {dash.stats.map((s, n) => (
            <motion.div
              key={s.l}
              {...item(1 + n)}
              style={{ flex: 1, minWidth: 0, borderRadius: 8, padding: '9px 10px', border: `1px solid ${s.hot ? `${o}55` : HAIRLINE}`, background: s.hot ? `${o}0d` : 'rgba(255,255,255,0.02)' }}
            >
              <div style={{ fontFamily: MONO, fontSize: 8, letterSpacing: '0.1em', color: DIM, ...ELL }}>{s.l}</div>
              <div style={{ marginTop: 6, fontFamily: HEAD, fontWeight: 350, fontSize: 21, lineHeight: 1, color: s.hot ? o : '#fff', whiteSpace: 'nowrap' }}>{s.v}</div>
              {s.delta ? <div style={{ marginTop: 5, fontFamily: MONO, fontSize: 8, color: s.hot ? o : 'rgba(255,255,255,0.5)', ...ELL }}>{s.delta}</div> : null}
            </motion.div>
          ))}
        </div>
        <motion.div {...item(2.5)} style={{ border: `1px solid ${HAIRLINE}`, borderRadius: 8, padding: '10px 12px', background: 'rgba(255,255,255,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 9 }}>
            <span style={{ fontFamily: MONO, fontSize: 8, letterSpacing: '0.12em', color: DIM }}>{dash.split.title}</span>
            <span style={{ fontFamily: MONO, fontSize: 8, letterSpacing: '0.06em', color: o, whiteSpace: 'nowrap' }}>{dash.split.note}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {dash.split.rows.map((r, n) => (
              <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 64, flex: 'none', fontFamily: MONO, fontSize: 8.5, letterSpacing: '0.06em', color: r.hot ? 'rgba(255,255,255,0.85)' : DIM, ...ELL }}>{r.label}</span>
                <span style={{ flex: 1, height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                  <motion.span
                    initial={from({ width: 0 })}
                    animate={{ width: `${r.pct}%` }}
                    transition={tw({ duration: 0.6, delay: 0.35 + 0.12 * n, ease: EASE })}
                    style={{ display: 'block', height: '100%', borderRadius: 3, background: r.hot ? `linear-gradient(90deg, ${o}88, ${o})` : 'rgba(255,255,255,0.3)' }}
                  />
                </span>
                <span style={{ flex: 'none', fontFamily: MONO, fontSize: 9.5, color: r.hot ? o : 'rgba(255,255,255,0.7)', whiteSpace: 'nowrap' }}>{r.v}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    )
  } else if (dash.kind === 'steps') {
    body = (
      <div style={{ flex: 1, minHeight: 0, position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', padding: '6px 0 6px 2px' }}>
        <span aria-hidden="true" style={{ position: 'absolute', left: 6, top: 18, bottom: 18, width: 1, background: 'rgba(255,255,255,0.14)' }} />
        {dash.steps.map((s, n) => (
          <motion.div key={s.text} {...item(1 + n)} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 11, padding: '6px 0' }}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', flex: 'none', boxSizing: 'border-box', background: s.hot ? o : '#17171a', border: `1px solid ${s.hot ? o : 'rgba(255,255,255,0.3)'}`, boxShadow: s.hot ? `0 0 8px ${o}77` : 'none' }} />
            <span style={{ flex: 1, minWidth: 0, fontSize: 12.5, lineHeight: 1.35, color: s.hot ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.76)', ...ELL }}>{s.text}</span>
            {s.stat ? <span style={{ flex: 'none', fontFamily: MONO, fontSize: 9, letterSpacing: '0.06em', color: s.hot ? o : DIM, whiteSpace: 'nowrap' }}>{s.stat}</span> : null}
          </motion.div>
        ))}
      </div>
    )
  } else if (dash.kind === 'map') {
    body = <MapBody dash={dash} accent={o} item={item} tw={tw} from={from} reduced={reduced} />
  }

  return (
    <div
      style={{
        flex: 1, minHeight: 0, width: '100%', borderRadius: 12, border: `1px solid ${HAIRLINE}`, background: 'rgba(0,0,0,0.32)',
        padding: '14px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflow: 'hidden', boxSizing: 'border-box',
      }}
    >
      <div style={{ flex: 'none', paddingBottom: 10, borderBottom: `1px solid ${HAIRLINE}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <motion.div {...item(0)} style={{ ...CAPTION, minWidth: 0 }}>{dash.caption}</motion.div>
          <span style={{ position: 'relative', height: 20, fontFamily: MONO, fontSize: 8, letterSpacing: '0.08em', flex: 'none', minWidth: 108, textAlign: 'right' }}>
            {!reduced && (
              <motion.span initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ duration: 0.25, delay: 0.85 }} style={{ position: 'absolute', right: 0, top: 3, color: DIM }}>
                FETCHING…
              </motion.span>
            )}
            <motion.span
              initial={from({ opacity: 0 })}
              animate={{ opacity: 1 }}
              transition={tw({ duration: 0.3, delay: 0.9 })}
              style={{ position: 'absolute', right: 0, top: 0, whiteSpace: 'nowrap', color: o, border: `1px solid ${o}44`, background: `${o}0d`, borderRadius: 999, padding: '3px 7px' }}
            >
              ● LIVE · {dash.updated}
            </motion.span>
          </span>
        </div>
        <motion.div {...item(0.5)} style={{ marginTop: 6, fontFamily: MONO, fontSize: 8, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.34)', ...ELL }}>
          SOURCES · {dash.sources}
        </motion.div>
      </div>
      {body}
      <motion.div {...item(4)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 6, border: `1px solid ${o}2e`, background: `${o}0b`, minWidth: 0 }}>
        <span style={{ fontFamily: MONO, fontSize: 8, letterSpacing: '0.1em', color: o, flex: 'none' }}>INSIGHT</span>
        <span style={{ ...FOOT, color: 'rgba(255,255,255,0.72)', minWidth: 0 }}>{dash.foot}</span>
      </motion.div>
      <div style={{ flex: 'none', marginTop: 8, paddingTop: 10, borderTop: `1px solid ${HAIRLINE}`, display: 'flex', justifyContent: 'flex-end' }}>
        <motion.div {...item(5)} style={{ borderRadius: 999, border: `1px solid ${o}88`, background: `${o}14`, padding: '8px 15px', fontSize: 12.5, color: '#fff' }}>
          {action}
        </motion.div>
      </div>
    </div>
  )
}

function MapBody({ dash: e, accent: o, item, tw, from, reduced }) {
  const n = e.hotColor ?? o
  const hotDelay = e.fiber ? 1.6 : 0.3
  const ringDelay = e.fiber ? 1.95 : 0.55
  const f = e.fiber
  return (
    <motion.div {...item(1)} style={{ flex: 1, minHeight: 0, position: 'relative', margin: '8px 0 4px', borderRadius: 8, overflow: 'hidden', border: `1px solid ${HAIRLINE}` }}>
      <MapTiles />
      <svg viewBox="0 0 340 230" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        {f ? (
          <g>
            <motion.path d={f.d} fill="none" stroke={o} strokeWidth={5} strokeOpacity={0.18} strokeLinecap="round" initial={from({ pathLength: 0 })} animate={{ pathLength: 1 }} transition={tw({ duration: 0.7, delay: 0.25, ease: EASE })} />
            <motion.path d={f.d} fill="none" stroke={o} strokeWidth={1.7} strokeOpacity={0.95} strokeLinecap="round" initial={from({ pathLength: 0 })} animate={{ pathLength: 1 }} transition={tw({ duration: 0.7, delay: 0.25, ease: EASE })} />
            {f.dead ? (
              <g>
                <motion.path d={f.dead.d} fill="none" stroke={n} strokeWidth={1.4} strokeOpacity={0.6} strokeDasharray="4 4" strokeLinecap="round" initial={from({ pathLength: 0 })} animate={{ pathLength: 1 }} transition={tw({ duration: 0.45, delay: 1, ease: EASE })} />
                <motion.g initial={from({ opacity: 0 })} animate={{ opacity: 1 }} transition={tw({ duration: 0.4, delay: 1.5 })}>
                  {e.dots.hot.map(([x, y]) => (
                    <line key={`r${x}-${y}`} x1={f.dead.hub.x} y1={f.dead.hub.y} x2={x} y2={y} stroke={n} strokeWidth={0.7} strokeOpacity={0.32} />
                  ))}
                </motion.g>
                <motion.g initial={from({ opacity: 0 })} animate={{ opacity: 1 }} transition={tw({ duration: 0.3, delay: 1.4 })}>
                  <rect x={f.dead.hub.x - 4} y={f.dead.hub.y - 4} width={8} height={8} rx={1.5} fill="#09090b" stroke={n} strokeWidth={1.2} transform={`rotate(45 ${f.dead.hub.x} ${f.dead.hub.y})`} />
                  <text x={f.dead.hub.x - 9} y={f.dead.hub.y + 3} textAnchor="end" fill="rgba(255,255,255,0.8)" {...HALO} fontSize={7.5} letterSpacing="0.08em">{f.dead.hub.label}</text>
                </motion.g>
              </g>
            ) : null}
            <rect x={f.site.x - 5} y={f.site.y - 5} width={10} height={10} rx={2} fill="#09090b" stroke={o} strokeWidth={1.3} />
            <circle cx={f.site.x} cy={f.site.y} r={1.6} fill={o} />
            <text x={f.site.x} y={f.site.y - 10} textAnchor="middle" fill="rgba(255,255,255,0.85)" {...HALO} fontSize={7.5} letterSpacing="0.08em">{f.site.label}</text>
            {!reduced && (
              <motion.circle cx={f.cut[0]} cy={f.cut[1]} fill="none" stroke={n} strokeWidth={1} initial={{ r: 5, opacity: 0 }} animate={{ r: [5, 13], opacity: [0.55, 0] }} transition={{ duration: 1.5, delay: 1.1, repeat: Infinity, ease: 'easeOut' }} />
            )}
            <motion.g initial={from({ opacity: 0 })} animate={{ opacity: 1 }} transition={tw({ duration: 0.3, delay: 0.9 })}>
              <circle cx={f.cut[0]} cy={f.cut[1]} r={7} fill="#09090b" fillOpacity={0.85} />
              <line x1={f.cut[0] - 4} y1={f.cut[1] - 4} x2={f.cut[0] + 4} y2={f.cut[1] + 4} stroke={n} strokeWidth={2.2} strokeLinecap="round" />
              <line x1={f.cut[0] - 4} y1={f.cut[1] + 4} x2={f.cut[0] + 4} y2={f.cut[1] - 4} stroke={n} strokeWidth={2.2} strokeLinecap="round" />
              <text x={f.cut[0]} y={f.cut[1] - 13} textAnchor="middle" fill={n} {...HALO} fontSize={8} fontWeight={600} letterSpacing="0.1em">{f.cutLabel}</text>
            </motion.g>
          </g>
        ) : null}
        {(e.dots.open ?? []).map(([x, y]) => (
          <circle key={`o${x}-${y}`} cx={x} cy={y} r={3.4} fill="rgba(9,9,11,0.8)" stroke="rgba(255,255,255,0.72)" strokeWidth={1.2} />
        ))}
        {e.dots.dim.map(([x, y]) => (
          <circle key={`d${x}-${y}`} cx={x} cy={y} r={3} fill="rgba(255,255,255,0.38)" stroke="#09090b" strokeWidth={1} />
        ))}
        {(e.heat ?? []).map((h, i) => (
          <motion.g key={`b${h.x}-${h.y}`} initial={from({ opacity: 0 })} animate={{ opacity: 1 }} transition={tw({ duration: 0.3, delay: 0.35 + 0.09 * i })}>
            <circle cx={h.x} cy={h.y} r={3.5 + 2 * h.n} fill={n} fillOpacity={0.16} stroke={n} strokeWidth={1.2} />
            <circle cx={h.x} cy={h.y} r={1.8} fill={n} />
            {h.n >= 3 ? (
              <text x={h.x + 3.5 + 2 * h.n + 4} y={h.y + 3} fill={n} {...HALO} fontSize={8} fontWeight={600}>×{h.n}</text>
            ) : null}
          </motion.g>
        ))}
        {e.dots.hot.map(([x, y], i) => (
          <g key={`h${x}-${y}`}>
            {f ? <circle cx={x} cy={y} r={3} fill="rgba(255,255,255,0.38)" stroke="#09090b" strokeWidth={1} /> : null}
            <motion.g initial={from({ opacity: 0 })} animate={{ opacity: 1 }} transition={tw({ duration: 0.3, delay: hotDelay + 0.04 * i })}>
              <circle cx={x} cy={y} r={7} fill={n} fillOpacity={0.16} />
              <circle cx={x} cy={y} r={3.6} fill={n} stroke="#09090b" strokeWidth={1.1} />
            </motion.g>
          </g>
        ))}
        <motion.circle
          cx={e.ring.x} cy={e.ring.y} r={e.ring.r} fill={`${n}1a`} stroke={n} strokeWidth={1.2} strokeDasharray="5 4"
          style={{ transformOrigin: `${e.ring.x}px ${e.ring.y}px` }}
          initial={from({ opacity: 0, scale: 0.6 })}
          animate={{ opacity: 1, scale: 1 }}
          transition={tw({ ...heavySpring, delay: ringDelay })}
        />
        <motion.text
          x={e.ring.x} y={e.ring.y - e.ring.r - 7} textAnchor="middle" fill={n} {...HALO} fontSize={8.5} fontWeight={600} letterSpacing="0.1em"
          initial={from({ opacity: 0 })}
          animate={{ opacity: 1 }}
          transition={tw({ duration: 0.3, delay: ringDelay + 0.15 })}
        >
          {e.ring.label}
        </motion.text>
      </svg>
      <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', flexDirection: 'column', gap: 5, padding: '7px 9px', borderRadius: 6, background: 'rgba(9,9,9,0.84)', border: `1px solid ${HAIRLINE}` }}>
        {e.legend.map((l) => (
          <span key={l.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: MONO, fontSize: 7.5, letterSpacing: '0.08em', color: l.tone === 'hot' ? 'rgba(255,255,255,0.85)' : DIM }}>
            <span
              style={{
                width: 6, height: 6, borderRadius: '50%', flex: 'none', boxSizing: 'border-box',
                background: l.tone === 'hot' ? n : l.tone === 'dim' ? 'rgba(255,255,255,0.38)' : 'transparent',
                border: l.tone === 'open' ? '1px solid rgba(255,255,255,0.72)' : 'none',
                boxShadow: l.tone === 'hot' ? `0 0 6px ${n}66` : 'none',
              }}
            />
            {l.label}
          </span>
        ))}
      </div>
    </motion.div>
  )
}
