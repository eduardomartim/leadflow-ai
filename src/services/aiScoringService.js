import { statusLabel, sourceLabel, formatCurrency } from '../components/dashboard/leadOptions'

const STATUS_BASE_SCORE = {
  new: 20,
  contacted: 35,
  qualified: 55,
  proposal: 70,
  negotiation: 80,
  won: 100,
  lost: 0,
}

function simulateLatency(ms = 600) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function daysSince(dateString) {
  return (Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60 * 24)
}

function mostRecentActivity(activities) {
  return activities.reduce(
    (latest, activity) =>
      !latest || new Date(activity.created_at) > new Date(latest.created_at) ? activity : latest,
    null,
  )
}

function computeHeuristicScore(lead, activities) {
  let score = STATUS_BASE_SCORE[lead.status] ?? 20

  score += Math.min(activities.length * 4, 20)

  const recent = mostRecentActivity(activities)
  score += recent ? (daysSince(recent.created_at) <= 7 ? 10 : 0) : -5

  if ((lead.estimated_value || 0) >= 5000) {
    score += 5
  }

  return Math.max(0, Math.min(100, Math.round(score)))
}

function buildSummary(lead, activities, score) {
  const stageText = `Lead em estágio de ${statusLabel(lead.status)}`

  const recent = mostRecentActivity(activities)
  const activityText = recent
    ? (() => {
        const days = Math.round(daysSince(recent.created_at))
        const recency = days <= 0 ? 'hoje' : days === 1 ? 'há 1 dia' : `há ${days} dias`
        const count = activities.length
        return `com ${count} atividade${count === 1 ? '' : 's'} registrada${count === 1 ? '' : 's'} (mais recente ${recency})`
      })()
    : 'ainda sem nenhuma atividade registrada'

  const valueText = lead.estimated_value
    ? `valor estimado de ${formatCurrency(lead.estimated_value)}`
    : 'sem valor estimado informado'

  const priority = score >= 70 ? 'alta' : score >= 40 ? 'média' : 'baixa'

  return `${stageText}, ${activityText}. Origem: ${sourceLabel(lead.source)} — ${valueText}, sugerindo prioridade ${priority}.`
}

/**
 * Simulação local de "AI scoring" — sem chamada a nenhum provedor externo.
 * Hoje: heurística determinística sobre os dados reais do lead/atividades.
 * Amanhã: trocar o corpo desta função por uma chamada a uma Edge Function
 * que consulta um LLM real (ex.: supabase.functions.invoke('score-lead', ...)),
 * mantendo a mesma assinatura { lead, activities } -> { score, summary }.
 */
export async function generateLeadInsight({ lead, activities }) {
  await simulateLatency()
  const score = computeHeuristicScore(lead, activities)
  const summary = buildSummary(lead, activities, score)
  return { score, summary }
}
