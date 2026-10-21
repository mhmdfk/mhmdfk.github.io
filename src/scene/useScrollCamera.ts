import { useEffect, useRef } from 'react'
import type { SceneIntro } from './useSceneIntro'
import type { SceneQuality } from './quality'
import { useFrame, useThree } from '@react-three/fiber'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MathUtils, PerspectiveCamera, Vector3, type Camera } from 'three'
import {
  sectionTop,
  subscribeReducedMotion,
  takeCameraSnap,
} from '../lib/smoothScroll'
import { cameraAt, cameraStops, roomViewCloseup } from './cameraPath'
import {
  get as getRoomView,
  markEntered,
  subscribe as subscribeRoomView,
} from '../state/roomView'
import {
  haltOrbit,
  orbit,
  orbitPose,
  resetOrbit,
  setOrbitAspect,
  startAutoRotate,
  stepOrbit,
} from './orbit'

// Squared distance under which the camera counts as settled (about a tenth of
// a pixel on screen), so demand rendering can stop.
const SETTLED = 1e-6

// Timed camera moves in the room view. They follow an exact eased path rather
// than chasing the goal, so they take the same time on every device.
const ENTER_SECONDS = 1.2
const FOCUS_SECONDS = 0.8
// The entrance starts swung round to the left, higher up and further out, and
// settles onto the orbit.
const ENTER_AZIMUTH = (-60 * Math.PI) / 180
const ENTER_TILT = (20 * Math.PI) / 180
const ENTER_ZOOM = 1.3
// The share of the entrance spent leaving the scroll camera's position.
const ENTER_LEAVE = 0.4

type Flight = {
  kind: 'enter' | 'focus' | 'return'
  elapsed: number
  duration: number
}

const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

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
  const goal = useRef(new Vector3())
  const aim = useRef(new Vector3())
  const overview = useRef(false)
  const room = useRef({
    begin: false,
    focus: getRoomView().focus,
    flight: null as Flight | null,
    from: { position: new Vector3(), target: new Vector3() },
  })
  const invalidate = useThree((state) => state.invalidate)
  // While the room view is open the camera orbits the overview; ask for a frame
  // whenever it toggles so the low tier (demand rendering) starts easing.
  useEffect(() => {
    const sync = () => {
      const open = getRoomView().open
      if (open && !overview.current) room.current.begin = true
      overview.current = open
      invalidate()
    }
    sync()
    return subscribeRoomView(sync)
  }, [invalidate])
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
      onUpdate: () => {
        update()
        invalidate()
      },
      onRefresh: () => {
        measure()
        update()
        invalidate()
      },
    })
    const refresh = () => ScrollTrigger.refresh()
    window.addEventListener('resize', refresh)
    let disposed = false
    void document.fonts.ready.then(() => {
      if (!disposed) refresh()
    })
    return () => {
      disposed = true
      trigger.kill()
      window.removeEventListener('resize', refresh)
      unsubscribeMotion()
    }
  }, [invalidate])

  // Drives the camera while the room view is open. Returns true when a timed
  // move placed it, otherwise leaves the goal for the shared easing below.
  const driveRoomView = (camera: Camera, aspect: number, delta: number) => {
    const state = room.current
    const view = getRoomView()
    const step = Math.min(delta, 0.05)
    setOrbitAspect(aspect)
    const fly = (kind: Flight['kind'], duration: number) => {
      state.from.position.copy(camera.position)
      state.from.target.copy(target.current)
      state.flight = { kind, elapsed: 0, duration }
    }
    if (state.begin) {
      state.begin = false
      state.focus = null
      resetOrbit()
      fly('enter', ENTER_SECONDS)
    }
    if (view.focus !== state.focus) {
      state.focus = view.focus
      // Leave the orbit exactly where it is, so Back to room returns to it.
      haltOrbit()
      if (!view.entered) markEntered()
      fly(view.focus ? 'focus' : 'return', FOCUS_SECONDS)
    }
    if (!view.focus) stepOrbit(step)
    if (view.focus && camera instanceof PerspectiveCamera) {
      const close = roomViewCloseup(view.focus, aspect, camera.fov)
      goal.current.set(...close.position)
      aim.current.set(...close.target)
    } else {
      orbitPose(
        orbit.azimuth,
        orbit.tilt,
        orbit.zoom,
        goal.current,
        aim.current,
      )
    }
    const flight = state.flight
    if (!flight) return false
    flight.elapsed += step
    const time = Math.min(1, flight.elapsed / flight.duration)
    const eased = easeInOut(time)
    if (flight.kind === 'enter') {
      const remaining = 1 - eased
      orbitPose(
        orbit.azimuth + ENTER_AZIMUTH * remaining,
        orbit.tilt + ENTER_TILT * remaining,
        orbit.zoom * (1 + (ENTER_ZOOM - 1) * remaining),
        goal.current,
        aim.current,
      )
    }
    // The entrance leaves the scroll camera quickly and spends the rest of the
    // time sweeping round the orbit; the other moves go straight there.
    const along =
      flight.kind === 'enter'
        ? MathUtils.smoothstep(time, 0, ENTER_LEAVE)
        : eased
    camera.position.lerpVectors(state.from.position, goal.current, along)
    target.current.lerpVectors(state.from.target, aim.current, along)
    camera.lookAt(target.current)
    if (time === 1) {
      state.flight = null
      if (flight.kind === 'enter') {
        markEntered()
        startAutoRotate()
      }
    }
    return true
  }

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
        window.scrollY > 0 ||
        overview.current)
    ) {
      intro.skip()
    }
    const snap = intro.takeSnap() || takeCameraSnap()
    if (snap) updateProgress.current()
    const value = reduced.current
      ? Math.round(progress.current * (cameraStops.length - 1)) /
        (cameraStops.length - 1)
      : progress.current
    if (overview.current) {
      if (driveRoomView(camera, size.width / size.height, delta)) {
        initialized.current = true
        return
      }
    } else {
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
        if (!intro.waiting()) introElapsed.current += Math.min(delta, 0.05)
        if (time === 1) intro.finish()
        return
      }
      goal.current.set(...next.position)
      aim.current.set(...next.target)
    }
    // Reach 99% of a new framing within 300 ms, with no time-based path drift.
    // Demand rendering reports the whole idle gap as the first frame's delta,
    // so cap it: otherwise the camera jumps instead of easing.
    const step = Math.min(delta, 1 / 30)
    const blend = initialized.current && !snap ? 1 - Math.exp(-20 * step) : 1
    camera.position.lerp(goal.current, blend)
    target.current.lerp(aim.current, blend)
    camera.lookAt(target.current)
    initialized.current = true
    // Demand rendering: keep asking for frames until the easing has settled.
    if (
      tier === 'low' &&
      (camera.position.distanceToSquared(goal.current) > SETTLED ||
        target.current.distanceToSquared(aim.current) > SETTLED)
    )
      invalidate()
  })
}
