import { anchors, palette, room } from './layout'
import { Block } from './primitives'
import { Desk } from './objects/Desk'
import { SofaSet } from './objects/SofaSet'
import { Corkboard } from './objects/Corkboard'
import { Shelf } from './objects/Shelf'
import { Diploma } from './objects/Diploma'

export function Room() {
  return (
    <group>
      <Block
        position={[0, -0.12, 0]}
        size={[room.width, 0.24, room.depth]}
        color={palette.floor}
      />
      <Block
        position={[0, room.height / 2, -room.depth / 2]}
        size={[room.width, room.height, 0.16]}
        color={palette.wall}
      />
      <Block
        position={[-room.width / 2, room.height / 2, 0]}
        size={[0.16, room.height, room.depth]}
        color={palette.wall}
      />
      <Block
        position={[room.width / 2, room.height / 2, 0]}
        size={[0.16, room.height, room.depth]}
        color={palette.wall}
      />
      <group position={anchors.window.position}>
        <Block
          position={[0, 0, 0.02]}
          size={[1.7, 1.9, 0.12]}
          color={palette.wood}
        />
        <Block
          position={[0, 0, 0.1]}
          size={[1.46, 1.66, 0.04]}
          color="#1d374b"
          emissive="#203c55"
        />
        <mesh position={[0.35, 0.35, 0.14]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.21, 0.21, 0.02, 16]} />
          <meshStandardMaterial
            color={palette.paper}
            emissive={palette.cool}
            emissiveIntensity={0.6}
          />
        </mesh>
        <Block
          position={[0, 0, 0.16]}
          size={[0.06, 1.7, 0.08]}
          color={palette.wood}
        />
        <Block
          position={[0, 0, 0.16]}
          size={[1.5, 0.06, 0.08]}
          color={palette.wood}
        />
        <pointLight
          position={[0, 0, 0.8]}
          color={palette.cool}
          intensity={2.5}
          distance={5}
        />
      </group>
      <Desk />
      <SofaSet />
      <Corkboard />
      <Shelf />
      <Diploma />
    </group>
  )
}
