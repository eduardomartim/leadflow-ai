export const SOURCE_OPTIONS = [
  { value: 'website', label: 'Site' },
  { value: 'referral', label: 'Indicação' },
  { value: 'cold_call', label: 'Ligação fria' },
  { value: 'social_media', label: 'Redes sociais' },
  { value: 'email_campaign', label: 'Campanha de e-mail' },
  { value: 'event', label: 'Evento' },
  { value: 'other', label: 'Outro' },
]

export const STATUS_OPTIONS = [
  { value: 'new', label: 'Novo' },
  { value: 'contacted', label: 'Contatado' },
  { value: 'qualified', label: 'Qualificado' },
  { value: 'proposal', label: 'Proposta' },
  { value: 'negotiation', label: 'Negociação' },
  { value: 'won', label: 'Ganho' },
  { value: 'lost', label: 'Perdido' },
]

export function sourceLabel(value) {
  return SOURCE_OPTIONS.find((option) => option.value === value)?.label || value
}

export function statusLabel(value) {
  return STATUS_OPTIONS.find((option) => option.value === value)?.label || value
}

export function formatCurrency(value) {
  if (value === null || value === undefined || value === '') return '—'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function computeLeadMetrics(rows) {
  const total = rows.length
  const newCount = rows.filter((row) => row.status === 'new').length
  const wonCount = rows.filter((row) => row.status === 'won').length
  const estimatedValue = rows.reduce((sum, row) => sum + (row.estimated_value || 0), 0)
  const conversionRate = total === 0 ? null : (wonCount / total) * 100

  return { total, newCount, estimatedValue, conversionRate }
}
