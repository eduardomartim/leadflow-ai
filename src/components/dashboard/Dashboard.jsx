import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth.js'
import Sidebar from './Sidebar'
import Header from './Header'
import OverviewPage from './OverviewPage'
import LeadsPage from './LeadsPage'
import ActivitiesPage from './ActivitiesPage'
import './Dashboard.css'

const PAGE_TITLES = {
  overview: 'Visão geral',
  leads: 'Leads',
  activities: 'Atividades',
}

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const [page, setPage] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  function handleNavigate(nextPage) {
    setPage(nextPage)
    setSidebarOpen(false)
  }

  return (
    <div className="dashboard-shell">
      <Sidebar
        page={page}
        onNavigate={handleNavigate}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSignOut={signOut}
      />

      <div className="dashboard-content">
        <Header
          title={PAGE_TITLES[page]}
          user={user}
          onSignOut={signOut}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="page-content">
          {page === 'overview' && <OverviewPage />}
          {page === 'leads' && <LeadsPage />}
          {page === 'activities' && <ActivitiesPage />}
        </main>
      </div>
    </div>
  )
}
