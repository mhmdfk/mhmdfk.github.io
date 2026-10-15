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
