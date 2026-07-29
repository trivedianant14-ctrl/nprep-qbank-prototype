import { useEffect, useRef, useState } from 'react'

// Respect the OS setting — every animation below collapses to its end state
// when the student has asked for reduced motion.
export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// Ease-out-cubic: fast off the mark, settling gently. Reads as "the number is
// landing on a result" rather than a linear tick-up.
const easeOut = (t) => 1 - Math.pow(1 - t, 3)

// Counts from 0 to `target` over `duration`, in step with a ring or bar
// animating alongside it.
export function useCountUp(target, duration = 1100) {
  const [value, setValue] = useState(() => (prefersReducedMotion() ? target : 0))
  const raf = useRef(0)

  useEffect(() => {
    if (prefersReducedMotion()) { setValue(target); return }
    const start = performance.now()
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      setValue(Math.round(easeOut(t) * target))
      if (t < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [target, duration])

  return value
}

// Flips to true one frame after mount, so a CSS transition has a "from" state
// to animate out of. Used for stroke-dasharray on rings and donuts.
export function useMounted(delay = 60) {
  const [on, setOn] = useState(() => prefersReducedMotion())
  useEffect(() => {
    if (prefersReducedMotion()) { setOn(true); return }
    const t = setTimeout(() => setOn(true), delay)
    return () => clearTimeout(t)
  }, [delay])
  return on
}
