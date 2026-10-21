import { Vector3 } from 'three'
import { anchors, type Point } from './layout'

type CameraStop = { id: string; position: Point; target: Point }
const offset = (point: Point, delta: Point): Point =>
  point.map((value, i) => value + delta[i]) as Point

// Elevated positions keep the interpolated route above the furniture.
export const cameraStops = [
  { id: 'top', position: [0, 7.5, 18], target: [0, 1.3, -0.6] },
  {
    id: 'experience',
    position: offset(anchors.desk.position, [0.6, 3.2, 6.5]),
    target: offset(anchors.desk.target, [-1, 0.3, 0]),
  },
  {
    id: 'tiraz',
    position: offset(anchors.sofa.position, [0, 3.4, 5]),
    target: anchors.sofa.target,
  },
  {
    id: 'huntrix',
    position: offset(anchors.corkboard.position, [-4.9, 1.5, 3.5]),
    target: anchors.corkboard.target,
  },
  {
    id: 'matjari',
    position: offset(anchors.shelf.position, [4.9, 3.3, 1.5]),
    target: anchors.shelf.target,
  },
  {
    id: 'about',
    position: offset(anchors.diploma.position, [0, 1, 5.4]),
    target: anchors.diploma.target,
  },
  { id: 'skills', position: [3.8, 6, 12], target: [0, 1.3, -0.6] },
  {
    id: 'contact',
    position: offset(anchors.window.position, [0.5, 1, 6.4]),
    target: anchors.window.target,
  },
] satisfies CameraStop[]

// Framings for the mobile room view, off the scroll path. The portrait one
// shows the whole room from above, so the six tags fit a phone without
// overlapping. Landscape screens are too short for that, so they get a closer
// view of the back of the room.
const roomViewStops = {
  portrait: { id: 'room', position: [0, 13, 10.5], target: [0, 0, 1.5] },
  landscape: { id: 'room', position: [0, 7, 7.5], target: [0, 1.5, -0.5] },
} satisfies Record<string, CameraStop>

export const roomViewStop = (aspect: number) =>
  aspect > 1 ? roomViewStops.landscape : roomViewStops.portrait

const rad = Math.PI / 180

// Dragging orbits the overview: same target and distance, within limits.
// Azimuth is measured round the vertical from the front, tilt is how far the
// camera drops from the overview's angle, zoom scales the distance.
function orbitAround({ position, target }: CameraStop, tilt: number) {
  const offset = position.map((value, i) => value - target[i])
  const radius = Math.hypot(...offset)
  return {
    target,
    radius,
    polar: Math.acos(offset[1] / radius),
    azimuth: 40 * rad,
    tilt: tilt * rad,
    minZoom: 0.6,
  }
}
export type RoomOrbit = ReturnType<typeof orbitAround>
const roomViewOrbits = {
  portrait: orbitAround(roomViewStops.portrait, 22),
  landscape: orbitAround(roomViewStops.landscape, 10),
}
export const roomViewOrbit = (aspect: number): RoomOrbit =>
  aspect > 1 ? roomViewOrbits.landscape : roomViewOrbits.portrait

type ObjectId = keyof typeof anchors

// Close-ups for the room view. The scroll stops push the object to one side to
// make room for text; here the card sits below, so the object is centred in the
// upper part of the screen. `from` is the direction the camera looks from.
const closeups: Record<
  ObjectId,
  { center: Point; size: [number, number]; from: Point }
> = {
  desk: { center: [-3, 1.15, -3.3], size: [2.9, 2.3], from: [0.45, 0.5, 1] },
  sofa: { center: [2, 0.8, -0.5], size: [3.4, 1.8], from: [0.35, 0.5, 1] },
  // The floor lamp stands in front of the board; from the side it only covers
  // the end.
  corkboard: {
    center: [4.9, 1.8, -1.5],
    size: [2.1, 2.1],
    from: [-1, 0.15, -0.75],
  },
  shelf: { center: [-4.5, 1.45, 1.5], size: [2.2, 3], from: [1, 0.15, 0.25] },
  diploma: {
    center: [1.5, 2.2, -4.9],
    size: [1.6, 1.2],
    from: [0.25, 0.15, 1],
  },
  window: {
    center: [-0.5, 2.2, -4.9],
    size: [1.75, 1.95],
    from: [-0.25, 0.15, 1],
  },
}
// How much of the screen the object may fill, and where its centre sits
// (NDC y, up is positive): above the card and below the Back button. A
// landscape screen has a thinner card strip and no button above the middle.
const FILL_X = 0.72
const closeupFrame = (aspect: number) =>
  aspect > 1 ? { fillY: 0.58, centerY: 0.33 } : { fillY: 0.38, centerY: 0.2 }

let closeupKey = ''
let closeupPose: { position: Point; target: Point } | null = null

export function roomViewCloseup(id: ObjectId, aspect: number, fov: number) {
  const key = `${id}|${aspect}|${fov}`
  if (closeupPose && key === closeupKey) return closeupPose
  const { center, size, from } = closeups[id]
  const { fillY, centerY } = closeupFrame(aspect)
  const half = Math.tan((fov * rad) / 2)
  const distance = Math.max(
    size[0] / 2 / (half * aspect * FILL_X),
    size[1] / 2 / (half * fillY),
  )
  const middle = new Vector3(...center)
  const position = middle
    .clone()
    .addScaledVector(new Vector3(...from).normalize(), distance)
  // Aim below the object by the angle that lifts it to centerY on screen.
  const view = middle.clone().sub(position)
  const right = new Vector3()
    .crossVectors(view, new Vector3(0, 1, 0))
    .normalize()
  const up = new Vector3().crossVectors(right, view).normalize()
  const target = middle.addScaledVector(up, -distance * half * centerY)
  closeupKey = key
  closeupPose = {
    position: position.toArray() as Point,
    target: target.toArray() as Point,
  }
  return closeupPose
}

export function cameraAt(progress: number): { position: Point; target: Point } {
  const scaled = Math.max(0, Math.min(1, progress)) * (cameraStops.length - 1)
  const index = Math.min(Math.floor(scaled), cameraStops.length - 2)
  const t = scaled - index
  const eased = t * t * (3 - 2 * t)
  const from = cameraStops[index]
  const to = cameraStops[index + 1]
  const interpolate = (a: Point, b: Point): Point =>
    a.map((value, i) => value + (b[i] - value) * eased) as Point
  return {
    position: interpolate(from.position, to.position),
    target: interpolate(from.target, to.target),
  }
}
