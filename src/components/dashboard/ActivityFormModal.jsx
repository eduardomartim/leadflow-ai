import { useEffect, useState } from 'react'
import { ACTIVITY_TYPE_OPTIONS } from './activityOptions'
import './Modal.css'
import './LeadFormModal.css'

export default function ActivityFormModal({ lockedLead, leadOptions, submitting, onSubmit, onClose }) {
  const [leadId, setLeadId] = useState(lockedLead ? lockedLead.id : '')
  const [type, setType] = useState('note')
  const [description, setDescription] = useState('')
  const [formError, setFormError] = useState('')

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

  function handleSubmit(event) {
    event.preventDefault()
    setFormError('')

    if (!leadId) {
      setFormError('Selecione o lead.')
      return
    }
    if (description.trim().length === 0) {
      setFormError('Descreva a atividade.')
      return
    }

    onSubmit({
      lead_id: leadId,
      type,
      description: description.trim(),
    })
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" onClick={handleOverlayClick}>
      <div className="modal-panel">
        <h2 className="modal-title">Nova atividade</h2>

        <form className="lead-form" onSubmit={handleSubmit}>
          <label className="lead-form-field">
            <span>Lead</span>
            {lockedLead ? (
              <input type="text" value={lockedLead.name} disabled />
            ) : (
              <select value={leadId} onChange={(event) => setLeadId(event.target.value)} required>
                <option value="" disabled>
                  Selecione um lead
                </option>
                {leadOptions.map((lead) => (
                  <option key={lead.id} value={lead.id}>
                    {lead.name}
                  </option>
                ))}
              </select>
            )}
          </label>

          <label className="lead-form-field">
            <span>Tipo</span>
            <select value={type} onChange={(event) => setType(event.target.value)}>
              {ACTIVITY_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="lead-form-field">
            <span>Descrição</span>
            <textarea
              rows={3}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="O que aconteceu?"
              required
            />
          </label>

          {formError && <p className="lead-form-error">{formError}</p>}

          <div className="modal-actions">
            <button type="button" className="modal-btn-secondary" onClick={onClose} disabled={submitting}>
              Cancelar
            </button>
            <button type="submit" className="modal-btn-primary" disabled={submitting}>
              {submitting ? 'Salvando…' : 'Registrar atividade'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
