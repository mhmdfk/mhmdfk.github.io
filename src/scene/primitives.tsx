import { Instance, Instances, RoundedBox } from '@react-three/drei'
import type { Point } from './layout'

export function Block({
  position,
  size,
  color,
  emissive,
  emissiveIntensity = 1,
  roughness = 0.85,
  rounded = false,
  castShadow = true,
  receiveShadow = true,
}: {
  position: Point
  size: Point
  color: string
  emissive?: string
  emissiveIntensity?: number
  roughness?: number
  rounded?: boolean
  castShadow?: boolean
  receiveShadow?: boolean
}) {
  const material = (
    <meshStandardMaterial
      color={color}
      emissive={emissive}
      emissiveIntensity={emissiveIntensity}
      roughness={roughness}
      flatShading={!rounded}
    />
  )
  return rounded ? (
    <RoundedBox
      position={position}
      args={size}
      radius={Math.min(0.09, ...size.map((value) => value * 0.22))}
      smoothness={2}
      bevelSegments={1}
      castShadow={castShadow}
      receiveShadow={receiveShadow}
    >
      {material}
    </RoundedBox>
  ) : (
    <mesh
      position={position}
      castShadow={castShadow}
      receiveShadow={receiveShadow}
    >
      <boxGeometry args={size} />
      {material}
    </mesh>
  )
}

export function Blocks({
  items,
  size,
  color,
}: {
  items: { position: Point; rotation?: Point; scale?: Point; color?: string }[]
  size: Point
  color: string
}) {
  return (
    <Instances
      limit={items.length}
      range={items.length}
      frames={1}
      castShadow
      receiveShadow
    >
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.85} flatShading />
      {items.map((item, index) => (
        <Instance key={index} {...item} />
      ))}
    </Instances>
  )
}
