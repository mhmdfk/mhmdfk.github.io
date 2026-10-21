import { MathUtils, type Vector3 } from 'three'
import { roomViewOrbit, type RoomOrbit } from './cameraPath'

// The room view's orbit around the overview. The gestures live in the overlay,
// outside the canvas, so the state is a plain object they write to and the
// camera driver reads every frame, with no React renders in between.
const rad = Math.PI / 180
const DRAG_AZIMUTH = 0.3 * rad // per pixel
const DRAG_TILT = 0.2 * rad
const KEY_AZIMUTH = 6 * rad
const KEY_ZOOM = 0.9
// Inertia: the release velocity fades out over about half a second.
const FRICTION = 6
// Slow ping-pong until the visitor takes over: 20 degrees either way at an
// average of 8 degrees per second, easing in over the first second and a half.
const AUTO_AMPLITUDE = 20 * rad
const AUTO_SPEED = (2 * Math.PI * 8) / (4 * 20)
const AUTO_EASE = 1.5

export const orbit = {
  azimuth: 0,
  tilt: 0,
  zoom: 1,
  velocityAzimuth: 0,
  velocityTilt: 0,
  dragging: false,
  auto: false,
  // The visitor took over: auto-rotate does not come back.
  stopped: false,
  autoTime: 0,
  autoPhase: 0,
}
let limits: RoomOrbit = roomViewOrbit(1)
let lastMove = 0

export function resetOrbit() {
  Object.assign(orbit, {
    azimuth: 0,
    tilt: 0,
    zoom: 1,
    velocityAzimuth: 0,
    velocityTilt: 0,
    dragging: false,
    auto: false,
    stopped: false,
    autoTime: 0,
    autoPhase: 0,
  })
}

export function setOrbitAspect(aspect: number) {
  limits = roomViewOrbit(aspect)
  return limits
}

function clamp() {
  const azimuth = MathUtils.clamp(
    orbit.azimuth,
    -limits.azimuth,
    limits.azimuth,
  )
  if (azimuth !== orbit.azimuth) orbit.velocityAzimuth = 0
  orbit.azimuth = azimuth
  const tilt = MathUtils.clamp(orbit.tilt, 0, limits.tilt)
  if (tilt !== orbit.tilt) orbit.velocityTilt = 0
  orbit.tilt = tilt
  orbit.zoom = MathUtils.clamp(orbit.zoom, limits.minZoom, 1)
}

export function startAutoRotate() {
  if (orbit.stopped) return
  orbit.auto = true
  orbit.autoTime = 0
  orbit.autoPhase = 0
}

// The first touch, wheel or key hands control to the visitor for good.
export function stopAutoRotate() {
  orbit.auto = false
  orbit.stopped = true
}

// Freezes the camera on the spot, for a fly-to.
export function haltOrbit() {
  orbit.auto = false
  orbit.dragging = false
  orbit.velocityAzimuth = 0
  orbit.velocityTilt = 0
}

export function beginOrbitDrag() {
  stopAutoRotate()
  orbit.dragging = true
  orbit.velocityAzimuth = 0
  orbit.velocityTilt = 0
  lastMove = 0
}

// Dragging moves the scene under the finger: right turns the camera left, down
// lifts it.
export function orbitDrag(dx: number, dy: number) {
  const now = performance.now()
  const azimuth = -dx * DRAG_AZIMUTH
  const tilt = -dy * DRAG_TILT
  orbit.azimuth += azimuth
  orbit.tilt += tilt
  const elapsed = (now - lastMove) / 1000
  if (lastMove && elapsed > 0 && elapsed < 0.1) {
    // Blend with the previous velocity so one noisy event doesn't fling it.
    orbit.velocityAzimuth = MathUtils.lerp(
      orbit.velocityAzimuth,
      azimuth / elapsed,
      0.5,
    )
    orbit.velocityTilt = MathUtils.lerp(orbit.velocityTilt, tilt / elapsed, 0.5)
  }
  lastMove = now
  clamp()
}

export function endOrbitDrag() {
  orbit.dragging = false
  // Holding still before letting go leaves no momentum.
  if (performance.now() - lastMove > 80) {
    orbit.velocityAzimuth = 0
    orbit.velocityTilt = 0
  }
}

export function orbitZoom(scale: number) {
  stopAutoRotate()
  orbit.zoom *= scale
  clamp()
}

export function orbitKey(key: string) {
  if (key === 'ArrowLeft') orbit.azimuth -= KEY_AZIMUTH
  else if (key === 'ArrowRight') orbit.azimuth += KEY_AZIMUTH
  else if (key === '+' || key === '=') orbit.zoom *= KEY_ZOOM
  else if (key === '-' || key === '_') orbit.zoom /= KEY_ZOOM
  else return false
  stopAutoRotate()
  clamp()
  return true
}

export function stepOrbit(delta: number) {
  if (orbit.auto) {
    orbit.autoTime += delta
    const ease = MathUtils.smoothstep(orbit.autoTime / AUTO_EASE, 0, 1)
    orbit.autoPhase += AUTO_SPEED * delta * ease
    orbit.azimuth = AUTO_AMPLITUDE * Math.sin(orbit.autoPhase)
  } else if (!orbit.dragging) {
    orbit.azimuth += orbit.velocityAzimuth * delta
    orbit.tilt += orbit.velocityTilt * delta
    const decay = Math.exp(-FRICTION * delta)
    orbit.velocityAzimuth *= decay
    orbit.velocityTilt *= decay
  }
  clamp()
}

// The camera for a given azimuth, tilt and zoom. Not clamped, so the entrance
// can start outside the limits.
export function orbitPose(
  azimuth: number,
  tilt: number,
  zoom: number,
  position: Vector3,
  target: Vector3,
) {
  const [x, y, z] = limits.target
  const polar = limits.polar + tilt
  const radius = limits.radius * zoom
  const flat = radius * Math.sin(polar)
  position.set(
    x + flat * Math.sin(azimuth),
    y + radius * Math.cos(polar),
    z + flat * Math.cos(azimuth),
  )
  target.set(x, y, z)
}
