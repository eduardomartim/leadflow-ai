export function scoreTier(score) {
  const value = Number(score)
  if (score === null || score === undefined || Number.isNaN(value)) return null
  if (value >= 70) return { label: 'Alto potencial', className: 'score-high' }
  if (value >= 40) return { label: 'Potencial médio', className: 'score-medium' }
  return { label: 'Baixo potencial', className: 'score-low' }
}
