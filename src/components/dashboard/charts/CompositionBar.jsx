/** Discrete composition indicator (e.g. won / in progress / lost share) — not a fabricated time series. */
export default function CompositionBar({ segments }) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0)
  if (total === 0) return null

  return (
    <div className="composition-bar" role="img" aria-label="Distribuição de leads por resultado">
      {segments
        .filter((segment) => segment.value > 0)
        .map((segment) => (
          <span
            key={segment.key}
            className="composition-bar-segment"
            style={{ width: `${(segment.value / total) * 100}%`, background: segment.color }}
            title={`${segment.label}: ${segment.value}`}
          />
        ))}
    </div>
  )
}
