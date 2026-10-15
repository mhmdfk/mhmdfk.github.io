export type Point = [number, number, number]

type Anchor = { position: Point; target: Point }

export const room = { width: 10, height: 4, depth: 10 }

export const anchors = {
  desk: { position: [-3, 0, -3.5], target: [-3, 1.3, -3.5] },
  sofa: { position: [2, 0, 0], target: [2, 1, 0] },
  corkboard: { position: [4.9, 1.8, -1.5], target: [4.8, 1.8, -1.5] },
  shelf: { position: [-4.9, 0, 1.5], target: [-4.5, 1.4, 1.5] },
  diploma: { position: [1.5, 2.2, -4.9], target: [1.5, 2.2, -4.8] },
  window: { position: [-0.5, 2.2, -4.9], target: [-0.5, 2.2, -4.8] },
} satisfies Record<string, Anchor>

export const cameraStops = {
  hero: { position: [0, 7.5, 18], target: [0, 1.3, -0.6] },
} satisfies Record<string, Anchor>

export const palette = {
  background: '#101413',
  wall: '#253b33',
  floor: '#353d36',
  wood: '#967251',
  fabric: '#586f60',
  accent: '#b3e5c6',
  metal: '#202c29',
  paper: '#c7c6ae',
  cool: '#83b9cb',
}
