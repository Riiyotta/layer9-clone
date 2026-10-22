import { HEAD } from '../../lib/tokens'

// Neutral placeholder logo: white 2-letter monogram, contained at 66%
// (the reference's default contained-logo scale).
export default function Monogram({ letters }) {
  return (
    <svg
      viewBox="0 0 40 40"
      aria-hidden="true"
      style={{ position: 'relative', zIndex: 3, width: '66%', height: '66%', display: 'block' }}
    >
      <text
        x="20"
        y="21"
        textAnchor="middle"
        dominantBaseline="central"
        fill="#fff"
        style={{ fontFamily: HEAD }}
        fontSize="17"
        fontWeight="600"
        letterSpacing="-0.5"
      >
        {letters}
      </text>
    </svg>
  )
}
