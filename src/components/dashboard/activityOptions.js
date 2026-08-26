import {
  NoteIcon,
  CallIcon,
  EmailIcon,
  MeetingIcon,
  StatusChangeIcon,
  TaskIcon,
  OtherIcon,
} from './icons'

export const ACTIVITY_TYPE_OPTIONS = [
  { value: 'note', label: 'Nota', actionLabel: 'Nota registrada', icon: NoteIcon },
  { value: 'call', label: 'Ligação', actionLabel: 'Ligação realizada', icon: CallIcon },
  { value: 'email', label: 'E-mail', actionLabel: 'E-mail enviado', icon: EmailIcon },
  { value: 'meeting', label: 'Reunião', actionLabel: 'Reunião realizada', icon: MeetingIcon },
  {
    value: 'status_change',
    label: 'Mudança de status',
    actionLabel: 'Status atualizado',
    icon: StatusChangeIcon,
  },
  { value: 'task', label: 'Tarefa', actionLabel: 'Tarefa registrada', icon: TaskIcon },
  { value: 'other', label: 'Outro', actionLabel: 'Atividade registrada', icon: OtherIcon },
]

export function activityTypeLabel(value) {
  return ACTIVITY_TYPE_OPTIONS.find((option) => option.value === value)?.label || value
}

export function activityActionLabel(value) {
  return ACTIVITY_TYPE_OPTIONS.find((option) => option.value === value)?.actionLabel || 'Atividade registrada'
}

export function activityTypeIcon(value) {
  return ACTIVITY_TYPE_OPTIONS.find((option) => option.value === value)?.icon || OtherIcon
}

const MINUTE = 60 * 1000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

/** Coarse relative time ("2h atrás", "3 dias atrás") for compact feed rows. */
export function formatRelativeTime(value, now = Date.now()) {
  if (!value) return '—'
  const diff = now - new Date(value).getTime()
  if (diff < MINUTE) return 'agora'
  if (diff < HOUR) return `${Math.round(diff / MINUTE)}min atrás`
  if (diff < DAY) return `${Math.round(diff / HOUR)}h atrás`
  const days = Math.round(diff / DAY)
  return days === 1 ? '1 dia atrás' : `${days} dias atrás`
}

const TIME_FORMAT = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' })
const SHORT_DATE_FORMAT = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' })

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

/** "Hoje, 14:30" / "Ontem, 09:00" / "24 ago., 14:30" — friendlier than a raw timestamp. */
export function formatSmartDateTime(value, now = new Date()) {
  if (!value) return '—'
  const date = new Date(value)
  const time = TIME_FORMAT.format(date)

  if (isSameDay(date, now)) return `Hoje, ${time}`

  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (isSameDay(date, yesterday)) return `Ontem, ${time}`

  return `${SHORT_DATE_FORMAT.format(date)}, ${time}`
}
