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

export function NoteIcon(props) {
  return (
    <svg {...defaultProps} {...props}>
      <path d="M6 3h9l3 3v15H6z" />
      <path d="M9 9h6" />
      <path d="M9 13h6" />
      <path d="M9 17h4" />
    </svg>
  )
}

export function CallIcon(props) {
  return (
    <svg {...defaultProps} {...props}>
      <path d="M5 4h3l2 5-2 1a11 11 0 0 0 6 6l1-2 5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
    </svg>
  )
}

export function EmailIcon(props) {
  return (
    <svg {...defaultProps} {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  )
}

export function MeetingIcon(props) {
  return (
    <svg {...defaultProps} {...props}>
      <circle cx="8" cy="9" r="3" />
      <circle cx="16" cy="9" r="3" />
      <path d="M3 20c0-3 2.2-5 5-5s5 2 5 5" />
      <path d="M11 20c0-3 2.2-5 5-5s5 2 5 5" />
    </svg>
  )
}

export function StatusChangeIcon(props) {
  return (
    <svg {...defaultProps} {...props}>
      <path d="M7 7h10l-3-3" />
      <path d="M17 17H7l3 3" />
    </svg>
  )
}

export function TaskIcon(props) {
  return (
    <svg {...defaultProps} {...props}>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M8 12l3 3 5-6" />
    </svg>
  )
}

export function OtherIcon(props) {
  return (
    <svg {...defaultProps} {...props}>
      <circle cx="6" cy="12" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="18" cy="12" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function CalendarIcon(props) {
  return (
    <svg {...defaultProps} {...props}>
      <rect x="3.5" y="4.5" width="17" height="16" rx="2" />
      <path d="M3.5 9.5h17" />
      <path d="M8 3v3" />
      <path d="M16 3v3" />
    </svg>
  )
}

export function RefreshIcon(props) {
  return (
    <svg {...defaultProps} {...props}>
      <path d="M4 12a8 8 0 0 1 14-5.3L20 8" />
      <path d="M20 4v4h-4" />
      <path d="M20 12a8 8 0 0 1-14 5.3L4 16" />
      <path d="M4 20v-4h4" />
    </svg>
  )
}

export function ChevronRightIcon(props) {
  return (
    <svg {...defaultProps} {...props}>
      <path d="M9 5l7 7-7 7" />
    </svg>
  )
}

export function SearchIcon(props) {
  return (
    <svg {...defaultProps} {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-4.3-4.3" />
    </svg>
  )
}

export function DotsIcon(props) {
  return (
    <svg {...defaultProps} {...props}>
      <circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function PencilIcon(props) {
  return (
    <svg {...defaultProps} {...props}>
      <path d="M4 20l1-4.5L15.5 5 19 8.5 8.5 19 4 20z" />
      <path d="M13.5 6.5L17.5 10.5" />
    </svg>
  )
}

export function TrashIcon(props) {
  return (
    <svg {...defaultProps} {...props}>
      <path d="M5 7h14" />
      <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      <path d="M7 7l1 13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-13" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  )
}

export function SparkleIcon(props) {
  return (
    <svg {...defaultProps} {...props}>
      <path d="M12 3.5l1.5 4.5 4.5 1.5-4.5 1.5-1.5 4.5-1.5-4.5L6 9.5l4.5-1.5z" />
      <path d="M19 15l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z" />
    </svg>
  )
}

export function StarIcon(props) {
  return (
    <svg {...defaultProps} {...props}>
      <path d="M12 3.5l2.6 5.3 5.9.8-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.8z" />
    </svg>
  )
}

export function LockIcon(props) {
  return (
    <svg {...defaultProps} {...props}>
      <rect x="5" y="10.5" width="14" height="10" rx="2" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
    </svg>
  )
}

export function EyeIcon(props) {
  return (
    <svg {...defaultProps} {...props}>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

export function EyeOffIcon(props) {
  return (
    <svg {...defaultProps} {...props}>
      <path d="M3 3l18 18" />
      <path d="M10.6 5.7A10.4 10.4 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a13.6 13.6 0 0 1-3.1 3.9M6.5 7.6A13.7 13.7 0 0 0 2.5 12S6 18.5 12 18.5a10.6 10.6 0 0 0 4.2-.9" />
      <path d="M9.6 10.6a3 3 0 0 0 4 4" />
    </svg>
  )
}

export function ArrowRightIcon(props) {
  return (
    <svg {...defaultProps} {...props}>
      <path d="M4 12h16" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  )
}

export function UserIcon(props) {
  return (
    <svg {...defaultProps} {...props}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20c0-4 3.4-7 7.5-7s7.5 3 7.5 7" />
    </svg>
  )
}

export function BuildingIcon(props) {
  return (
    <svg {...defaultProps} {...props}>
      <rect x="5" y="3" width="10" height="18" rx="1" />
      <path d="M15 8h4v13" />
      <path d="M15 21H5" />
      <path d="M8 7h1M11 7h1M8 11h1M11 11h1M8 15h1M11 15h1" />
    </svg>
  )
}

export function AlertIcon(props) {
  return (
    <svg {...defaultProps} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5" />
      <circle cx="12" cy="16" r="0.6" fill="currentColor" stroke="none" />
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
