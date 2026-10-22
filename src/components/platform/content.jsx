import { BLINK_LINE, NEON_LINE, BOOST_LINE } from '../../lib/tokens'

// Placeholder copy for the fictional "Acme" brand. Lengths track the
// reference's character counts (CLONE_SPEC.md §6, recon/text-roles-1280.json).
export const EYEBROW_LABEL = 'BUILD ON ACME'
export const TITLE = 'Build your own agents on Acme.'
export const LEDE_TEXT = 'Ship custom tools fast with our SDKs, a CLI, and live event streams on every layer.'
export const TOP_TITLE = 'Tools teams built'
export const CHIPS = [
  'billing bots',
  'ONT triage',
  'fiber splice planners',
  'churn-risk call sheets',
  'NOC run-sheets',
  'your next ideas',
]
export const SLAB_LABEL = 'ACME CORE — MANAGED CLOUD'
export const SLAB_LINE = 'Built, run, and kept current by our team.'

// Card order and accent lines follow the reference DOM: BLINK, NEON, BOOST.
export const CARDS = [
  {
    label: 'SDK',
    desc: 'Typed clients for every Acme service call.',
    line: BLINK_LINE,
    icon: (
      <>
        <path d="M9 4.5c-2 0-3 1-3 3v2c0 1.2-.8 2.5-2.5 2.5C5.2 12 6 13.3 6 14.5v2c0 2 1 3 3 3" />
        <path d="M15 4.5c2 0 3 1 3 3v2c0 1.2.8 2.5 2.5 2.5-1.7 0-2.5 1.3-2.5 2.5v2c0 2-1 3-3 3" />
      </>
    ),
  },
  {
    label: 'CLI',
    desc: 'Script provisioning and audits from a shell.',
    line: NEON_LINE,
    icon: (
      <>
        <rect x="3" y="4.5" width="18" height="15" rx="2" />
        <path d="M7 10l3 2.5L7 15" />
        <path d="M12.5 15H17" />
      </>
    ),
  },
  {
    label: 'EVENT STREAMS',
    desc: 'Network change events, as they land.',
    line: BOOST_LINE,
    icon: (
      <>
        <path d="M3 12h4l2.5-6 5 12 2.5-6h4" />
      </>
    ),
  },
]
