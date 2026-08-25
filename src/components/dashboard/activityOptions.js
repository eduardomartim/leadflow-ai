export const ACTIVITY_TYPE_OPTIONS = [
  { value: 'note', label: 'Nota' },
  { value: 'call', label: 'Ligação' },
  { value: 'email', label: 'E-mail' },
  { value: 'meeting', label: 'Reunião' },
  { value: 'status_change', label: 'Mudança de status' },
  { value: 'task', label: 'Tarefa' },
  { value: 'other', label: 'Outro' },
]

export function activityTypeLabel(value) {
  return ACTIVITY_TYPE_OPTIONS.find((option) => option.value === value)?.label || value
}

export function formatDateTime(value) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}
