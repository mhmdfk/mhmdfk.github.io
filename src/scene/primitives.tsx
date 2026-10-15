import { Instance, Instances } from '@react-three/drei'
import type { Point } from './layout'

export function Block({
  position,
  size,
  color,
  emissive,
}: {
  position: Point
  size: Point
  color: string
  emissive?: string
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={color}
        emissive={emissive}
        roughness={0.9}
        flatShading
      />
    </mesh>
  )
}

export function Blocks({
  items,
  size,
  color,
}: {
  items: { position: Point; rotation?: Point; color?: string }[]
  size: Point
  color: string
}) {
  return (
    <Instances limit={items.length} range={items.length}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.9} flatShading />
      {items.map((item, index) => (
        <Instance key={index} {...item} />
      ))}
    </Instances>
  )
}
