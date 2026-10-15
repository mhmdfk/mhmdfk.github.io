import { useEffect, useRef } from 'react'
import type { SceneIntro } from './useSceneIntro'
import type { SceneQuality } from './quality'
import { useFrame } from '@react-three/fiber'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MathUtils, PerspectiveCamera, Vector3 } from 'three'
import { sectionTop, subscribeReducedMotion } from '../lib/smoothScroll'
import { cameraAt, cameraStops } from './cameraPath'

export function useScrollCamera(
  intro: SceneIntro,
  tier: Exclude<SceneQuality, 'off'>,
) {
  const introElapsed = useRef(0)
  const updateProgress = useRef(() => {})
  const progress = useRef(0)
  const reduced = useRef(false)
  const initialized = useRef(false)
  const target = useRef(new Vector3())
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const unsubscribeMotion = subscribeReducedMotion((value) => {
      reduced.current = value
    })
    let stops: number[] = []
    const measure = () => {
      const max = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight,
      )
      const work = sectionTop('work')
      const about = sectionTop('about')
      stops = [
        0,
        sectionTop('experience'),
        work,
        work + (about - work) * 0.4,
        work + (about - work) * 0.8,
        about,
        sectionTop('skills'),
        sectionTop('contact'),
      ].map((top) => Math.min(max, top))
      // Reserve a distinct interval for every stop that reaches the page bottom.
      const firstAtEnd = stops.findIndex((top) => top === max)
      if (max > 0 && firstAtEnd > 0) {
        const start = firstAtEnd - 1
        const span = max - stops[start]
        for (let index = firstAtEnd; index < stops.length; index++) {
          stops[index] =
            stops[start] + (span * (index - start)) / (stops.length - 1 - start)
        }
      }
    }
    const update = () => {
      const scroll = window.scrollY
      let index = 0
      while (index < stops.length - 2 && scroll >= stops[index + 1]) index++
      const span = stops[index + 1] - stops[index]
      const fraction =
        span > 0 ? MathUtils.clamp((scroll - stops[index]) / span, 0, 1) : 1
      progress.current = (index + fraction) / (stops.length - 1)
    }
    updateProgress.current = update
    measure()
    update()
    const trigger = ScrollTrigger.create({
      start: 0,
      end: () => Math.max(1, ScrollTrigger.maxScroll(window)),
      onUpdate: update,
      onRefresh: () => {
        measure()
        update()
      },
    })
    const refresh = () => ScrollTrigger.refresh()
    window.addEventListener('resize', refresh)
    return () => {
      trigger.kill()
      window.removeEventListener('resize', refresh)
      unsubscribeMotion()
    }
  }, [])

  useFrame(({ camera, size }, delta) => {
    if (camera instanceof PerspectiveCamera) {
      const fov = Math.max(
        42,
        (2 *
          Math.atan(Math.tan(Math.PI / 9) / (size.width / size.height)) *
          180) /
          Math.PI,
      )
      if (camera.fov !== fov) {
        camera.fov = fov
        camera.updateProjectionMatrix()
      }
    }
    if (
      intro.enabled() &&
      (tier !== 'high' ||
        reduced.current ||
        window.location.hash ||
        window.scrollY > 0)
    ) {
      intro.skip()
    }
    const snap = intro.takeSnap()
    if (snap) updateProgress.current()
    const value = reduced.current
      ? Math.round(progress.current * (cameraStops.length - 1)) /
        (cameraStops.length - 1)
      : progress.current
    const next = cameraAt(value)
    if (intro.enabled()) {
      // The first rendered frame starts outside; both endpoints share the scroll path.
      const time = Math.min(1, introElapsed.current / 2.2)
      const remaining = 1 - time * time * (3 - 2 * time)
      next.position[1] += 0.8 * remaining
      next.position[2] += 3 * remaining
      camera.position.set(...next.position)
      target.current.set(...next.target)
      camera.lookAt(target.current)
      initialized.current = true
      introElapsed.current += delta
      if (time === 1) intro.finish()
      return
    }
    // Reach 99% of a new framing within 300 ms, with no time-based path drift.
    const blend = initialized.current && !snap ? 1 - Math.exp(-20 * delta) : 1
    camera.position.lerp(new Vector3(...next.position), blend)
    target.current.lerp(new Vector3(...next.target), blend)
    camera.lookAt(target.current)
    initialized.current = true
  })
}
