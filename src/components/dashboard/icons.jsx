const defaultProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

export function OverviewIcon(props) {
  return (
    <svg {...defaultProps} {...props}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  )
}

export function LeadsIcon(props) {
  return (
    <svg {...defaultProps} {...props}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 20c0-3.3 2.5-6 5.5-6s5.5 2.7 5.5 6" />
      <circle cx="17" cy="7" r="2.3" />
      <path d="M15.8 13.2c2.5.2 4.7 2.6 4.7 5.8" />
    </svg>
  )
}

export function ActivityIcon(props) {
  return (
    <svg {...defaultProps} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  )
}

export function LogoutIcon(props) {
  return (
    <svg {...defaultProps} {...props}>
      <path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3" />
      <path d="M15 8l4 4-4 4" />
      <path d="M19 12H9" />
    </svg>
  )
}

export function MenuIcon(props) {
  return (
    <svg {...defaultProps} {...props}>
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </svg>
  )
}

export function CurrencyIcon(props) {
  return (
    <svg {...defaultProps} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 15.5c.6.7 1.5 1 2.6 1 1.8 0 3.1-1 3.1-2.3 0-3-6-1.4-6-4.3 0-1.3 1.3-2.2 3-2.2 1 0 1.9.3 2.6 1" />
      <path d="M12 6.5v11" />
    </svg>
  )
}

export function TrendIcon(props) {
  return (
    <svg {...defaultProps} {...props}>
      <path d="M4 16l5-5 4 4 7-8" />
      <path d="M15 7h5v5" />
    </svg>
  )
}

export function UserPlusIcon(props) {
  return (
    <svg {...defaultProps} {...props}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 20c0-3.3 2.5-6 5.5-6s5.5 2.7 5.5 6" />
      <path d="M18 8v5" />
      <path d="M15.5 10.5h5" />
    </svg>
  )
}

export function TrayIcon(props) {
  return (
    <svg {...defaultProps} {...props}>
      <path d="M4 13V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v7" />
      <path d="M4 13l3 6h10l3-6" />
      <path d="M4 13h5l1.2 2.4h3.6L15 13h5" />
    </svg>
  )
}
