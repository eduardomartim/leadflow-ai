import { MenuIcon, LogoutIcon } from './icons'
import { useCompanyId } from '../../hooks/useCompanyId'
import './Header.css'

export default function Header({ title, user, onSignOut, onMenuClick }) {
  const { role } = useCompanyId()
  const displayName = user?.user_metadata?.full_name || user?.email

  return (
    <header className="dashboard-header">
      <div className="dashboard-header-left">
        <button
          type="button"
          className="header-menu-btn"
          onClick={onMenuClick}
          aria-label="Abrir navegação"
        >
          <MenuIcon />
        </button>
        <h1 className="page-title">{title}</h1>
      </div>

      <div className="dashboard-user">
        <span className="dashboard-user-name">
          {displayName}
          {role === 'admin' && <span className="dashboard-user-role">Admin</span>}
        </span>
        <button type="button" className="dashboard-signout" onClick={onSignOut}>
          <LogoutIcon />
          <span>Sair</span>
        </button>
      </div>
    </header>
  )
}
