const DAY_LABEL_FORMAT = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' })

function dayKey(value) {
  return value ? value.slice(0, 10) : null
}

/**
 * Groups rows by calendar day (UTC date part of an ISO timestamp) and fills
 * every day between the earliest and latest occurrence with 0, so the
 * resulting series is a continuous timeline instead of only the days that
 * happened to have data.
 */
export function groupByDay(rows, dateField, valueFn = () => 1) {
  const sums = new Map()

  rows.forEach((row) => {
    const key = dayKey(row[dateField])
    if (!key) return
    sums.set(key, (sums.get(key) || 0) + valueFn(row))
  })

  const days = [...sums.keys()].sort()
  if (days.length === 0) return []

  const points = []
  const cursor = new Date(`${days[0]}T00:00:00Z`)
  const end = new Date(`${days[days.length - 1]}T00:00:00Z`)

  while (cursor <= end) {
    const key = cursor.toISOString().slice(0, 10)
    points.push({
      key,
      label: DAY_LABEL_FORMAT.format(cursor),
      value: sums.get(key) || 0,
    })
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }

  return points
}

/** Running total across an ordered series of { value } points. */
export function cumulativeValues(points) {
  let sum = 0
  return points.map((point) => {
    sum += point.value
    return sum
  })
}

/** Evenly spaced Y-axis ticks from 0 up to a bit above the real max, highest first. */
export function axisTicks(max, count = 5) {
  const top = max > 0 ? max * 1.25 : 1
  return Array.from({ length: count + 1 }, (_, i) => (top / count) * (count - i))
}

export function formatAxisValue(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

export function initials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] || ''
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + last).toUpperCase()
}

/** Highest-value leads still open in the pipeline (excludes won/lost — those are already closed). */
export function topLeadsByValue(rows, limit = 4) {
  return [...rows]
    .filter((row) => row.estimated_value && row.status !== 'won' && row.status !== 'lost')
    .sort((a, b) => (b.estimated_value || 0) - (a.estimated_value || 0))
    .slice(0, limit)
}
