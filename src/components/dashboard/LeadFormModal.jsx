import { useEffect, useState } from 'react'
import { SOURCE_OPTIONS, STATUS_OPTIONS } from './leadOptions'
import { scoreTier } from './aiScoreOptions'
import './Modal.css'
import './LeadFormModal.css'
import './LeadsPage.css'

const EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  company_name: '',
  source: 'other',
  status: 'new',
  estimated_value: '',
  notes: '',
}

function toFormValues(lead) {
  if (!lead) return EMPTY_FORM
  return {
    name: lead.name || '',
    email: lead.email || '',
    phone: lead.phone || '',
    company_name: lead.company_name || '',
    source: lead.source || 'other',
    status: lead.status || 'new',
    estimated_value: lead.estimated_value ?? '',
    notes: lead.notes || '',
  }
}

export default function LeadFormModal({ initialLead, submitting, onSubmit, onClose }) {
  const [values, setValues] = useState(() => toFormValues(initialLead))
  const [formError, setFormError] = useState('')

  const isEditing = Boolean(initialLead)

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape' && !submitting) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [submitting, onClose])

  function handleOverlayClick(event) {
    if (event.target === event.currentTarget && !submitting) onClose()
  }

  function handleChange(field) {
    return (event) => setValues((prev) => ({ ...prev, [field]: event.target.value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    setFormError('')

    if (values.name.trim().length === 0) {
      setFormError('Informe o nome do lead.')
      return
    }

    onSubmit({
      name: values.name.trim(),
      email: values.email.trim() || null,
      phone: values.phone.trim() || null,
      company_name: values.company_name.trim() || null,
      source: values.source,
      status: values.status,
      estimated_value: values.estimated_value === '' ? null : Number(values.estimated_value),
      notes: values.notes.trim() || null,
    })
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" onClick={handleOverlayClick}>
      <div className="modal-panel">
        <h2 className="modal-title">{isEditing ? 'Editar lead' : 'Novo lead'}</h2>

        <form className="lead-form" onSubmit={handleSubmit}>
          <label className="lead-form-field">
            <span>Nome *</span>
            <input type="text" value={values.name} onChange={handleChange('name')} required />
          </label>

          <div className="lead-form-row">
            <label className="lead-form-field">
              <span>E-mail</span>
              <input type="email" value={values.email} onChange={handleChange('email')} />
            </label>
            <label className="lead-form-field">
              <span>Telefone</span>
              <input type="text" value={values.phone} onChange={handleChange('phone')} />
            </label>
          </div>

          <label className="lead-form-field">
            <span>Empresa</span>
            <input type="text" value={values.company_name} onChange={handleChange('company_name')} />
          </label>

          <div className="lead-form-row">
            <label className="lead-form-field">
              <span>Origem</span>
              <select value={values.source} onChange={handleChange('source')}>
                {SOURCE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="lead-form-field">
              <span>Status</span>
              <select value={values.status} onChange={handleChange('status')}>
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="lead-form-field">
            <span>Valor estimado (R$)</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={values.estimated_value}
              onChange={handleChange('estimated_value')}
            />
          </label>

          <label className="lead-form-field">
            <span>Notas</span>
            <textarea rows={3} value={values.notes} onChange={handleChange('notes')} />
          </label>

          {isEditing && initialLead?.ai_score !== null && initialLead?.ai_score !== undefined && (
            <div className="lead-ai-analysis">
              <span className="lead-ai-analysis-title">Análise por IA (demonstração)</span>
              <span className={`score-badge ${scoreTier(initialLead.ai_score).className}`}>
                {Math.round(Number(initialLead.ai_score))} · {scoreTier(initialLead.ai_score).label}
              </span>
              <p className="lead-ai-analysis-summary">{initialLead.ai_summary}</p>
            </div>
          )}

          {formError && <p className="lead-form-error">{formError}</p>}

          <div className="modal-actions">
            <button type="button" className="modal-btn-secondary" onClick={onClose} disabled={submitting}>
              Cancelar
            </button>
            <button type="submit" className="modal-btn-primary" disabled={submitting}>
              {submitting ? 'Salvando…' : isEditing ? 'Salvar alterações' : 'Criar lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
