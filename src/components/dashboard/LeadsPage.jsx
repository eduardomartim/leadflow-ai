import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import EmptyState from './EmptyState'
import LeadFormModal from './LeadFormModal'
import ConfirmDialog from './ConfirmDialog'
import ActivityFormModal from './ActivityFormModal'
import { useAuth } from '../../hooks/useAuth.js'
import { useCompanyId } from '../../hooks/useCompanyId'
import { listLeads, updateLead, deleteLead } from '../../services/leadsService'
import { createActivity, listActivitiesForLead } from '../../services/activitiesService'
import { generateLeadInsight } from '../../services/aiScoringService'
import {
  statusLabel,
  statusColorVar,
  formatCurrency,
  formatDate,
  computeLeadMetrics,
  STATUS_OPTIONS,
} from './leadOptions'
import { scoreTier } from './aiScoreOptions'
import { formatRelativeTime } from './activityOptions'
import { initials } from './overviewMetrics'
import { CountUp } from './useCountUp'
import {
  LeadsIcon,
  UserPlusIcon,
  TrendIcon,
  CurrencyIcon,
  StarIcon,
  SearchIcon,
  DotsIcon,
  PencilIcon,
  TrashIcon,
  SparkleIcon,
  ActivityIcon,
  RefreshIcon,
} from './icons'
import './LeadsPage.css'
import './OverviewPage.css'

const SCORE_FILTER_OPTIONS = [
  { value: 'all', label: 'Todos os scores' },
  { value: 'high', label: 'Alto potencial' },
  { value: 'medium', label: 'Potencial médio' },
  { value: 'low', label: 'Baixo potencial' },
  { value: 'none', label: 'Sem score' },
]

const SORT_OPTIONS = [
  { value: 'recent', label: 'Mais recentes' },
  { value: 'value_desc', label: 'Maior valor' },
  { value: 'value_asc', label: 'Menor valor' },
  { value: 'score_desc', label: 'Maior score' },
  { value: 'name_asc', label: 'Nome (A-Z)' },
]

const SKELETON_ROWS = 6

function matchesScoreFilter(lead, filter) {
  if (filter === 'all') return true
  if (filter === 'none') return lead.ai_score === null || lead.ai_score === undefined
  if (lead.ai_score === null || lead.ai_score === undefined) return false
  return scoreTier(lead.ai_score)?.className === `score-${filter}`
}

function ScoreIndicator({ score }) {
  if (score === null || score === undefined) {
    return <span className="score-indicator-empty">—</span>
  }
  const value = Math.round(Number(score))
  const tier = scoreTier(value)
  return (
    <div className="score-indicator" title={`${value} · ${tier.label}`}>
      <div className="score-indicator-track">
        <div className={`score-indicator-fill ${tier.className}`} style={{ width: `${value}%` }} />
      </div>
      <span className="score-indicator-value">{value}</span>
    </div>
  )
}

function LeadsTableSkeleton({ withActions }) {
  return (
    <div className="leads-table-wrapper">
      <table className="leads-table">
        <thead>
          <tr>
            <th>Lead</th>
            <th>Empresa</th>
            <th>Status</th>
            <th className="leads-th-right">Valor estimado</th>
            <th>Score IA</th>
            <th>Data</th>
            {withActions && <th aria-label="Ações" />}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: SKELETON_ROWS }).map((_, index) => (
            <tr key={index}>
              <td>
                <div className="leads-cell-lead">
                  <span className="skeleton-avatar" />
                  <div className="leads-cell-lead-text">
                    <span className="skeleton-bar" style={{ width: '120px' }} />
                    <span className="skeleton-bar skeleton-bar-sm" style={{ width: '150px' }} />
                  </div>
                </div>
              </td>
              <td>
                <span className="skeleton-bar" style={{ width: '100px' }} />
              </td>
              <td>
                <span className="skeleton-bar skeleton-pill" style={{ width: '80px' }} />
              </td>
              <td>
                <span className="skeleton-bar" style={{ width: '90px' }} />
              </td>
              <td>
                <span className="skeleton-bar" style={{ width: '70px' }} />
              </td>
              <td>
                <span className="skeleton-bar" style={{ width: '70px' }} />
              </td>
              {withActions && (
                <td>
                  <span className="skeleton-bar" style={{ width: '20px' }} />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function LeadsPage() {
  const { user } = useAuth()
  const isDemo = Boolean(user?.is_anonymous)
  const { companyId, loading: companyLoading, error: companyError } = useCompanyId()
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [lastUpdated, setLastUpdated] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editingLead, setEditingLead] = useState(null)
  const [deletingLead, setDeletingLead] = useState(null)
  const [loggingActivityFor, setLoggingActivityFor] = useState(null)
  const [activitySubmitting, setActivitySubmitting] = useState(false)
  const [analyzingLeadId, setAnalyzingLeadId] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [scoreFilter, setScoreFilter] = useState('all')
  const [sortBy, setSortBy] = useState('recent')
  const [openActionsId, setOpenActionsId] = useState(null)
  const [menuPosition, setMenuPosition] = useState(null)

  async function loadLeads({ isRefresh = false } = {}) {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    setError('')
    try {
      const data = await listLeads()
      setLeads(data)
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
      if (!cancelled) loadLeads()
    })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    function handleClickOutside(event) {
      if (!event.target.closest('.row-actions') && !event.target.closest('.row-actions-menu')) {
        setOpenActionsId(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (openActionsId === null) return undefined

    // The menu is positioned in fixed coordinates computed at open time, so any
    // scroll (including inside the horizontally-scrollable table) would leave it
    // floating over the wrong row — closing it is simpler and safer than re-tracking.
    function handleScroll() {
      setOpenActionsId(null)
    }
    window.addEventListener('scroll', handleScroll, true)
    return () => window.removeEventListener('scroll', handleScroll, true)
  }, [openActionsId])

  const metrics = useMemo(() => computeLeadMetrics(leads), [leads])

  const filteredLeads = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()

    const rows = leads.filter((lead) => {
      const matchesTerm =
        !term ||
        lead.name?.toLowerCase().includes(term) ||
        lead.company_name?.toLowerCase().includes(term) ||
        lead.email?.toLowerCase().includes(term)
      const matchesStatus = statusFilter === 'all' || lead.status === statusFilter
      return matchesTerm && matchesStatus && matchesScoreFilter(lead, scoreFilter)
    })

    const sorted = [...rows]
    if (sortBy === 'value_desc') sorted.sort((a, b) => (b.estimated_value || 0) - (a.estimated_value || 0))
    else if (sortBy === 'value_asc') sorted.sort((a, b) => (a.estimated_value || 0) - (b.estimated_value || 0))
    else if (sortBy === 'score_desc') sorted.sort((a, b) => (b.ai_score || 0) - (a.ai_score || 0))
    else if (sortBy === 'name_asc') sorted.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))

    return sorted
  }, [leads, searchTerm, statusFilter, scoreFilter, sortBy])

  function openEditForm(lead) {
    setOpenActionsId(null)
    setEditingLead(lead)
    setFormOpen(true)
  }

  async function handleSubmit(values) {
    if (!editingLead) return
    setSubmitting(true)
    setError('')
    try {
      const updated = await updateLead(editingLead.id, values)
      setLeads((prev) => prev.map((lead) => (lead.id === updated.id ? updated : lead)))
      setFormOpen(false)
      setEditingLead(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleLogActivity(values) {
    setActivitySubmitting(true)
    setError('')
    try {
      await createActivity(values)
      setLoggingActivityFor(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setActivitySubmitting(false)
    }
  }

  async function handleAnalyzeLead(lead) {
    setOpenActionsId(null)
    setAnalyzingLeadId(lead.id)
    setError('')
    try {
      const activities = await listActivitiesForLead(lead.id)
      const { score, summary } = await generateLeadInsight({ lead, activities })
      const updated = await updateLead(lead.id, { ai_score: score, ai_summary: summary })
      setLeads((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
    } catch (err) {
      setError(err.message)
    } finally {
      setAnalyzingLeadId(null)
    }
  }

  async function handleDelete() {
    if (!deletingLead) return
    setSubmitting(true)
    setError('')
    try {
      await deleteLead(deletingLead.id)
      setLeads((prev) => prev.filter((lead) => lead.id !== deletingLead.id))
      setDeletingLead(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  function clearFilters() {
    setSearchTerm('')
    setStatusFilter('all')
    setScoreFilter('all')
  }

  const canManage = !isDemo && Boolean(companyId)
  const showCompanyGate = !isDemo && !companyLoading && (companyError || !companyId)
  const hasAnyLeads = leads.length > 0
  const hasFilters = Boolean(searchTerm) || statusFilter !== 'all' || scoreFilter !== 'all'
  const showEmptyLeads = !loading && !hasAnyLeads && !showCompanyGate
  const showNoResults = !loading && hasAnyLeads && filteredLeads.length === 0 && !showCompanyGate
  const showTable = !loading && filteredLeads.length > 0 && !showCompanyGate
  const leadCountLabel = `${leads.length} lead${leads.length === 1 ? '' : 's'} cadastrado${leads.length === 1 ? '' : 's'}`

  const summaryStats = [
    { key: 'total', label: 'Total de leads', icon: LeadsIcon, value: metrics.total, format: (v) => Math.round(v) },
    { key: 'new', label: 'Novos', icon: UserPlusIcon, value: metrics.newCount, format: (v) => Math.round(v) },
    {
      key: 'negotiation',
      label: 'Em negociação',
      icon: TrendIcon,
      value: metrics.statusCounts.negotiation || 0,
      format: (v) => Math.round(v),
    },
    { key: 'won', label: 'Ganhos', icon: StarIcon, value: metrics.wonCount, format: (v) => Math.round(v) },
    {
      key: 'value',
      label: 'Valor estimado',
      icon: CurrencyIcon,
      value: metrics.estimatedValue,
      format: (v) => formatCurrency(v),
    },
  ]

  return (
    <div className="leads-page">
      <div className="overview-header leads-page-header">
        <div className="overview-header-text">
          <h2 className="overview-title">Leads</h2>
          <p className="overview-subtitle">
            {isDemo
              ? leadCountLabel
              : companyLoading
                ? 'Carregando informações da conta…'
                : companyError
                  ? 'Não foi possível carregar as informações da sua conta.'
                  : canManage
                    ? leadCountLabel
                    : 'Sua conta ainda não está associada a uma empresa.'}
          </p>
        </div>

        <div className="overview-header-meta">
          {!loading && hasAnyLeads && (
            <button
              type="button"
              className={`overview-refresh${refreshing ? ' spinning' : ''}`}
              onClick={() => loadLeads({ isRefresh: true })}
            >
              <RefreshIcon />
              Atualizado {formatRelativeTime(lastUpdated)}
            </button>
          )}
        </div>
      </div>

      {error && <p className="leads-error">{error}</p>}

      {!showCompanyGate && hasAnyLeads && (
        <div className="stats-grid leads-summary-grid">
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
                  <CountUp value={stat.value} format={stat.format} />
                </span>
              </div>
            )
          })}
        </div>
      )}

      {!showCompanyGate && hasAnyLeads && (
        <div className="leads-controls">
          <div className="leads-search">
            <SearchIcon />
            <input
              type="search"
              placeholder="Buscar por nome, empresa ou e-mail…"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <select className="stage-filter" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="all">Todos os estágios</option>
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select className="stage-filter" value={scoreFilter} onChange={(event) => setScoreFilter(event.target.value)}>
            {SCORE_FILTER_OPTIONS.map((option) => (
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

      {showCompanyGate && (
        <EmptyState
          icon={<LeadsIcon />}
          title="Sua conta ainda não está vinculada a uma empresa"
          description="Peça a um administrador para configurar sua empresa antes de cadastrar leads."
        />
      )}

      {!showCompanyGate && loading && <LeadsTableSkeleton withActions={!isDemo} />}

      {showEmptyLeads && (
        <EmptyState
          icon={<LeadsIcon />}
          title="Nenhum lead cadastrado"
          description="Os leads cadastrados pela sua equipe aparecerão aqui."
        />
      )}

      {showNoResults && (
        <EmptyState icon={<SearchIcon />} title="Nenhum resultado encontrado" description="Ajuste a busca ou os filtros para ver mais leads.">
          {hasFilters && (
            <button type="button" className="section-link" onClick={clearFilters}>
              Limpar filtros
            </button>
          )}
        </EmptyState>
      )}

      {showTable && (
        <>
          <p className="leads-scroll-hint">Arraste para o lado para ver todas as colunas →</p>
          <div className="leads-table-wrapper">
            <table className="leads-table">
              <thead>
                <tr>
                  <th>Lead</th>
                  <th>Empresa</th>
                  <th>Status</th>
                  <th className="leads-th-right">Valor estimado</th>
                  <th>Score IA</th>
                  <th>Data</th>
                  {!isDemo && <th aria-label="Ações" />}
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead, index) => (
                  <tr key={lead.id} style={{ '--stagger-index': index }}>
                    <td>
                      <div className="leads-cell-lead">
                        <span className="top-lead-avatar" style={{ background: statusColorVar(lead.status) }}>
                          {initials(lead.name)}
                        </span>
                        <div className="leads-cell-lead-text">
                          <span className="leads-cell-name">{lead.name}</span>
                          <span className="leads-cell-secondary">{lead.email || lead.phone || '—'}</span>
                        </div>
                      </div>
                    </td>
                    <td>{lead.company_name || '—'}</td>
                    <td>
                      <span className={`status-badge status-${lead.status}`}>{statusLabel(lead.status)}</span>
                    </td>
                    <td className={`leads-cell-value${(lead.estimated_value || 0) >= 30000 ? ' leads-value-high' : ''}`}>
                      {formatCurrency(lead.estimated_value)}
                    </td>
                    <td>
                      <ScoreIndicator score={lead.ai_score} />
                    </td>
                    <td className="leads-cell-date">{formatDate(lead.created_at)}</td>
                    {!isDemo && (
                      <td>
                        <div className="row-actions">
                          <button
                            type="button"
                            className="row-actions-trigger"
                            onClick={(event) => {
                              if (openActionsId === lead.id) {
                                setOpenActionsId(null)
                                return
                              }
                              const rect = event.currentTarget.getBoundingClientRect()
                              setMenuPosition({ top: rect.bottom + 4, right: window.innerWidth - rect.right })
                              setOpenActionsId(lead.id)
                            }}
                            aria-haspopup="true"
                            aria-expanded={openActionsId === lead.id}
                            aria-label="Ações do lead"
                          >
                            <DotsIcon />
                          </button>
                          {openActionsId === lead.id &&
                            menuPosition &&
                            createPortal(
                              <div
                                className="row-actions-menu"
                                role="menu"
                                style={{ top: menuPosition.top, right: menuPosition.right }}
                              >
                                <button
                                  type="button"
                                  role="menuitem"
                                  onClick={() => handleAnalyzeLead(lead)}
                                  disabled={analyzingLeadId === lead.id}
                                >
                                  <SparkleIcon />
                                  {analyzingLeadId === lead.id ? 'Analisando…' : 'Analisar'}
                                </button>
                                <button
                                  type="button"
                                  role="menuitem"
                                  onClick={() => {
                                    setOpenActionsId(null)
                                    setLoggingActivityFor(lead)
                                  }}
                                >
                                  <ActivityIcon />
                                  Atividade
                                </button>
                                <button type="button" role="menuitem" onClick={() => openEditForm(lead)}>
                                  <PencilIcon />
                                  Editar
                                </button>
                                <div className="row-actions-separator" />
                                <button
                                  type="button"
                                  role="menuitem"
                                  className="row-actions-danger"
                                  onClick={() => {
                                    setOpenActionsId(null)
                                    setDeletingLead(lead)
                                  }}
                                >
                                  <TrashIcon />
                                  Excluir
                                </button>
                              </div>,
                              document.body,
                            )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {formOpen && (
        <LeadFormModal
          initialLead={editingLead}
          submitting={submitting}
          onSubmit={handleSubmit}
          onClose={() => {
            setFormOpen(false)
            setEditingLead(null)
          }}
        />
      )}

      {deletingLead && (
        <ConfirmDialog
          title="Excluir lead"
          description={`Tem certeza que deseja excluir "${deletingLead.name}"? Essa ação não pode ser desfeita.`}
          confirmLabel="Excluir"
          submitting={submitting}
          onConfirm={handleDelete}
          onCancel={() => setDeletingLead(null)}
        />
      )}

      {loggingActivityFor && (
        <ActivityFormModal
          lockedLead={loggingActivityFor}
          submitting={activitySubmitting}
          onSubmit={handleLogActivity}
          onClose={() => setLoggingActivityFor(null)}
        />
      )}
    </div>
  )
}
