import { motion } from 'framer-motion'
import { STOP_ORANGE, FUCHSIA, GREEN } from '../../lib/tokens'

const RINGS = [
  { color: STOP_ORANGE, delay: 0.25 },
  { color: FUCHSIA, delay: 0.5 },
  { color: GREEN, delay: 0.75 },
]

// Three one-shot rings centred on the seated chip, fired when the stack seats.
export default function Rings({ lit }) {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 572 687"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none' }}
    >
      {RINGS.map((ring) => (
        <motion.circle
          key={ring.color}
          cx={287}
          cy={329}
          fill="none"
          stroke={ring.color}
          strokeWidth={1.2}
          initial={false}
          animate={lit ? { r: [10, 620], opacity: [0.45, 0] } : { r: 10, opacity: 0 }}
          transition={lit ? { duration: 2.4, ease: 'easeOut', delay: ring.delay } : { duration: 0.2 }}
        />
      ))}
    </svg>
  )
}
