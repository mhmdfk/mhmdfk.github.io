import { useRef } from 'react'
import { Rug } from './Rug'
import type { Group, PointLight, MeshStandardMaterial } from 'three'
import { useIdleFrame } from '../useIdleFrame'
import { anchors, palette } from '../layout'
import { Block, Blocks } from '../primitives'

export function SofaSet() {
  const catalogue = useRef<Group>(null)
  const lamp = useRef<PointLight>(null)
  const shade = useRef<MeshStandardMaterial>(null)
  useIdleFrame((time) => {
    if (catalogue.current) {
      catalogue.current.position.y = Math.sin(time * 0.8) * 0.055
      catalogue.current.rotation.y = Math.sin(time * 0.5) * 0.035
      catalogue.current.rotation.z = Math.sin(time * 0.7) * 0.018
    }
    const flicker = Math.sin(time * 7) * 0.025 + Math.sin(time * 11.3) * 0.015
    if (lamp.current) lamp.current.intensity = 8 * (1 + flicker)
    if (shade.current) shade.current.emissiveIntensity = 1.6 * (1 + flicker)
  })
  return (
    <group position={anchors.sofa.position}>
      <Rug />
      <Block
        rounded
        position={[0, 0.38, -0.65]}
        size={[2.8, 0.55, 1]}
        color={palette.fabric}
      />
      <Block
        rounded
        position={[0, 0.9, -1.08]}
        size={[2.8, 0.9, 0.24]}
        color={palette.fabric}
      />
      <Blocks
        size={[0.25, 0.8, 1.15]}
        color={palette.fabric}
        items={[-1.4, 1.4].map((x) => ({ position: [x, 0.65, -0.65] }))}
      />
      {[-0.65, 0.65].map((x) => (
        <group key={x}>
          <Block
            rounded
            position={[x, 0.73, -0.57]}
            size={[1.2, 0.2, 0.8]}
            color="#829581"
            roughness={1}
          />
          <Block
            rounded
            position={[x, 1.03, -0.88]}
            size={[1.16, 0.55, 0.2]}
            color="#718572"
            roughness={1}
          />
        </group>
      ))}
      <group position={[-0.92, 1.06, -0.74]} rotation={[0.12, 0.08, -0.2]}>
        <Block
          rounded
          position={[0, 0, 0]}
          size={[0.46, 0.46, 0.18]}
          color={palette.accent}
          roughness={1}
        />
      </group>
      <Blocks
        size={[0.12, 0.22, 0.12]}
        color={palette.wood}
        items={[-1.18, 1.18].flatMap((x) =>
          [-0.97, -0.3].map((z) => ({ position: [x, 0.13, z] })),
        )}
      />
      <Block
        rounded
        position={[0, 0.58, 1]}
        size={[1.8, 0.12, 1]}
        color={palette.wood}
      />
      <Blocks
        size={[0.1, 0.5, 0.1]}
        color={palette.metal}
        items={[-0.7, 0.7].flatMap((x) =>
          [0.65, 1.35].map((z) => ({ position: [x, 0.3, z] })),
        )}
      />
      <Block
        rounded
        position={[1.8, 1.2, -1.2]}
        size={[0.055, 2.4, 0.055]}
        color={palette.metal}
      />
      <mesh position={[1.8, 0.09, -1.2]} castShadow receiveShadow>
        <cylinderGeometry args={[0.32, 0.36, 0.1, 12]} />
        <meshStandardMaterial color={palette.metal} roughness={0.9} />
      </mesh>
      <mesh position={[1.8, 2.35, -1.2]} castShadow>
        <cylinderGeometry args={[0.28, 0.48, 0.52, 12, 1, true]} />
        <meshStandardMaterial
          ref={shade}
          color="#c4ac83"
          emissive="#ffd09a"
          emissiveIntensity={1.6}
          side={2}
          roughness={0.9}
        />
      </mesh>
      <pointLight
        ref={lamp}
        position={[1.8, 2.15, -1.2]}
        color="#ffd09a"
        intensity={8}
        distance={7}
        decay={2}
      />
    </group>
  )
}
