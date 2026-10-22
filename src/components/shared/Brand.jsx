// Placeholder brand. Swap for a licensed wordmark/mark when available.
export const BRAND = 'Acme'

export function Wordmark({ height = 30 }) {
  return (
    <svg height={height} viewBox="-4.7 0 141.4 40" fill="none" role="img" aria-label={`${BRAND} OS`}>
      <text x="0" y="29" fill="#fff" fontFamily="var(--font-head)" fontSize="30" fontWeight="450" letterSpacing="-0.5">
        Acme
      </text>
      <rect x="86" y="5" width="40" height="30" rx="5" fill="#fff" />
      <text x="106" y="28.5" textAnchor="middle" fill="#090909" fontFamily="var(--font-head)" fontSize="22" fontWeight="650">
        OS
      </text>
    </svg>
  )
}

// Square "chip" hub glyph — notched frame with a gradient edge.
export function ChipMark({ size = 88, glyph = 'A', active = false }) {
  const id = `chip-grad-${size}`
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2EEB85" />
          <stop offset="0.55" stopColor="#1f6a6a" />
          <stop offset="1" stopColor="#6b2fa3" />
        </linearGradient>
      </defs>
      <path
        d="M10 2 H42 L46 7 H54 L58 2 H90 Q98 2 98 10 V42 L93 46 V54 L98 58 V90 Q98 98 90 98 H58 L54 93 H46 L42 98 H10 Q2 98 2 90 V58 L7 54 V46 L2 42 V10 Q2 2 10 2 Z"
        fill="#0a0a0a"
        stroke={`url(#${id})`}
        strokeWidth="1.6"
      />
      <text x="50" y="66" textAnchor="middle" fill="#fff" fontFamily="var(--font-head)" fontSize="48" fontWeight="600">
        {glyph}
      </text>
    </svg>
  )
}
