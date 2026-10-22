// Corner-bracket frame drawn behind every grid cell (own artwork; the
// viewBox and -1px inset follow CLONE_SPEC §4). One rounded L, mirrored ×4.
const BRACKET = 'M1 30V9A8 8 0 0 1 9 1H30V3H9A6 6 0 0 0 3 9V30Z'
const CORNERS = [
  undefined,
  'matrix(-1 0 0 1 112 0)',
  'matrix(1 0 0 -1 0 111)',
  'matrix(-1 0 0 -1 112 111)',
]

export default function CellFrame() {
  return (
    <div style={{ position: 'absolute', inset: '-0.0625rem', pointerEvents: 'none' }}>
      <svg width="100%" height="100%" viewBox="0 0 112 111" fill="none" preserveAspectRatio="none" aria-hidden="true">
        {CORNERS.map((t, i) => (
          <path key={i} d={BRACKET} transform={t} fill="#2E2E2E" />
        ))}
      </svg>
    </div>
  )
}
