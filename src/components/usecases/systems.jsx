// The 9 connected-system tiles. Original 24-unit stroke icons, drawn at 26px.
export const SYSTEMS = [
  {
    label: 'Billing',
    icon: (
      <>
        <path d="M6 3.5h12v17l-2-1.4-2 1.4-2-1.4-2 1.4-2-1.4-2 1.4Z" />
        <path d="M9 8h6M9 11.5h6M9 15h3.5" />
      </>
    ),
  },
  {
    label: 'CRM',
    icon: (
      <>
        <circle cx="9" cy="9" r="2.8" />
        <path d="M3.8 18.5c.6-2.8 2.6-4.3 5.2-4.3s4.6 1.5 5.2 4.3" />
        <circle cx="16.5" cy="8" r="2.3" />
        <path d="M15.6 13.2c2.4-.2 4.2 1.2 4.7 3.8" />
      </>
    ),
  },
  {
    label: 'Network',
    icon: (
      <>
        <circle cx="12" cy="5" r="2" />
        <circle cx="5.5" cy="18" r="2" />
        <circle cx="18.5" cy="18" r="2" />
        <path d="M11.1 6.8 6.4 16.2M12.9 6.8l4.7 9.4M7.5 18h9" />
      </>
    ),
  },
  {
    label: 'Plant map',
    icon: (
      <>
        <path d="M12 21s-6-5.6-6-10.5a6 6 0 0 1 12 0C18 15.4 12 21 12 21Z" />
        <circle cx="12" cy="10.5" r="2.2" />
      </>
    ),
  },
  {
    label: 'Ticketing',
    icon: (
      <>
        <path d="M3.5 7h17v3.2a1.8 1.8 0 0 0 0 3.6V17h-17v-3.2a1.8 1.8 0 0 0 0-3.6Z" />
        <path d="M14.5 8.8v1.6M14.5 13.6v1.6" />
      </>
    ),
  },
  {
    label: 'Ops',
    icon: (
      <>
        <path d="M14.8 4.2a4.2 4.2 0 0 0-5 5.4L4 15.4 6.6 18l5.8-5.8a4.2 4.2 0 0 0 5.4-5l-2.6 2.6-2.3-.6-.6-2.3Z" />
      </>
    ),
  },
  {
    label: 'Messaging',
    icon: (
      <>
        <rect x="3.5" y="6" width="17" height="12" rx="1.8" />
        <path d="m4.2 7.2 7.8 5.9 7.8-5.9" />
      </>
    ),
  },
  {
    label: 'Docs',
    icon: (
      <>
        <path d="M3.5 7a1.5 1.5 0 0 1 1.5-1.5h4.2l2 2.2H19a1.5 1.5 0 0 1 1.5 1.5v8.8a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 18Z" />
        <path d="M3.5 10.5h17" />
      </>
    ),
  },
  {
    label: 'Bank',
    icon: (
      <>
        <path d="M4 20h16" />
        <path d="M7 16.5v-4M12 16.5V7M17 16.5v-6" />
      </>
    ),
  },
]
