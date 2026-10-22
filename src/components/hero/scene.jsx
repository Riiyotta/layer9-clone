import { memo } from 'react'
import { EASE_CSS } from '../../lib/tokens.js'
import { MAP_ZOOM, MAP_X_FRAC, MAP_LAT, tileSrc } from './data.js'

// CARTO dark basemap, tiles at 256px (files are @2x). Centred on MAP_LAT / MAP_X_FRAC.
export const MapLayer = memo(function MapLayer({ cols = 7, rows = 5, attribution = true }) {
  const n = 2 ** MAP_ZOOM
  const fx = MAP_X_FRAC * n
  const lat = (MAP_LAT * Math.PI) / 180
  const fy = ((1 - Math.log(Math.tan(lat) + 1 / Math.cos(lat)) / Math.PI) / 2) * n
  const x0 = Math.floor(fx) - Math.floor(cols / 2)
  const y0 = Math.floor(fy) - Math.floor(rows / 2)
  const tiles = []
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) tiles.push([c, r])
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: 256 * cols,
          height: 256 * rows,
          transform: `translate(${-256 * (fx - x0)}px, ${-256 * (fy - y0)}px)`,
        }}
      >
        {tiles.map(([c, r]) => (
          <img
            key={`${c}-${r}`}
            src={tileSrc(x0 + c, y0 + r)}
            alt=""
            draggable={false}
            style={{ position: 'absolute', left: 256 * c, top: 256 * r, width: 256, height: 256 }}
          />
        ))}
      </div>
      <div
        style={{
          position: 'absolute',
          right: 8,
          bottom: 4,
          fontSize: 7.5,
          color: 'rgba(255,255,255,0.35)',
          zIndex: 2,
          opacity: attribution ? 1 : 0,
          transition: 'opacity 300ms',
        }}
      >
        © CARTO © OpenStreetMap
      </div>
    </div>
  )
})

export const AmbientDots = memo(function AmbientDots({ dots, viewBox, slice = false }) {
  return (
    <svg
      viewBox={viewBox}
      preserveAspectRatio={slice ? 'xMidYMid slice' : undefined}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    >
      {dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={3.2} fill="#fff" opacity={0.5 * d.a} />
      ))}
    </svg>
  )
})

// Risk dots: group fade 350ms EASE staggered 45ms × index; r5 core pulses via .l9h2-bad.
export const RiskDots = memo(function RiskDots({ dots, viewBox, slice = false, on, blink }) {
  return (
    <svg
      viewBox={viewBox}
      preserveAspectRatio={slice ? 'xMidYMid slice' : undefined}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    >
      {dots.map((d, i) => (
        <g
          key={i}
          opacity={on ? 1 : 0}
          style={{ transition: `opacity 350ms ${EASE_CSS}`, transitionDelay: on ? `${45 * i}ms` : '0ms' }}
        >
          <circle cx={d.x} cy={d.y} r={10} fill={d.c} opacity={0.16} />
          <circle className={blink ? 'l9h2-bad' : undefined} cx={d.x} cy={d.y} r={5} fill={d.c} stroke="#0a0a0c" strokeWidth={1.5} />
        </g>
      ))}
    </svg>
  )
})
