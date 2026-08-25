import { useEffect, useState } from 'react'
import EmptyState from './EmptyState'
import LeadFormModal from './LeadFormModal'
import ConfirmDialog from './ConfirmDialog'
import ActivityFormModal from './ActivityFormModal'
import { useCompanyId } from '../../hooks/useCompanyId'
import { listLeads, createLead, updateLead, deleteLead } from '../../services/leadsService'
import { createActivity, listActivitiesForLead } from '../../services/activitiesService'
import { generateLeadInsight } from '../../services/aiScoringService'
import { sourceLabel, statusLabel, formatCurrency } from './leadOptions'
import { scoreTier } from './aiScoreOptions'
import { LeadsIcon } from './icons'
import './LeadsPage.css'

export default function LeadsPage() {
  const { companyId, loading: companyLoading, error: companyError } = useCompanyId()
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingLead, setEditingLead] = useState(null)
  const [deletingLead, setDeletingLead] = useState(null)
  const [loggingActivityFor, setLoggingActivityFor] = useState(null)
  const [activitySubmitting, setActivitySubmitting] = useState(false)
  const [analyzingLeadId, setAnalyzingLeadId] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  async function loadLeads() {
    setLoading(true)
    setError('')
    try {
      const data = await listLeads()
      setLeads(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
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

  function openCreateForm() {
    setEditingLead(null)
    setFormOpen(true)
  }

  function openEditForm(lead) {
    setEditingLead(lead)
    setFormOpen(true)
  }

  async function handleSubmit(values) {
    setSubmitting(true)
    setError('')
    try {
      if (editingLead) {
        const updated = await updateLead(editingLead.id, values)
        setLeads((prev) => prev.map((lead) => (lead.id === updated.id ? updated : lead)))
      } else {
        const created = await createLead(companyId, values)
        setLeads((prev) => [created, ...prev])
      }
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

  const canCreate = Boolean(companyId)
  const leadCountLabel = `${leads.length} lead${leads.length === 1 ? '' : 's'} cadastrado${leads.length === 1 ? '' : 's'}`

  return (
    <div className="leads-page">
      <div className="leads-page-header">
        <p className="leads-page-hint">
          {companyLoading
            ? 'Carregando informações da conta…'
            : companyError
              ? 'Não foi possível carregar as informações da sua conta.'
              : canCreate
                ? leadCountLabel
                : 'Sua conta ainda não está associada a uma empresa.'}
        </p>
        <button
          type="button"
          className="leads-new-btn"
          onClick={openCreateForm}
          disabled={!canCreate}
          title={canCreate ? undefined : 'Sua conta ainda não está associada a uma empresa'}
        >
          + Novo lead
        </button>
      </div>

      {error && <p className="leads-error">{error}</p>}

      {!companyLoading && (companyError || !canCreate) && (
        <EmptyState
          icon={<LeadsIcon />}
          title="Sua conta ainda não está vinculada a uma empresa"
          description="Peça a um administrador para configurar sua empresa antes de cadastrar leads."
        />
      )}

      {canCreate && loading && <p className="leads-loading">Carregando leads…</p>}

      {canCreate && !loading && leads.length === 0 && (
        <EmptyState
          icon={<LeadsIcon />}
          title="Nenhum lead cadastrado"
          description="Comece adicionando o primeiro lead da sua empresa."
        />
      )}

      {canCreate && !loading && leads.length > 0 && (
        <>
          <p className="leads-scroll-hint">Arraste para o lado para ver todas as colunas →</p>
          <div className="leads-table-wrapper">
          <table className="leads-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Empresa</th>
                <th>Contato</th>
                <th>Origem</th>
                <th>Status</th>
                <th>Valor estimado</th>
                <th>Score IA</th>
                <th aria-label="Ações" />
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id}>
                  <td>{lead.name}</td>
                  <td>{lead.company_name || '—'}</td>
                  <td>
                    <div className="leads-contact">
                      {lead.email && <span>{lead.email}</span>}
                      {lead.phone && <span>{lead.phone}</span>}
                      {!lead.email && !lead.phone && '—'}
                    </div>
                  </td>
                  <td>{sourceLabel(lead.source)}</td>
                  <td>
                    <span className={`status-badge status-${lead.status}`}>{statusLabel(lead.status)}</span>
                  </td>
                  <td>{formatCurrency(lead.estimated_value)}</td>
                  <td>
                    {lead.ai_score !== null && lead.ai_score !== undefined ? (
                      <span className={`score-badge ${scoreTier(lead.ai_score).className}`}>
                        {Math.round(Number(lead.ai_score))} · {scoreTier(lead.ai_score).label}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>
                    <div className="leads-actions">
                      <button
                        type="button"
                        onClick={() => handleAnalyzeLead(lead)}
                        disabled={analyzingLeadId === lead.id}
                      >
                        {analyzingLeadId === lead.id ? 'Analisando…' : 'Analisar'}
                      </button>
                      <button type="button" onClick={() => setLoggingActivityFor(lead)}>
                        Atividade
                      </button>
                      <button type="button" onClick={() => openEditForm(lead)}>
                        Editar
                      </button>
                      <button type="button" className="leads-delete-btn" onClick={() => setDeletingLead(lead)}>
                        Excluir
                      </button>
                    </div>
                  </td>
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
          leadOptions={[]}
          submitting={activitySubmitting}
          onSubmit={handleLogActivity}
          onClose={() => setLoggingActivityFor(null)}
        />
      )}
    </div>
  )
}
