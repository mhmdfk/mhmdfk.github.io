import { useContext, useEffect, useRef, type ReactNode } from 'react'
import { useThree, type ThreeEvent } from '@react-three/fiber'
import { Group, Mesh, MeshStandardMaterial } from 'three'
import {
  HoverContext,
  activateObject,
  sceneTargetAllowed,
  type ObjectId,
} from './interaction'
import { palette } from './layout'
import { focusObject, get as getRoomView } from '../state/roomView'

export function InteractiveObject({
  id,
  children,
}: {
  id: ObjectId
  children: ReactNode
}) {
  const group = useRef<Group>(null)
  const { hover: currentHover, reportHover } = useContext(HoverContext)
  const hovered = currentHover?.id === id
  const invalidate = useThree((state) => state.invalidate)
  useEffect(() => {
    if (!hovered) return
    const restore: (() => void)[] = []
    group.current?.traverse((object) => {
      if (!(object instanceof Mesh)) return
      const materials = Array.isArray(object.material)
        ? object.material
        : [object.material]
      for (const material of materials) {
        if (!(material instanceof MeshStandardMaterial)) continue
        const color = material.emissive.clone()
        const intensity = material.emissiveIntensity
        material.emissive.set(palette.accent)
        material.emissiveIntensity = 0.35
        restore.push(() => {
          material.emissive.copy(color)
          material.emissiveIntensity = intensity
        })
      }
    })
    // The highlight bypasses props, so ask for a frame under demand rendering.
    invalidate()
    return () => {
      restore.forEach((reset) => reset())
      invalidate()
    }
  }, [hovered, invalidate])

  const hover = (event: ThreeEvent<PointerEvent>) => {
    if (
      event.pointerType === 'touch' ||
      !sceneTargetAllowed(event.nativeEvent.target)
    ) {
      reportHover(null)
      return
    }
    event.stopPropagation()
    reportHover({ id, x: event.clientX, y: event.clientY })
  }
  return (
    <group
      ref={group}
      onPointerOver={hover}
      onPointerMove={hover}
      onPointerOut={() => {
        reportHover(null)
      }}
      onClick={(event) => {
        if (
          !sceneTargetAllowed(event.nativeEvent.target) ||
          event.delta > 5 ||
          window.getSelection()?.toString()
        )
          return
        event.stopPropagation()
        reportHover(null)
        // In the room view a tap flies the camera up to the object first.
        const view = getRoomView()
        if (!view.open) activateObject(id)
        else if (!view.focus) focusObject(id)
      }}
    >
      {children}
    </group>
  )
}
