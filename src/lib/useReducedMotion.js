import { useReducedMotion as useFMReducedMotion } from 'framer-motion'

// Episodes render their final state with no timers when this is true.
export default function useReducedMotion() {
  return !!useFMReducedMotion()
}
