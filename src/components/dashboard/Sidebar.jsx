import { OverviewIcon, LeadsIcon, ActivityIcon } from './icons'
import leadflowLogo from '../../assets/leadflow-logo.png'
import './Sidebar.css'

const NAV_ITEMS = [
  { key: 'overview', label: 'Visão geral', icon: OverviewIcon },
  { key: 'leads', label: 'Leads', icon: LeadsIcon },
  { key: 'activities', label: 'Atividades', icon: ActivityIcon },
]

export default function Sidebar({ page, onNavigate, open, onClose }) {
  return (
    <>
      <div className={`sidebar-backdrop ${open ? 'open' : ''}`} onClick={onClose} />

      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <img src={leadflowLogo} alt="LeadFlow AI" className="sidebar-logo" />
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
      </aside>
    </>
  )
}
