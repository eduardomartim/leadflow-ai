import { AuthProvider } from './hooks/AuthProvider'
import { useAuth } from './hooks/useAuth'
import AuthScreen from './components/auth/AuthScreen'
import Dashboard from './components/dashboard/Dashboard'
import './App.css'

function AppContent() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="app-loading">
        <p>Carregando…</p>
      </div>
    )
  }

  return session ? <Dashboard /> : <AuthScreen />
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
