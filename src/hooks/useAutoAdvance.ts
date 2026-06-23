import { useCallback, useEffect, useRef, useState } from 'react'

// Fires `onAdvance` every `intervalMs` while `enabled`. Bumping `restartToken`
// restarts the timer from zero. Disabling and re-enabling also restarts it.
export function useAutoAdvance(
  onAdvance: () => void,
  restartToken: number,
  enabled = true,
  intervalMs = 3000,
) {
  // Keep the latest callback without re-subscribing the interval every render.
  const cb = useRef(onAdvance)
  cb.current = onAdvance

  useEffect(() => {
    if (!enabled) return
    const id = setInterval(() => cb.current(), intervalMs)
    return () => clearInterval(id)
  }, [restartToken, enabled, intervalMs])
}

// Pause-on-interaction. Call `notify()` whenever the user interacts; `paused`
// flips true and stays true until `ms` elapse with no further interaction, then
// flips back to false so the auto-animation resumes.
export function useInteractionPause(ms = 10000) {
  const [paused, setPaused] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>()

  const notify = useCallback(() => {
    setPaused(true)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setPaused(false), ms)
  }, [ms])

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  return { paused, notify }
}
