import { OverviewIcon, LeadsIcon, ActivityIcon, LogoutIcon } from './icons'
import './Sidebar.css'

const NAV_ITEMS = [
  { key: 'overview', label: 'Visão geral', icon: OverviewIcon },
  { key: 'leads', label: 'Leads', icon: LeadsIcon },
  { key: 'activities', label: 'Atividades', icon: ActivityIcon },
]

export default function Sidebar({ page, onNavigate, open, onClose, onSignOut }) {
  return (
    <>
      <div className={`sidebar-backdrop ${open ? 'open' : ''}`} onClick={onClose} />

      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <span className="sidebar-logo-mark">LF</span>
          <span className="sidebar-brand-name">LeadFlow AI</span>
        </div>

        <nav className="sidebar-nav" aria-label="Navegação principal">
          {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              className={`sidebar-nav-item ${page === key ? 'active' : ''}`}
              onClick={() => onNavigate(key)}
              aria-current={page === key ? 'page' : undefined}
            >
              <Icon />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button type="button" className="sidebar-signout" onClick={onSignOut}>
            <LogoutIcon />
            <span>Sair</span>
          </button>
        </div>
      </aside>
    </>
  )
}
