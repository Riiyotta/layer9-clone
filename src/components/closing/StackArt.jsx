import { motion, useSpring, useTransform } from 'framer-motion'
import { STOP_ORANGE, FUCHSIA, GREEN, PURPLE } from '../../lib/tokens'
import { topFace, leftFace, rightFace, pins, faceMatrix } from './geometry'

// Original isometric layer-stack drawing (572x687). Every group is drawn at
// its "exploded" position; the motion offsets (CLONE_SPEC.md §8) drop each
// one by its travel so that p = 1 is the seated stack.

const CX = 287
const SLAB = { w: 200, h: 115, t: 18 }
const CHIP = { w: 62, h: 36, t: 14 }
const STROKE = 0.814947

const chipSpring = { stiffness: 190, damping: 14, mass: 1 }
const layerSpring = { stiffness: 210, damping: 16 }
const glowSpring = { stiffness: 120, damping: 22 }

// Drawn bottom-up so upper slabs paint over the ones below.
const LAYERS = [
  { key: 'l4', cy: 451, fill: 'acs-gD', sweepDelay: 0.38 },
  { key: 'l3', cy: 411, fill: 'acs-gC', sweepDelay: 0.33 },
  { key: 'l2', cy: 361, fill: 'acs-gB', sweepDelay: 0.31 },
  { key: 'l1', cy: 252, fill: 'acs-gA', sweepDelay: 0.25 },
]
const CHIP_CY = 158

// Dashed vertical connectors, behind the slabs.
const LINE_X = [147, 227, 347, 427]

function Sweep({ clipId, cx, cy, on, delay }) {
  return (
    <g clipPath={`url(#${clipId})`}>
      <g transform={`rotate(24 ${cx} ${cy})`}>
        <motion.rect
          x={cx - 80}
          y={cy - 170}
          width={160}
          height={340}
          fill="url(#acs-sweep)"
          initial={false}
          animate={on ? { x: [-300, 300], opacity: [0, 0.75, 0] } : { x: -300, opacity: 0 }}
          transition={
            on
              ? { duration: 2.1, ease: 'easeInOut', delay, repeat: Infinity, repeatDelay: 3.4 }
              : { duration: 0.2 }
          }
        />
      </g>
    </g>
  )
}

function Slab({ cy, fill, glow, sweepOn, sweepDelay, clipId }) {
  const { w, h, t } = SLAB
  return (
    <>
      <path d={leftFace(CX, cy, w, h, t)} fill="#090909" stroke="white" strokeWidth={STROKE} />
      <path d={rightFace(CX, cy, w, h, t)} fill="#090909" stroke="white" strokeWidth={STROKE} />
      <path d={topFace(CX, cy, w, h)} fill="#090909" stroke="white" strokeWidth={STROKE} />
      {/* inset trace ring on the top face */}
      <path
        d={topFace(CX, cy, w * 0.72, h * 0.72)}
        stroke="white"
        strokeOpacity={0.22}
        strokeWidth={STROKE}
        strokeDasharray="2 5"
      />
      <motion.path style={{ opacity: glow, pointerEvents: 'none' }} d={topFace(CX, cy, w, h)} fill={`url(#${fill})`} />
      <Sweep clipId={clipId} cx={CX} cy={cy} on={sweepOn} delay={sweepDelay} />
    </>
  )
}

export default function StackArt({ progress, linesOn, seated, reduced }) {
  const p = progress
  // Raw transforms (exact input ranges / outputs from the spec table)...
  const chipRaw = useTransform(p, [0.24, 0.88], [0, 172])
  const l1Raw = useTransform(p, [0.08, 0.5], [0, 93])
  const l3Raw = useTransform(p, [0.12, 0.54], [0, 14])
  const l2Raw = useTransform(p, [0.12, 0.58], [0, 24])
  const l4Raw = useTransform(p, [0.16, 0.56], [0, 14])
  const g1Raw = useTransform(p, [0.42, 0.86], [0, 0.5])
  const g2Raw = useTransform(p, [0.48, 0.89], [0, 0.5])
  const g3Raw = useTransform(p, [0.54, 0.92], [0, 0.5])
  const g4Raw = useTransform(p, [0.6, 0.95], [0, 0.5])
  // ...each smoothed by its spring.
  const chipY = useSpring(chipRaw, chipSpring)
  const l1Y = useSpring(l1Raw, layerSpring)
  const l3Y = useSpring(l3Raw, layerSpring)
  const l2Y = useSpring(l2Raw, layerSpring)
  const l4Y = useSpring(l4Raw, layerSpring)
  const g1 = useSpring(g1Raw, glowSpring)
  const g2 = useSpring(g2Raw, glowSpring)
  const g3 = useSpring(g3Raw, glowSpring)
  const g4 = useSpring(g4Raw, glowSpring)

  // Reduced motion: no spring settle, just the final values.
  const pick = (raw, sprung) => (reduced ? raw : sprung)
  const offsets = {
    l1: [pick(l1Raw, l1Y), pick(g1Raw, g1)],
    l2: [pick(l2Raw, l2Y), pick(g2Raw, g2)],
    l3: [pick(l3Raw, l3Y), pick(g3Raw, g3)],
    l4: [pick(l4Raw, l4Y), pick(g4Raw, g4)],
  }
  const sweepOn = !reduced && seated

  const line = {
    initial: { strokeDashoffset: 0 },
    animate: { strokeDashoffset: linesOn ? 8.14 : 0 },
    transition: linesOn ? { repeat: Infinity, ease: 'linear', duration: 0.8 } : { duration: 0 },
    opacity: seated ? 0.55 : 0.3,
    stroke: 'white',
    strokeWidth: STROKE,
    strokeDasharray: '4.07 4.07',
  }

  const { w: cw, h: ch, t: ct } = CHIP

  return (
    <svg width="100%" height="100%" viewBox="0 0 572 687" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#acs-frame)">
        {LINE_X.map((x) => (
          <motion.path key={x} {...line} d={`M${x} -105V560`} />
        ))}

        {/* static ground plate, fading out downward */}
        <path d={topFace(CX, 520, 250, 144)} stroke="url(#acs-fade)" strokeWidth={STROKE} />
        <path d={topFace(CX, 520, 180, 104)} stroke="url(#acs-fade)" strokeWidth={STROKE} strokeDasharray="4.07 4.07" />

        {LAYERS.map((layer) => (
          <motion.g key={layer.key} style={{ y: offsets[layer.key][0] }}>
            <Slab
              cy={layer.cy}
              fill={layer.fill}
              glow={offsets[layer.key][1]}
              sweepOn={sweepOn}
              sweepDelay={layer.sweepDelay}
              clipId={`acs-clip-${layer.key}`}
            />
          </motion.g>
        ))}

        {/* chip */}
        <motion.g style={{ y: pick(chipRaw, chipY) }}>
          <path d={pins(CX, CHIP_CY, cw, ch, ct)} stroke="white" strokeWidth={STROKE} />
          <path d={leftFace(CX, CHIP_CY, cw, ch, ct)} fill="#090909" stroke="white" strokeWidth={STROKE} />
          <path d={rightFace(CX, CHIP_CY, cw, ch, ct)} fill="#090909" stroke="white" strokeWidth={STROKE} />
          <path d={topFace(CX, CHIP_CY, cw, ch)} fill="white" stroke="url(#acs-chip-edge)" strokeWidth={1.6} />
          <g transform={faceMatrix(CX, CHIP_CY, cw, ch)}>
            <path
              d="M30 76L50 24L70 76M37.5 58H62.5"
              stroke="black"
              strokeWidth={9}
              strokeLinecap="square"
              strokeLinejoin="miter"
            />
          </g>
          <Sweep clipId="acs-clip-chip" cx={CX} cy={CHIP_CY} on={sweepOn} delay={0} />
        </motion.g>
      </g>

      <defs>
        <linearGradient id="acs-fade" x1="0" y1="376" x2="0" y2="664" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="acs-chip-edge" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor={STOP_ORANGE} />
          <stop offset="0.6" stopColor={FUCHSIA} />
          <stop offset="1" stopColor={PURPLE} />
        </linearGradient>
        <linearGradient id="acs-sweep" x1="0" y1="0" x2="1" y2="0">
          <stop stopColor="white" stopOpacity="0" />
          <stop offset="0.35" stopColor="white" stopOpacity="0.55" />
          <stop offset="0.5" stopColor="white" stopOpacity="0.95" />
          <stop offset="0.65" stopColor="white" stopOpacity="0.55" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
        {/* highlight overlays, one per layer, built from the accent palette */}
        <linearGradient id="acs-gA" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#331008" />
          <stop offset="0.25" stopColor={STOP_ORANGE} />
          <stop offset="0.68" stopColor={FUCHSIA} />
          <stop offset="1" stopColor="#2E0A1C" />
        </linearGradient>
        <linearGradient id="acs-gB" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#220C38" />
          <stop offset="0.25" stopColor={PURPLE} />
          <stop offset="0.68" stopColor="#950059" />
          <stop offset="1" stopColor="#2E0A1C" />
        </linearGradient>
        <linearGradient id="acs-gC" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#07291E" />
          <stop offset="0.25" stopColor={GREEN} />
          <stop offset="0.68" stopColor="#004549" />
          <stop offset="1" stopColor="#06231A" />
        </linearGradient>
        <linearGradient id="acs-gD" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#331008" />
          <stop offset="0.25" stopColor={STOP_ORANGE} />
          <stop offset="0.68" stopColor={PURPLE} />
          <stop offset="1" stopColor="#220C38" />
        </linearGradient>
        {LAYERS.map((layer) => (
          <clipPath key={layer.key} id={`acs-clip-${layer.key}`}>
            <path d={topFace(CX, layer.cy, SLAB.w, SLAB.h)} />
          </clipPath>
        ))}
        <clipPath id="acs-clip-chip">
          <path d={topFace(CX, CHIP_CY, cw, ch)} />
        </clipPath>
        <clipPath id="acs-frame">
          <rect width="572" height="687" rx="9.77936" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}
