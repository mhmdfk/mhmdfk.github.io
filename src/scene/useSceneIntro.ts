import { useEffect, useMemo, useRef } from 'react'

export type SceneIntro = {
  enabled: () => boolean
  skip: () => void
  finish: () => void
  takeSnap: () => boolean
}

export function useSceneIntro() {
  const intro = useRef({ enabled: false, snap: false })
  const checked = useRef(false)

  useEffect(() => {
    if (!checked.current) {
      checked.current = true
      try {
        const visited = sessionStorage.getItem('room-intro-visited')
        sessionStorage.setItem('room-intro-visited', 'true')
        intro.current.enabled =
          !visited &&
          !window.location.hash &&
          window.scrollY === 0 &&
          !window.matchMedia('(prefers-reduced-motion: reduce)').matches
      } catch {
        // Skip the intro when a session cannot be remembered.
      }
    }
    const skip = () => {
      if (!intro.current.enabled) return
      intro.current.enabled = false
      intro.current.snap = true
    }
    const events = [
      'scroll',
      'keydown',
      'pointerdown',
      'wheel',
      'hashchange',
    ] as const
    events.forEach((event) =>
      window.addEventListener(event, skip, { capture: true, passive: true }),
    )
    return () => {
      events.forEach((event) => window.removeEventListener(event, skip, true))
    }
  }, [])

  return useMemo<SceneIntro>(
    () => ({
      enabled: () => intro.current.enabled,
      skip: () => {
        intro.current.enabled = false
        intro.current.snap = true
      },
      finish: () => {
        intro.current.enabled = false
      },
      takeSnap: () => {
        const snap = intro.current.snap
        intro.current.snap = false
        return snap
      },
    }),
    [],
  )
}
