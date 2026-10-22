// Simple original line icons for the hero scene. All decorative.
const line = { fill: 'none', stroke: 'currentColor', strokeLinecap: 'round', strokeLinejoin: 'round' }

export function Ico({ size = 13, sw = 1.6, children, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ flex: 'none', ...style }}>
      <g {...line} strokeWidth={sw}>{children}</g>
    </svg>
  )
}

export const PlusIcon = (p) => (
  <Ico {...p}>
    <path d="M12 5v14M5 12h14" />
  </Ico>
)
export const SendArrow = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 19V6M6 11.5 12 5.5l6 6" fill="none" stroke="#090909" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
export const DownloadIcon = (p) => (
  <Ico {...p}>
    <path d="M12 4v10M7.5 10 12 14.5 16.5 10M5 19h14" />
  </Ico>
)
export const SheetIcon = (p) => (
  <Ico {...p}>
    <rect x="5" y="4" width="14" height="16" rx="1.5" />
    <path d="M5 9.5h14M5 14.5h14M11 9.5V20" />
  </Ico>
)
export const CalendarIcon = (p) => (
  <Ico {...p}>
    <rect x="4" y="6" width="16" height="14" rx="2" />
    <path d="M4 10.5h16M9 3.5v4M15 3.5v4" />
  </Ico>
)
export const CheckIcon = (p) => (
  <Ico {...p}>
    <path d="M5.5 12.5 10 17l8.5-9.5" />
  </Ico>
)
export const ArrowLeft = (p) => (
  <Ico {...p}>
    <path d="M19 12H6M11 6.5 5.5 12l5.5 5.5" />
  </Ico>
)
export const BoxIcon = (p) => (
  <Ico {...p}>
    <rect x="4" y="5" width="16" height="4" rx="1" />
    <path d="M5.5 9v10h13V9M10 13h4" />
  </Ico>
)
export const BinIcon = (p) => (
  <Ico {...p}>
    <path d="M5 7h14M10 7V5h4v2M7 7l1 13h8l1-13" />
  </Ico>
)
export const MailIcon = (p) => (
  <Ico {...p}>
    <rect x="4" y="6" width="16" height="12" rx="1.5" />
    <path d="M4.5 7 12 12.5 19.5 7" />
  </Ico>
)
export const DotsIcon = (p) => (
  <Ico {...p} sw={2.6}>
    <path d="M12 6v.1M12 12v.1M12 18v.1" />
  </Ico>
)
export const ChevronLeft = (p) => (
  <Ico {...p} sw={1.8}>
    <path d="M15 6 9 12l6 6" />
  </Ico>
)
export const ChevronRight = (p) => (
  <Ico {...p} sw={1.8}>
    <path d="M9 6l6 6-6 6" />
  </Ico>
)
export const PrintIcon = (p) => (
  <Ico {...p} sw={1.5}>
    <rect x="6" y="3.5" width="12" height="5" />
    <rect x="3.5" y="8.5" width="17" height="8" rx="1.5" />
    <rect x="6.5" y="13.5" width="11" height="7" />
  </Ico>
)
export const OpenIcon = (p) => (
  <Ico {...p} sw={1.5}>
    <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
  </Ico>
)
export const ClipIcon = (p) => (
  <Ico {...p} sw={1.5}>
    <path d="M9 7v9a3 3 0 0 0 6 0V6a2 2 0 0 0-4 0v9" />
  </Ico>
)
export const StarIcon = (p) => (
  <Ico {...p}>
    <path d="M12 4l2.4 5 5.4.6-4 3.7 1.1 5.4L12 16l-4.9 2.7 1.1-5.4-4-3.7 5.4-.6z" />
  </Ico>
)
export const ReplyIcon = (p) => (
  <Ico {...p}>
    <path d="M10 6 4 12l6 6M4 12h11a5 5 0 0 1 5 5v2" />
  </Ico>
)
export const ForwardIcon = (p) => (
  <Ico {...p}>
    <path d="M14 6l6 6-6 6M20 12H9a5 5 0 0 0-5 5v2" />
  </Ico>
)
export const SmileIcon = (p) => (
  <Ico {...p} sw={1.5}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M9 10h.01M15 10h.01M8.8 14.2c1.8 2 4.6 2 6.4 0" />
  </Ico>
)
export const DocIcon = (p) => (
  <Ico {...p} sw={1.5}>
    <path d="M6 3.5h8l4 4v13H6zM14 3.5v4h4M9 12h6M9 15.5h6" />
  </Ico>
)

export function SignalIcon() {
  return (
    <svg width="15" height="10" viewBox="0 0 15 10" aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={i * 3.9} y={7.5 - i * 2.4} width="2.7" height={2.5 + i * 2.4} rx="0.7" fill="rgba(255,255,255,0.9)" />
      ))}
    </svg>
  )
}
export function BatteryIcon() {
  return (
    <svg width="20" height="10" viewBox="0 0 20 10" aria-hidden="true">
      <rect x="0.5" y="0.5" width="16.5" height="9" rx="2.5" fill="none" stroke="rgba(255,255,255,0.5)" />
      <rect x="2" y="2" width="11" height="6" rx="1.3" fill="rgba(255,255,255,0.9)" />
      <rect x="18" y="3.3" width="1.6" height="3.4" rx="0.8" fill="rgba(255,255,255,0.5)" />
    </svg>
  )
}
