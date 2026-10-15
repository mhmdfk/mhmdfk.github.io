import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MathUtils, PerspectiveCamera, Vector3 } from 'three'
import { sectionTop, subscribeReducedMotion } from '../lib/smoothScroll'
import { cameraAt, cameraStops } from './cameraPath'

export function useScrollCamera() {
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
    const value = reduced.current
      ? Math.round(progress.current * (cameraStops.length - 1)) /
        (cameraStops.length - 1)
      : progress.current
    const next = cameraAt(value)
    // Reach 99% of a new framing within 300 ms, with no time-based path drift.
    const blend = initialized.current ? 1 - Math.exp(-20 * delta) : 1
    camera.position.lerp(new Vector3(...next.position), blend)
    target.current.lerp(new Vector3(...next.target), blend)
    camera.lookAt(target.current)
    initialized.current = true
  })
}
