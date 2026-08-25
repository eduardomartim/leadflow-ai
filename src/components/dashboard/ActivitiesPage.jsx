import { useEffect, useState } from 'react'
import EmptyState from './EmptyState'
import ActivityFormModal from './ActivityFormModal'
import { listActivities, createActivity } from '../../services/activitiesService'
import { listLeads } from '../../services/leadsService'
import { activityTypeLabel, formatDateTime } from './activityOptions'
import { ActivityIcon, LeadsIcon } from './icons'
import './ActivitiesPage.css'

export default function ActivitiesPage() {
  const [activities, setActivities] = useState([])
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function loadData() {
    setLoading(true)
    setError('')
    try {
      const [activityRows, leadRows] = await Promise.all([listActivities(), listLeads()])
      setActivities(activityRows)
      setLeads(leadRows)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
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

  async function handleSubmit(values) {
    setSubmitting(true)
    setError('')
    try {
      const created = await createActivity(values)
      setActivities((prev) => [created, ...prev])
      setFormOpen(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const canCreate = leads.length > 0
  const activityCountLabel = `${activities.length} atividade${activities.length === 1 ? '' : 's'} registrada${activities.length === 1 ? '' : 's'}`

  return (
    <div className="activities-page">
      <div className="activities-page-header">
        <p className="activities-page-hint">
          {loading ? 'Carregando atividades…' : canCreate ? activityCountLabel : 'Cadastre um lead para começar a registrar atividades.'}
        </p>
        <button
          type="button"
          className="activities-new-btn"
          onClick={() => setFormOpen(true)}
          disabled={!canCreate}
          title={canCreate ? undefined : 'Cadastre um lead antes de registrar atividades'}
        >
          + Nova atividade
        </button>
      </div>

      {error && <p className="activities-error">{error}</p>}

      {!loading && !canCreate && (
        <EmptyState
          icon={<LeadsIcon />}
          title="Nenhum lead cadastrado ainda"
          description="Cadastre um lead na página Leads para poder registrar atividades."
        />
      )}

      {!loading && canCreate && activities.length === 0 && (
        <EmptyState
          icon={<ActivityIcon />}
          title="Nenhuma atividade registrada"
          description="Registre a primeira interação com um dos seus leads."
        />
      )}

      {!loading && activities.length > 0 && (
        <ul className="activities-feed">
          {activities.map((activity) => (
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

      {formOpen && (
        <ActivityFormModal
          leadOptions={leads}
          submitting={submitting}
          onSubmit={handleSubmit}
          onClose={() => setFormOpen(false)}
        />
      )}
    </div>
  )
}
