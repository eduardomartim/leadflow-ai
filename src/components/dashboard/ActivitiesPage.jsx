import { useEffect, useMemo, useState } from 'react'
import EmptyState from './EmptyState'
import { listActivities } from '../../services/activitiesService'
import { listLeads } from '../../services/leadsService'
import {
  ACTIVITY_TYPE_OPTIONS,
  activityTypeLabel,
  activityTypeIcon,
  formatSmartDateTime,
  formatRelativeTime,
} from './activityOptions'
import { statusColorVar } from './leadOptions'
import { initials } from './overviewMetrics'
import { CountUp } from './useCountUp'
import { ActivityIcon, LeadsIcon, SearchIcon, CallIcon, MeetingIcon, RefreshIcon } from './icons'
import './ActivitiesPage.css'
import './OverviewPage.css'
import './LeadsPage.css'

const PERIOD_OPTIONS = [
  { value: 'all', label: 'Todo o período' },
  { value: 'today', label: 'Hoje' },
  { value: '7d', label: 'Últimos 7 dias' },
  { value: '30d', label: 'Últimos 30 dias' },
]

const SORT_OPTIONS = [
  { value: 'recent', label: 'Mais recentes' },
  { value: 'oldest', label: 'Mais antigas' },
]

const SKELETON_ROWS = 5

function isToday(value) {
  const date = new Date(value)
  const now = new Date()
  return (
    date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate()
  )
}

function matchesPeriod(value, period) {
  if (period === 'all') return true
  if (period === 'today') return isToday(value)
  const diffDays = (Date.now() - new Date(value).getTime()) / (24 * 60 * 60 * 1000)
  if (period === '7d') return diffDays <= 7
  if (period === '30d') return diffDays <= 30
  return true
}

function MetricsSkeleton() {
  return (
    <div className="stats-grid activities-summary-grid">
      {Array.from({ length: 4 }).map((_, index) => (
        <div className="stat-card" key={index}>
          <div className="stat-card-top">
            <span className="skeleton-bar" style={{ width: '80px' }} />
            <span className="skeleton-avatar" style={{ width: '34px', height: '34px', borderRadius: '9px' }} />
          </div>
          <span className="skeleton-bar" style={{ width: '48px', height: '22px' }} />
        </div>
      ))}
    </div>
  )
}

function ControlsSkeleton() {
  return (
    <div className="leads-controls">
      <div className="leads-search">
        <SearchIcon />
        <span className="skeleton-bar" style={{ width: '160px' }} />
      </div>
      <span className="skeleton-bar skeleton-pill" style={{ width: '130px' }} />
      <span className="skeleton-bar skeleton-pill" style={{ width: '130px' }} />
      <span className="skeleton-bar skeleton-pill" style={{ width: '110px' }} />
    </div>
  )
}

function ListSkeleton() {
  return (
    <ul className="activities-feed">
      {Array.from({ length: SKELETON_ROWS }).map((_, index) => (
        <li className="activity-item" key={index}>
          <span className="skeleton-avatar" style={{ width: '30px', height: '30px', borderRadius: '8px' }} />
          <div className="activity-item-body">
            <div className="activity-item-top">
              <span className="skeleton-bar" style={{ width: '140px' }} />
              <span className="skeleton-bar" style={{ width: '60px' }} />
            </div>
            <span className="skeleton-bar skeleton-bar-sm" style={{ width: '100px' }} />
            <span className="skeleton-bar skeleton-bar-sm" style={{ width: '85%' }} />
          </div>
        </li>
      ))}
    </ul>
  )
}

export default function ActivitiesPage() {
  const [activities, setActivities] = useState([])
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [lastUpdated, setLastUpdated] = useState(null)

  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [leadFilter, setLeadFilter] = useState('all')
  const [periodFilter, setPeriodFilter] = useState('all')
  const [sortBy, setSortBy] = useState('recent')

  async function loadData({ isRefresh = false } = {}) {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    setError('')
    try {
      const [activityRows, leadRows] = await Promise.all([listActivities(), listLeads()])
      setActivities(activityRows)
      setLeads(leadRows)
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
      if (!cancelled) loadData()
    })

    return () => {
      cancelled = true
    }
  }, [])

  const summary = useMemo(() => {
    const total = activities.length
    const todayCount = activities.filter((activity) => isToday(activity.created_at)).length
    const callCount = activities.filter((activity) => activity.type === 'call').length
    const meetingCount = activities.filter((activity) => activity.type === 'meeting').length
    return { total, todayCount, callCount, meetingCount }
  }, [activities])

  const leadFilterOptions = useMemo(() => {
    const map = new Map()
    activities.forEach((activity) => {
      if (activity.lead_id && activity.leads?.name && !map.has(activity.lead_id)) {
        map.set(activity.lead_id, activity.leads.name)
      }
    })
    return [...map.entries()]
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'))
  }, [activities])

  const filteredActivities = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()

    const rows = activities.filter((activity) => {
      const matchesTerm =
        !term ||
        activity.description?.toLowerCase().includes(term) ||
        activity.leads?.name?.toLowerCase().includes(term) ||
        activity.leads?.company_name?.toLowerCase().includes(term)
      const matchesType = typeFilter === 'all' || activity.type === typeFilter
      const matchesLead = leadFilter === 'all' || activity.lead_id === leadFilter
      return matchesTerm && matchesType && matchesLead && matchesPeriod(activity.created_at, periodFilter)
    })

    const sorted = [...rows]
    if (sortBy === 'oldest') {
      sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    }
    return sorted
  }, [activities, searchTerm, typeFilter, leadFilter, periodFilter, sortBy])

  function clearFilters() {
    setSearchTerm('')
    setTypeFilter('all')
    setLeadFilter('all')
    setPeriodFilter('all')
  }

  const hasLeads = leads.length > 0
  const hasAnyActivities = activities.length > 0
  const hasFilters = Boolean(searchTerm) || typeFilter !== 'all' || leadFilter !== 'all' || periodFilter !== 'all'
  const showNoLeads = !loading && !hasLeads
  const showEmptyActivities = !loading && hasLeads && !hasAnyActivities
  const showNoResults = !loading && hasAnyActivities && filteredActivities.length === 0
  const showList = !loading && filteredActivities.length > 0
  const showFatalError = !loading && Boolean(error) && !hasAnyActivities && !showNoLeads
  const activityCountLabel = `${activities.length} atividade${activities.length === 1 ? '' : 's'} registrada${activities.length === 1 ? '' : 's'}`

  const summaryStats = [
    { key: 'total', label: 'Total', icon: ActivityIcon, value: summary.total },
    { key: 'today', label: 'Hoje', icon: RefreshIcon, value: summary.todayCount },
    { key: 'calls', label: 'Ligações', icon: CallIcon, value: summary.callCount },
    { key: 'meetings', label: 'Reuniões', icon: MeetingIcon, value: summary.meetingCount },
  ]

  return (
    <div className="activities-page">
      <div className="overview-header activities-page-header">
        <div className="overview-header-text">
          <h2 className="overview-title">Atividades</h2>
          {loading ? (
            <span className="skeleton-bar" style={{ width: '180px' }} />
          ) : (
            <p className="overview-subtitle">
              {hasLeads ? activityCountLabel : 'Nenhum lead disponível para registrar atividades.'}
            </p>
          )}
        </div>

        <div className="overview-header-meta">
          {!loading && hasAnyActivities && (
            <button
              type="button"
              className={`overview-refresh${refreshing ? ' spinning' : ''}`}
              onClick={() => loadData({ isRefresh: true })}
            >
              <RefreshIcon />
              Atualizado {formatRelativeTime(lastUpdated)}
            </button>
          )}
        </div>
      </div>

      {error && hasAnyActivities && <p className="activities-error">{error}</p>}

      {loading && (
        <>
          <MetricsSkeleton />
          <ControlsSkeleton />
          <ListSkeleton />
        </>
      )}

      {showFatalError && (
        <EmptyState icon={<ActivityIcon />} title="Não foi possível carregar as atividades" description={error}>
          <button type="button" className="section-link" onClick={() => loadData()}>
            Tentar novamente
          </button>
        </EmptyState>
      )}

      {showNoLeads && (
        <EmptyState
          icon={<LeadsIcon />}
          title="Nenhum lead cadastrado ainda"
          description="Quando houver leads cadastrados, as atividades relacionadas a eles aparecerão aqui."
        />
      )}

      {showEmptyActivities && (
        <EmptyState
          icon={<ActivityIcon />}
          title="Nenhuma atividade registrada"
          description="Quando houver interações com seus leads, elas aparecerão aqui."
        />
      )}

      {!loading && hasAnyActivities && !showFatalError && (
        <div className="stats-grid activities-summary-grid">
          {summaryStats.map((stat, index) => {
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
                  <CountUp value={stat.value} format={(v) => Math.round(v)} />
                </span>
              </div>
            )
          })}
        </div>
      )}

      {!loading && hasAnyActivities && !showFatalError && (
        <div className="leads-controls">
          <div className="leads-search">
            <SearchIcon />
            <input
              type="search"
              placeholder="Buscar por descrição ou lead…"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <select className="stage-filter" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
            <option value="all">Todos os tipos</option>
            {ACTIVITY_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select className="stage-filter" value={leadFilter} onChange={(event) => setLeadFilter(event.target.value)}>
            <option value="all">Todos os leads</option>
            {leadFilterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select className="stage-filter" value={periodFilter} onChange={(event) => setPeriodFilter(event.target.value)}>
            {PERIOD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select className="stage-filter" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {showNoResults && (
        <EmptyState
          icon={<SearchIcon />}
          title="Nenhuma atividade corresponde aos filtros selecionados"
          description="Ajuste a busca ou os filtros para ver mais atividades."
        >
          {hasFilters && (
            <button type="button" className="section-link" onClick={clearFilters}>
              Limpar filtros
            </button>
          )}
        </EmptyState>
      )}

      {showList && (
        <ul className="activities-feed">
          {filteredActivities.map((activity, index) => {
            const TypeIcon = activityTypeIcon(activity.type)
            return (
              <li className="activity-item" key={activity.id} style={{ '--stagger-index': index }}>
                <span className="activity-row-icon">
                  <TypeIcon />
                </span>
                <div className="activity-item-body">
                  <div className="activity-item-top">
                    <div className="activity-item-lead">
                      <span
                        className="top-lead-avatar"
                        style={{ background: activity.leads?.status ? statusColorVar(activity.leads.status) : 'var(--accent)' }}
                      >
                        {initials(activity.leads?.name)}
                      </span>
                      <div className="activity-item-lead-text">
                        <span className="activity-lead-name">{activity.leads?.name || 'Lead removido'}</span>
                        {activity.leads?.company_name && (
                          <span className="activity-item-company">{activity.leads.company_name}</span>
                        )}
                      </div>
                    </div>
                    <span className="activity-date">{formatSmartDateTime(activity.created_at)}</span>
                  </div>
                  <span className="activity-type-badge">{activityTypeLabel(activity.type)}</span>
                  <p className="activity-description">{activity.description}</p>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
