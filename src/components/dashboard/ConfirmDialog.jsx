import { useEffect } from 'react'
import './Modal.css'

export default function ConfirmDialog({ title, description, confirmLabel, submitting, onConfirm, onCancel }) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape' && !submitting) onCancel()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [submitting, onCancel])

  function handleOverlayClick(event) {
    if (event.target === event.currentTarget && !submitting) onCancel()
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" onClick={handleOverlayClick}>
      <div className="modal-panel">
        <h2 className="modal-title">{title}</h2>
        <p className="confirm-dialog-description">{description}</p>
        <div className="modal-actions">
          <button type="button" className="modal-btn-secondary" onClick={onCancel} disabled={submitting}>
            Cancelar
          </button>
          <button type="button" className="modal-btn-danger" onClick={onConfirm} disabled={submitting}>
            {submitting ? 'Excluindo…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
