import { useCallback, useEffect, useRef, useState } from 'react'
import { profile, ui } from '../content/content'
import { isSplashActive } from '../lib/splash'
import { setSplashScrollLocked } from '../lib/smoothScroll'

type Props = {
  ready: boolean
  unavailable: boolean
  building: boolean
  progress: number | null
}

export function SplashScreen({
  ready,
  unavailable,
  building,
  progress,
}: Props) {
  const [phase, setPhase] = useState<
    'loading' | 'exiting' | 'quick-exit' | 'done'
  >('loading')
  const [announcement, setAnnouncement] = useState('')
  const skip = useRef<HTMLButtonElement>(null)
  const release = useRef(() => {})
  const started = useRef(0)
  const finished = useRef(false)

  const finish = useCallback(() => {
    if (finished.current) return
    finished.current = true
    release.current()
    document.documentElement.classList.remove('splash-pending')
    setPhase('done')
    document.getElementById('main')?.focus({ preventScroll: true })
    window.dispatchEvent(new Event('splashdone'))
  }, [])

  useEffect(() => {
    if (!isSplashActive()) {
      const timer = window.setTimeout(() => setPhase('done'), 0)
      return () => window.clearTimeout(timer)
    }
    started.current =
      performance.getEntriesByName('splash-start')[0]?.startTime ??
      performance.now()
    const page = document.getElementById('site-content')!
    page.inert = true
    page.setAttribute('aria-hidden', 'true')
    setSplashScrollLocked(true)
    skip.current?.focus({ preventScroll: true })
    const announce = window.setTimeout(
      () => setAnnouncement(ui.splash.announcement),
      0,
    )
    const cap = window.setTimeout(
      finish,
      Math.max(0, 8000 - (performance.now() - started.current)),
    )
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopImmediatePropagation()
        finish()
      } else if (event.key === 'Tab') {
        event.preventDefault()
        skip.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey, true)
    let released = false
    release.current = () => {
      if (released) return
      released = true
      window.clearTimeout(announce)
      window.clearTimeout(cap)
      window.removeEventListener('keydown', onKey, true)
      page.inert = false
      page.removeAttribute('aria-hidden')
      setSplashScrollLocked(false)
    }
    return () => release.current()
  }, [finish])

  useEffect(() => {
    if (!isSplashActive() || phase === 'done' || phase === 'quick-exit') return
    if (!unavailable && (phase !== 'loading' || !ready)) return
    const timer = window.setTimeout(
      () => setPhase(unavailable ? 'quick-exit' : 'exiting'),
      unavailable
        ? 0
        : Math.max(0, 700 - (performance.now() - started.current)),
    )
    return () => window.clearTimeout(timer)
  }, [ready, unavailable, phase])

  useEffect(() => {
    if (phase !== 'exiting' && phase !== 'quick-exit') return
    const timer = window.setTimeout(finish, phase === 'quick-exit' ? 150 : 600)
    return () => window.clearTimeout(timer)
  }, [phase, finish])

  if (phase === 'done') return null
  const value = ready
    ? 100
    : building && progress !== null
      ? progress * 0.9
      : null
  return (
    <div className={`splash no-scene-hover splash--${phase}`}>
      <span className="sr-only" role="status" aria-live="polite">
        {announcement}
      </span>
      <div className="splash-brand" aria-hidden="true">
        <svg className="splash-monogram" viewBox="0 0 64 64" fill="none">
          <path
            d="M10 44V20l10 14 10-14v24M36 44l9-24 9 24M40 34h10"
            pathLength="1"
          />
        </svg>
        <p className="splash-name">{profile.name}</p>
        <p className="splash-title">{profile.title}</p>
        <div className="splash-progress">
          <span
            className={value === null ? 'is-indeterminate' : undefined}
            style={
              value === null
                ? undefined
                : { transform: `scaleX(${value / 100})` }
            }
          />
        </div>
        <p className="splash-status">
          {building ? ui.splash.building : ui.splash.loading}
        </p>
      </div>
      <button
        ref={skip}
        type="button"
        className="splash-skip text-button"
        onClick={finish}
      >
        {ui.splash.skip}
      </button>
    </div>
  )
}
