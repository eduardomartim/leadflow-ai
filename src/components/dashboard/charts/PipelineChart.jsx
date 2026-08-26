import { useEffect, useState } from 'react'
import { STATUS_OPTIONS, statusColorVar } from '../leadOptions'
import { axisTicks, formatAxisValue } from '../overviewMetrics'

export default function PipelineChart({ statusCounts, total, activeStage, onActiveStageChange }) {
  const [grown, setGrown] = useState(false)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setGrown(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  const max = Math.max(...STATUS_OPTIONS.map((option) => statusCounts[option.value] || 0), 1)
  const ticks = axisTicks(max)
  const axisMax = ticks[0]

  return (
    <div className="pipeline-chart-area">
      <div className="chart-axis">
        {ticks.map((tick) => (
          <span key={tick} className="chart-axis-label">
            {formatAxisValue(tick)}
          </span>
        ))}
      </div>

      <div className="pipeline-chart" role="img" aria-label="Distribuição de leads por estágio do pipeline">
        <div className="chart-gridlines" aria-hidden="true">
          {ticks.map((tick) => (
            <span key={tick} className="chart-gridline" />
          ))}
        </div>

        {STATUS_OPTIONS.map((option, index) => {
          const count = statusCounts[option.value] || 0
          const share = total ? Math.round((count / total) * 100) : 0
          const dimmed = activeStage !== 'all' && activeStage !== option.value

          return (
            <button
              type="button"
              className={`pipeline-bar-col${dimmed ? ' dimmed' : ''}`}
              key={option.value}
              onClick={() => onActiveStageChange?.(activeStage === option.value ? 'all' : option.value)}
              aria-pressed={activeStage === option.value}
              title={`${option.label}: ${count} lead${count === 1 ? '' : 's'} (${share}%)`}
            >
              <span className="pipeline-bar-count">{count}</span>
              <div className="pipeline-bar-track">
                <div
                  className="pipeline-bar-fill"
                  style={{
                    height: `${(count / axisMax) * 100}%`,
                    background: statusColorVar(option.value),
                    transform: grown ? 'scaleY(1)' : 'scaleY(0)',
                    transitionDelay: `${index * 55}ms`,
                  }}
                />
              </div>
              <span className="pipeline-bar-label">{option.label}</span>
              <span className="pipeline-bar-share">{share}%</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
