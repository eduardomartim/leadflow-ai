import { useEffect, useState } from 'react'
import EmptyState from './EmptyState'
import { LeadsIcon, UserPlusIcon, CurrencyIcon, TrendIcon, TrayIcon } from './icons'
import { listLeadMetricsRaw } from '../../services/leadsService'
import { listActivities } from '../../services/activitiesService'
import { computeLeadMetrics, formatCurrency } from './leadOptions'
import { activityTypeLabel, formatDateTime } from './activityOptions'
import './OverviewPage.css'
import './ActivitiesPage.css'

const RECENT_ACTIVITIES_LIMIT = 5

function conversionLabel(conversionRate) {
  return conversionRate === null ? '—' : `${Math.round(conversionRate)}%`
}

export default function OverviewPage() {
  const [metrics, setMetrics] = useState(null)
  const [recentActivities, setRecentActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadOverview() {
    setLoading(true)
    setError('')
    try {
      const [leadRows, activityRows] = await Promise.all([listLeadMetricsRaw(), listActivities()])
      setMetrics(computeLeadMetrics(leadRows))
      setRecentActivities(activityRows.slice(0, RECENT_ACTIVITIES_LIMIT))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false

    Promise.resolve().then(() => {
      if (!cancelled) loadOverview()
    })

    return () => {
      cancelled = true
    }
  }, [])

  const stats = [
    {
      key: 'total',
      label: 'Total de leads',
      icon: LeadsIcon,
      value: metrics?.total,
      hint: metrics && metrics.total > 0 ? 'Total cadastrado' : 'Nenhum lead ainda',
    },
    {
      key: 'new',
      label: 'Leads novos',
      icon: UserPlusIcon,
      value: metrics?.newCount,
      hint: metrics && metrics.total > 0 ? 'Aguardando contato' : 'Nenhum lead ainda',
    },
    {
      key: 'value',
      label: 'Valor estimado',
      icon: CurrencyIcon,
      value: metrics ? formatCurrency(metrics.estimatedValue) : undefined,
      hint: metrics && metrics.total > 0 ? 'Soma de todos os leads' : 'Nenhum lead ainda',
    },
    {
      key: 'conversion',
      label: 'Taxa de conversão',
      icon: TrendIcon,
      value: metrics ? conversionLabel(metrics.conversionRate) : undefined,
      hint: metrics && metrics.total > 0 ? 'Ganhos sobre o total' : 'Nenhum lead ainda',
    },
  ]

  return (
    <div className="overview-page">
      {error && <p className="overview-error">{error}</p>}

      <div className="stats-grid">
        {stats.map(({ key, label, icon: Icon, value, hint }) => (
          <div className="stat-card" key={key}>
            <div className="stat-card-top">
              <span className="stat-card-label">{label}</span>
              <span className="stat-card-icon">
                <Icon />
              </span>
            </div>
            <span className="stat-card-value">{loading || value === undefined ? '—' : value}</span>
            <span className="stat-card-hint">{loading ? 'Aguardando dados' : hint}</span>
          </div>
        ))}
      </div>

      <section className="overview-section">
        <h2 className="section-title">Atividade recente</h2>
        {loading ? (
          <p className="overview-loading-text">Carregando atividades…</p>
        ) : recentActivities.length === 0 ? (
          <EmptyState
            icon={<TrayIcon />}
            title="Nenhuma atividade registrada ainda"
            description="Assim que você começar a interagir com seus leads, as atividades aparecerão aqui."
          />
        ) : (
          <ul className="activities-feed">
            {recentActivities.map((activity) => (
              <li className="activity-item" key={activity.id}>
                <div className="activity-item-top">
                  <span className="activity-lead-name">{activity.leads?.name || 'Lead removido'}</span>
                  <span className="activity-date">{formatDateTime(activity.created_at)}</span>
                </div>
                <span className="activity-type-badge">{activityTypeLabel(activity.type)}</span>
                <p className="activity-description">{activity.description}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
