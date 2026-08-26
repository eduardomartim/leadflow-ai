import { useEffect, useMemo, useState } from 'react'
import EmptyState from './EmptyState'
import {
  LeadsIcon,
  CurrencyIcon,
  TrendIcon,
  ActivityIcon,
  StarIcon,
  TrayIcon,
  CalendarIcon,
  RefreshIcon,
  ChevronRightIcon,
} from './icons'
import { listLeads } from '../../services/leadsService'
import { listActivities } from '../../services/activitiesService'
import { computeLeadMetrics, formatCurrency, statusLabel, statusColorVar, STATUS_OPTIONS } from './leadOptions'
import { activityActionLabel, activityTypeIcon, formatRelativeTime } from './activityOptions'
import { groupByDay, cumulativeValues, topLeadsByValue, initials } from './overviewMetrics'
import { CountUp } from './useCountUp'
import Sparkline from './charts/Sparkline'
import PipelineChart from './charts/PipelineChart'
import TimelineChart from './charts/TimelineChart'
import CompositionBar from './charts/CompositionBar'
import './OverviewPage.css'
import './LeadsPage.css'

const RECENT_ACTIVITIES_LIMIT = 5
const TOP_LEADS_LIMIT = 4

export default function OverviewPage({ onNavigate }) {
  const [leadRows, setLeadRows] = useState(null)
  const [activityRows, setActivityRows] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [lastUpdated, setLastUpdated] = useState(null)
  const [activeStage, setActiveStage] = useState('all')

  async function loadOverview({ isRefresh = false } = {}) {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    setError('')
    try {
      const [leads, activities] = await Promise.all([listLeads(), listActivities()])
      setLeadRows(leads)
      setActivityRows(activities)
      setLastUpdated(Date.now())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
      if (isRefresh) setTimeout(() => setRefreshing(false), 700)
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

  const metrics = useMemo(() => (leadRows ? computeLeadMetrics(leadRows) : null), [leadRows])

  const leadsByDay = useMemo(() => groupByDay(leadRows || [], 'created_at'), [leadRows])
  const valueByDay = useMemo(
    () => groupByDay(leadRows || [], 'created_at', (row) => row.estimated_value || 0),
    [leadRows],
  )
  const activitiesByDay = useMemo(() => groupByDay(activityRows || [], 'created_at'), [activityRows])

  const totalsSparkline = useMemo(() => cumulativeValues(leadsByDay), [leadsByDay])
  const valueSparkline = useMemo(() => cumulativeValues(valueByDay), [valueByDay])
  const activitiesSparkline = useMemo(() => activitiesByDay.map((point) => point.value), [activitiesByDay])

  const topLeads = useMemo(() => topLeadsByValue(leadRows || [], TOP_LEADS_LIMIT), [leadRows])
  const recentActivities = useMemo(
    () => (activityRows || []).slice(0, RECENT_ACTIVITIES_LIMIT),
    [activityRows],
  )

  const periodDays = Math.max(leadsByDay.length, activitiesByDay.length)
  const activityCount = activityRows?.length

  const conversionComposition = metrics && [
    { key: 'won', label: 'Ganho', value: metrics.wonCount, color: 'var(--stage-won)' },
    {
      key: 'active',
      label: 'Em andamento',
      value: metrics.total - metrics.wonCount - metrics.lostCount,
      color: 'var(--accent)',
    },
    { key: 'lost', label: 'Perdido', value: metrics.lostCount, color: 'var(--stage-lost)' },
  ]

  const stats = [
    {
      key: 'total',
      label: 'Total de leads',
      icon: LeadsIcon,
      value: metrics?.total,
      format: (v) => Math.round(v),
      hint: 'Todos os leads cadastrados',
      sparkline: totalsSparkline,
    },
    {
      key: 'value',
      label: 'Valor estimado',
      icon: CurrencyIcon,
      value: metrics?.estimatedValue,
      format: (v) => formatCurrency(v),
      hint: 'Soma do valor dos leads',
      sparkline: valueSparkline,
    },
    {
      key: 'conversion',
      label: 'Taxa de conversão',
      icon: TrendIcon,
      value: metrics ? metrics.conversionRate ?? 0 : undefined,
      format: (v) => `${Math.round(v)}%`,
      hint: 'Ganho sobre o total',
      composition: conversionComposition,
    },
    {
      key: 'activities',
      label: 'Atividades',
      icon: ActivityIcon,
      value: activityCount,
      format: (v) => Math.round(v),
      hint: 'Interações registradas',
      sparkline: activitiesSparkline,
    },
  ]

  return (
    <div className="overview-page">
      <div className="overview-header">
        <div className="overview-header-text">
          <h2 className="overview-title">Visão geral</h2>
          <p className="overview-subtitle">Panorama do funil de vendas e da atividade recente da sua equipe.</p>
        </div>

        {!loading && (
          <div className="overview-header-meta">
            {periodDays > 1 && (
              <span className="overview-period-pill">
                <CalendarIcon />
                Últimos {periodDays} dias
              </span>
            )}
            <button
              type="button"
              className={`overview-refresh${refreshing ? ' spinning' : ''}`}
              onClick={() => loadOverview({ isRefresh: true })}
            >
              <RefreshIcon />
              Atualizado {formatRelativeTime(lastUpdated)}
            </button>
          </div>
        )}
      </div>

      {error && <p className="overview-error">{error}</p>}

      <div className="stats-grid">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div className="stat-card" key={stat.key} style={{ '--stagger-index': index }}>
              <div className="stat-card-top">
                <span className="stat-card-label">{stat.label}</span>
                <span className="stat-card-icon">
                  <Icon />
                </span>
              </div>

              <span className="stat-card-value">
                {loading || stat.value === undefined ? '—' : <CountUp value={stat.value} format={stat.format} />}
              </span>

              <div className="stat-card-footer">
                <span className="stat-card-hint">{loading ? 'Aguardando dados' : stat.hint}</span>
                {!loading && stat.sparkline && <Sparkline data={stat.sparkline} />}
                {!loading && stat.composition && <CompositionBar segments={stat.composition} />}
              </div>
            </div>
          )
        })}
      </div>

      <div className="overview-charts-grid">
        <section className="overview-section overview-panel">
          <div className="section-heading">
            <div className="section-heading-text">
              <h3 className="section-title">
                Pipeline de vendas
                <span className="section-title-hint" title="Distribuição dos leads cadastrados por estágio do funil">
                  i
                </span>
              </h3>
              <span className="section-caption">Distribuição dos leads por estágio</span>
            </div>
            {!loading && metrics && metrics.total > 0 && (
              <select
                className="stage-filter"
                value={activeStage}
                onChange={(event) => setActiveStage(event.target.value)}
                aria-label="Filtrar estágio do pipeline"
              >
                <option value="all">Todos os estágios</option>
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
          </div>
          {loading ? (
            <p className="overview-loading-text">Carregando pipeline…</p>
          ) : metrics && metrics.total > 0 ? (
            <PipelineChart
              statusCounts={metrics.statusCounts}
              total={metrics.total}
              activeStage={activeStage}
              onActiveStageChange={setActiveStage}
            />
          ) : (
            <EmptyState icon={<LeadsIcon />} title="Nenhum lead cadastrado" description="O pipeline aparecerá aqui assim que houver leads." />
          )}
        </section>

        <section className="overview-section overview-panel">
          <div className="section-heading">
            <div className="section-heading-text">
              <h3 className="section-title">Atividade recente</h3>
              <span className="section-caption">Últimas interações com seus leads</span>
            </div>
            <button type="button" className="section-link" onClick={() => onNavigate?.('activities')}>
              Ver todas
            </button>
          </div>
          {loading ? (
            <p className="overview-loading-text">Carregando atividades…</p>
          ) : recentActivities.length === 0 ? (
            <EmptyState
              icon={<TrayIcon />}
              title="Nenhuma atividade registrada ainda"
              description="Assim que você começar a interagir com seus leads, as atividades aparecerão aqui."
            />
          ) : (
            <ul className="activity-feed-list">
              {recentActivities.map((activity, index) => {
                const TypeIcon = activityTypeIcon(activity.type)
                return (
                  <li className="activity-row" key={activity.id} style={{ '--stagger-index': index }}>
                    <span className="activity-row-icon">
                      <TypeIcon />
                    </span>
                    <div className="activity-row-body">
                      <div className="activity-row-top">
                        <span className="activity-row-title">{activityActionLabel(activity.type)}</span>
                        <span className="activity-row-time">{formatRelativeTime(activity.created_at)}</span>
                      </div>
                      <span className="activity-row-meta">
                        {activity.leads?.name || 'Lead removido'}
                        {activity.leads?.company_name ? ` • ${activity.leads.company_name}` : ''}
                      </span>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>

      <div className="overview-charts-grid">
        <section className="overview-section overview-panel">
          <div className="section-heading">
            <div className="section-heading-text">
              <h3 className="section-title">Evolução de atividades</h3>
              <span className="section-caption">Volume de interações registradas por dia</span>
            </div>
          </div>
          {loading ? (
            <p className="overview-loading-text">Carregando evolução…</p>
          ) : activityRows && activityRows.length > 0 ? (
            <TimelineChart points={activitiesByDay} emptyHint="Sem atividades registradas ainda" />
          ) : (
            <EmptyState icon={<TrayIcon />} title="Nenhuma atividade ainda" description="A evolução aparecerá aqui assim que houver atividades registradas." />
          )}
        </section>

        <section className="overview-section overview-panel">
          <div className="section-heading">
            <div className="section-heading-text">
              <h3 className="section-title">Principais oportunidades</h3>
              <span className="section-caption">Maior valor estimado entre os leads em aberto</span>
            </div>
            <button type="button" className="section-link" onClick={() => onNavigate?.('leads')}>
              Ver todos
            </button>
          </div>
          {loading ? (
            <p className="overview-loading-text">Carregando oportunidades…</p>
          ) : topLeads.length === 0 ? (
            <EmptyState icon={<StarIcon />} title="Nenhuma oportunidade ainda" description="Os leads de maior valor aparecerão aqui." />
          ) : (
            <ul className="top-leads-list">
              {topLeads.map((lead, index) => (
                <li className="top-lead-item" key={lead.id} style={{ '--stagger-index': index }}>
                  <div className="top-lead-left">
                    <span className="top-lead-rank">{index + 1}</span>
                    <span className="top-lead-avatar" style={{ background: statusColorVar(lead.status) }}>
                      {initials(lead.name)}
                    </span>
                    <div className="top-lead-main">
                      <span className="top-lead-name">{lead.name}</span>
                      <span className="top-lead-company">{lead.company_name || 'Empresa não informada'}</span>
                    </div>
                  </div>
                  <div className="top-lead-meta">
                    <span className={`status-badge status-${lead.status}`}>{statusLabel(lead.status)}</span>
                    <span className="top-lead-value">{formatCurrency(lead.estimated_value)}</span>
                    <ChevronRightIcon className="top-lead-chevron" />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
