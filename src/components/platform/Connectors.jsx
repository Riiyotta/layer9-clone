import { motion } from 'framer-motion'

// 1120x26 dashed connector strip: one vertical line centred over each card.
// Lines fade in with a staggered delay and march (.l9dp-march) while in view.
export default function Connectors({ count, on, march, delayBase }) {
  const step = 1120 / count
  return (
    <svg
      aria-hidden="true"
      width="100%"
      height="26"
      viewBox="0 0 1120 26"
      preserveAspectRatio="none"
      style={{ display: 'block' }}
    >
      {Array.from({ length: count }, (_, i) => {
        const x = step * i + step / 2
        return (
          <motion.line
            key={i}
            x1={x}
            y1={2}
            x2={x}
            y2={24}
            stroke="white"
            strokeOpacity={0.25}
            strokeWidth={0.814947}
            strokeDasharray="4.07 4.07"
            className={march ? 'l9dp-march' : undefined}
            initial={false}
            animate={{ opacity: on ? 1 : 0 }}
            transition={{ duration: 0.4, delay: on ? delayBase + 0.08 * i : 0 }}
          />
        )
      })}
    </svg>
  )
}
