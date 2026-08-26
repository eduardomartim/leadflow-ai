import { useEffect, useState } from 'react'

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  )
}

/**
 * Animates a numeric value from its previous value to the next one.
 * Non-numeric values pass through unchanged. Uses React's "adjust state
 * while rendering" pattern (not an Effect) to detect value changes, so the
 * animation only (re)starts when the incoming value actually changes —
 * never on an unrelated re-render — and the rAF loop itself is the only
 * thing that runs inside the Effect.
 */
export function useCountUp(value, { duration = 700 } = {}) {
  const isNumber = typeof value === 'number' && !Number.isNaN(value)
  const canAnimateEntrance = isNumber && !prefersReducedMotion()

  const [trackedValue, setTrackedValue] = useState(value)
  const [displayValue, setDisplayValue] = useState(() => (canAnimateEntrance ? 0 : value))
  const [animateFrom, setAnimateFrom] = useState(() => (canAnimateEntrance ? 0 : null))

  if (value !== trackedValue) {
    const canAnimateChange = isNumber && typeof trackedValue === 'number' && !prefersReducedMotion()
    setTrackedValue(value)
    if (canAnimateChange) {
      setAnimateFrom(trackedValue)
    } else {
      setAnimateFrom(null)
      setDisplayValue(value)
    }
  }

  useEffect(() => {
    if (animateFrom === null) return

    const from = animateFrom
    const to = value
    const start = performance.now()
    let frame

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayValue(progress < 1 ? from + (to - from) * eased : to)
      if (progress < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)

    // Browsers suspend rAF in backgrounded tabs, which would otherwise leave
    // the value stuck mid-animation. setTimeout keeps running (throttled but
    // not paused) there, so this guarantees the correct final value lands.
    const fallback = setTimeout(() => setDisplayValue(to), duration + 100)

    return () => {
      cancelAnimationFrame(frame)
      clearTimeout(fallback)
    }
  }, [animateFrom, value, duration])

  return displayValue
}

/** Renders a count-up number for a stat value, formatted with `format`. */
export function CountUp({ value, format }) {
  const animated = useCountUp(value)
  return format ? format(animated) : Math.round(animated)
}
