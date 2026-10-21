import { useEffect, type RefObject } from 'react'
import { get as getRoomView } from '../state/roomView'
import {
  beginOrbitDrag,
  endOrbitDrag,
  orbitDrag,
  orbitKey,
  orbitZoom,
} from '../scene/orbit'

// Pixels a finger travels before it counts as a drag rather than a tap.
const DRAG_START = 6
const WHEEL_ZOOM = 0.0015

// One pointer drags the room round, two pinch to zoom, the wheel zooms and the
// arrow and plus/minus keys do the same for the keyboard. Nothing happens while
// an object is in focus. `onGesture` runs once the visitor starts moving it.
export function useOrbitGestures(
  surface: RefObject<HTMLElement | null>,
  onGesture: () => void,
) {
  useEffect(() => {
    const element = surface.current
    if (!element) return
    const pointers = new Map<number, { x: number; y: number }>()
    let pinch = 0
    let travelled = 0
    const spread = () => {
      const [a, b] = [...pointers.values()]
      return Math.hypot(a.x - b.x, a.y - b.y)
    }

    const down = (event: PointerEvent) => {
      if (
        (event.pointerType === 'mouse' && event.button !== 0) ||
        getRoomView().focus
      )
        return
      try {
        element.setPointerCapture(event.pointerId)
      } catch {
        // The pointer may already be gone; the drag still works without it.
      }
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
      if (pointers.size === 1) travelled = 0
      if (pointers.size === 2) pinch = spread()
      beginOrbitDrag()
    }
    const move = (event: PointerEvent) => {
      const last = pointers.get(event.pointerId)
      if (!last) return
      const dx = event.clientX - last.x
      const dy = event.clientY - last.y
      last.x = event.clientX
      last.y = event.clientY
      if (pointers.size === 1) {
        orbitDrag(dx, dy)
        travelled += Math.hypot(dx, dy)
        if (travelled > DRAG_START) onGesture()
      } else if (pointers.size === 2) {
        const next = spread()
        if (pinch > 0 && next > 0) orbitZoom(pinch / next)
        pinch = next
        onGesture()
      }
    }
    const up = (event: PointerEvent) => {
      if (!pointers.delete(event.pointerId)) return
      if (element.hasPointerCapture(event.pointerId))
        element.releasePointerCapture(event.pointerId)
      // Letting go of one finger of a pinch carries on as a drag with the other.
      if (pointers.size === 0) endOrbitDrag()
      else beginOrbitDrag()
    }
    const wheel = (event: WheelEvent) => {
      if (getRoomView().focus) return
      // Also keeps a trackpad pinch from zooming the page.
      event.preventDefault()
      const lines = event.deltaMode === 1 ? 16 : 1
      orbitZoom(Math.exp(event.deltaY * lines * WHEEL_ZOOM))
      onGesture()
    }
    const key = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey || getRoomView().focus)
        return
      if (orbitKey(event.key)) event.preventDefault()
    }

    element.addEventListener('pointerdown', down)
    element.addEventListener('pointermove', move)
    element.addEventListener('pointerup', up)
    element.addEventListener('pointercancel', up)
    element.addEventListener('lostpointercapture', up)
    element.addEventListener('wheel', wheel, { passive: false })
    window.addEventListener('keydown', key)
    return () => {
      element.removeEventListener('pointerdown', down)
      element.removeEventListener('pointermove', move)
      element.removeEventListener('pointerup', up)
      element.removeEventListener('pointercancel', up)
      element.removeEventListener('lostpointercapture', up)
      element.removeEventListener('wheel', wheel)
      window.removeEventListener('keydown', key)
      endOrbitDrag()
    }
  }, [surface, onGesture])
}
