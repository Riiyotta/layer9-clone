import { SECTION_PAD, HAIRLINE, NEON } from '../lib/tokens'
import SectionHeader from './shared/SectionHeader'

// CLONE_SPEC §7. Static markup; hover lives in sections.css.
const ICON = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: NEON,
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

const QUADRANTS = [
  {
    title: 'Policy-bound AI',
    body: 'Each action an agent takes is checked against your policies, and pauses for sign-off wherever you ask.',
    proof: 'maintenance windows · sign-off flows · scoped edits',
    icon: (
      <svg {...ICON}>
        <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
        <circle cx="15" cy="7" r="2" />
        <circle cx="9" cy="17" r="2" />
      </svg>
    ),
  },
  {
    title: 'Encrypted end to end',
    body: 'Traffic and stored records are encrypted with modern, audited ciphers. Nothing ever sits in plain text.',
    proof: 'TLS 1.2+ on the edge · mTLS inside · AES-256 disks',
    icon: (
      <svg {...ICON}>
        <circle cx="8" cy="12" r="3.5" />
        <path d="M11.5 12H20M17 12v3M20 12v2.5" />
      </svg>
    ),
  },
  {
    title: 'Your data only',
    body: 'Model vendors keep none of your subscriber records and never train on them. Ownership stays with you.',
    proof: 'no retention · never used for model training',
    icon: (
      <svg {...ICON}>
        <ellipse cx="12" cy="6" rx="7" ry="2.5" />
        <path d="M5 6v12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V6" />
        <path d="M5 12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5" />
      </svg>
    ),
  },
  {
    title: 'Tenant separation',
    body: 'Each customer runs in its own sealed environment with minimal access, and every action is logged.',
    proof: 'sealed tenants · SSO and SCIM · append-only log',
    icon: (
      <svg {...ICON}>
        <rect x="3.5" y="5" width="7" height="14" rx="1.5" />
        <rect x="13.5" y="5" width="7" height="14" rx="1.5" />
      </svg>
    ),
  },
]

export default function Security() {
  return (
    <section id="security" style={{ position: 'relative', width: '100%', padding: SECTION_PAD, overflow: 'hidden' }}>
      <div style={{ position: 'relative' }}>
        <SectionHeader
          eyebrow="05 · SAFETY"
          title="AI your network can trust."
          lede={
            <span className="l9sec-lede">
              Guardrails for real production work, so your team can hand tasks to AI with calm.
            </span>
          }
        />
        <div className="l9-security-matrix" style={{ borderColor: HAIRLINE }}>
          {QUADRANTS.map((q, i) => (
            <article key={q.title} className="l9-security-quadrant">
              <div className="l9-security-topline">
                <span className="l9-security-icon" aria-hidden="true">
                  {q.icon}
                </span>
                <span className="l9-security-index">{String(i + 1).padStart(2, '0')}</span>
              </div>
              <h3>{q.title}</h3>
              <p>{q.body}</p>
              <div className="l9-security-proof">{q.proof}</div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
