import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { MathUtils, Vector3, type Camera, type Object3D } from 'three'
import { ui } from '../content/content'
import type { ObjectId } from './interaction'
import { focusObject } from '../state/roomView'
import { anchors, type Point } from './layout'

const ids = Object.keys(ui.scene) as ObjectId[]

// The window and the diploma hang side by side on the back wall; their tags
// point at the outer sides so the two don't overlap.
const nudge: Partial<Record<ObjectId, Point>> = {
  window: [-0.8, 0.4, 0],
  diploma: [0.3, -0.4, 0],
}

// A tag is a pin: its tip is the projected point, the pill sits above it.
const PIN_HEIGHT = 52
const projected = new Vector3()

// Projects like drei's default, but keeps the whole pin inside the viewport.
function pinPosition(id: ObjectId) {
  const half = (ui.scene[id].length * 8 + 32) / 2 + 8
  return (
    el: Object3D,
    camera: Camera,
    size: { width: number; height: number },
  ) => {
    projected.setFromMatrixPosition(el.matrixWorld).project(camera)
    return [
      MathUtils.clamp(
        ((projected.x + 1) * size.width) / 2,
        half,
        size.width - half,
      ),
      MathUtils.clamp(
        ((1 - projected.y) * size.height) / 2,
        PIN_HEIGHT + 8,
        size.height - 8,
      ),
    ]
  }
}

export function ObjectTags() {
  const invalidate = useThree((state) => state.invalidate)
  useEffect(() => {
    invalidate()
  }, [invalidate])
  // The tags live in the room view's overlay: the canvas layer ignores pointer
  // events and sits behind the page, so tags inside it couldn't be tapped.
  const host = document.getElementById('room-view-tags')
  if (!host) return null
  return ids.map((id) => {
    const [x, y, z] = anchors[id].target
    const [dx, dy, dz] = nudge[id] ?? [0, 0, 0]
    return (
      <Html
        key={id}
        position={[x + dx, y + dy, z + dz]}
        style={{ transform: 'translate(-50%, -100%)' }}
        portal={{ current: host }}
        zIndexRange={[10, 0]}
        calculatePosition={pinPosition(id)}
      >
        <button
          type="button"
          className="room-tag"
          data-object={id}
          onClick={() => focusObject(id)}
        >
          {ui.scene[id]}
        </button>
      </Html>
    )
  })
}
