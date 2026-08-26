import { useEffect, useState } from 'react'
import { axisTicks, formatAxisValue } from '../overviewMetrics'

const MAX_LABELS = 6

export default function TimelineChart({ points, emptyHint }) {
  const [grown, setGrown] = useState(false)
  const [hoverIndex, setHoverIndex] = useState(null)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setGrown(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  if (!points || points.length < 2) {
    const single = points?.[0]
    return (
      <div className="timeline-empty">
        <span className="timeline-empty-value">{single?.value ?? 0}</span>
        <span className="timeline-empty-label">
          {single ? `Todo o volume registrado em ${single.label}` : emptyHint}
        </span>
      </div>
    )
  }

  const max = Math.max(...points.map((point) => point.value), 1)
  const ticks = axisTicks(max)
  const axisMax = ticks[0]
  const labelStep = Math.max(1, Math.ceil(points.length / MAX_LABELS))
  const hovered = hoverIndex !== null ? points[hoverIndex] : null

  return (
    <div className="timeline-chart-area">
      <div className="chart-axis">
        {ticks.map((tick) => (
          <span key={tick} className="chart-axis-label">
            {formatAxisValue(tick)}
          </span>
        ))}
      </div>

      <div className="timeline-chart-wrapper">
        <div className="timeline-bars-container">
          <div className="chart-gridlines" aria-hidden="true">
            {ticks.map((tick) => (
              <span key={tick} className="chart-gridline" />
            ))}
          </div>

          {hovered && (
            <div className="timeline-tooltip" style={{ left: `${((hoverIndex + 0.5) / points.length) * 100}%` }}>
              <span className="timeline-tooltip-date">{hovered.label}</span>
              <span className="timeline-tooltip-value">Interações: {hovered.value}</span>
            </div>
          )}

          <div className="timeline-bars" role="img" aria-label="Evolução de atividades por dia">
            {points.map((point, index) => (
              <div
                className={`timeline-bar-col${hoverIndex === index ? ' hovered' : ''}`}
                key={point.key}
                onMouseEnter={() => setHoverIndex(index)}
                onMouseLeave={() => setHoverIndex(null)}
              >
                <div className="timeline-bar-track">
                  <div
                    className="timeline-bar-fill"
                    style={{
                      height: `${(point.value / axisMax) * 100}%`,
                      transform: grown ? 'scaleY(1)' : 'scaleY(0)',
                      transitionDelay: `${index * 18}ms`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="timeline-chart-labels">
          {points.map((point, index) => (
            <span key={point.key} className="timeline-chart-label">
              {index % labelStep === 0 || index === points.length - 1 ? point.label : ''}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
