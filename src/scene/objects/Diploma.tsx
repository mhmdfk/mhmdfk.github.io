import { anchors, palette } from '../layout'
import { Block, Blocks } from '../primitives'

export function Diploma() {
  return (
    <group position={anchors.diploma.position}>
      <Block
        position={[0, 0, 0.02]}
        size={[1.55, 1.15, 0.12]}
        color={palette.wood}
      />
      <Block
        position={[0, 0, 0.09]}
        size={[1.33, 0.93, 0.03]}
        color={palette.paper}
      />
      <Blocks
        items={[0.2, 0.05, -0.1].map((y) => ({ position: [0, y, 0.12] }))}
        size={[0.9, 0.025, 0.01]}
        color={palette.fabric}
      />
      <mesh position={[0, -0.28, 0.13]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.09, 0.09, 0.015, 12]} />
        <meshStandardMaterial color={palette.wood} />
      </mesh>
    </group>
  )
}
