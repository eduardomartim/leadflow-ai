import { useId } from 'react'

/** Minimal area sparkline. Renders nothing when there isn't enough real data. */
export default function Sparkline({ data, color = 'var(--accent)', width = 240, height = 36 }) {
  const gradientId = useId()

  if (!data || data.length < 2) return null

  const max = Math.max(...data)
  const min = Math.min(...data, 0)
  const range = max - min || 1
  const stepX = width / (data.length - 1)

  const coords = data.map((value, index) => [
    index * stepX,
    height - ((value - min) / range) * (height - 4) - 2,
  ])

  const linePath = coords
    .map(([x, y], index) => `${index === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`)
    .join(' ')
  const areaPath = `${linePath} L${width},${height} L0,${height} Z`

  return (
    <svg
      className="sparkline"
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height={height}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path className="sparkline-area" d={areaPath} fill={`url(#${gradientId})`} />
      <path
        className="sparkline-line"
        d={linePath}
        stroke={color}
        vectorEffect="non-scaling-stroke"
        pathLength="1"
      />
    </svg>
  )
}
