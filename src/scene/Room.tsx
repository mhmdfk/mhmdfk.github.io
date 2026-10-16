import { useEffect, useState } from 'react'
import { RoomDetails } from './RoomDetails'
import { InteractiveObject } from './InteractiveObject'
import { anchors, palette, room } from './layout'
import { Block } from './primitives'
import { Desk } from './objects/Desk'
import { SofaSet } from './objects/SofaSet'
import { Corkboard } from './objects/Corkboard'
import { Shelf } from './objects/Shelf'
import { Diploma } from './objects/Diploma'

const STAGES = 4

// Mounting the whole room in one go is a single long task on slow phones.
// Mount it one group per animation frame instead, so each stage is its own
// short task, then report back so shaders can be compiled.
export function Room({ onMounted }: { onMounted: () => void }) {
  const [stage, setStage] = useState(0)
  useEffect(() => {
    if (stage >= STAGES) {
      onMounted()
      return
    }
    const frame = requestAnimationFrame(() => setStage(stage + 1))
    return () => cancelAnimationFrame(frame)
  }, [stage, onMounted])

  return (
    <group>
      <Block
        castShadow={false}
        position={[0, -0.12, 0]}
        size={[room.width, 0.24, room.depth]}
        color={palette.floor}
      />
      <Block
        castShadow={false}
        receiveShadow={false}
        position={[0, room.height / 2, -room.depth / 2]}
        size={[room.width, room.height, 0.16]}
        color={palette.wall}
      />
      <Block
        castShadow={false}
        receiveShadow={false}
        position={[-room.width / 2, room.height / 2, 0]}
        size={[0.16, room.height, room.depth]}
        color={palette.wall}
      />
      <Block
        castShadow={false}
        receiveShadow={false}
        position={[room.width / 2, room.height / 2, 0]}
        size={[0.16, room.height, room.depth]}
        color={palette.wall}
      />
      <InteractiveObject id="window">
        <group position={anchors.window.position}>
          <Block
            rounded
            position={[0, 0, 0.02]}
            size={[1.7, 1.9, 0.12]}
            color={palette.wood}
          />
          <Block
            position={[0, 0, 0.1]}
            size={[1.46, 1.66, 0.04]}
            color="#375563"
            emissive="#8bbac6"
            emissiveIntensity={1.6}
          />
          <mesh position={[0.35, 0.35, 0.14]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.21, 0.21, 0.02, 16]} />
            <meshStandardMaterial
              color={palette.paper}
              emissive={palette.cool}
              emissiveIntensity={3.2}
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
      </InteractiveObject>
      {stage >= 1 && (
        <>
          <InteractiveObject id="desk">
            <Desk />
          </InteractiveObject>
          <InteractiveObject id="shelf">
            <Shelf />
          </InteractiveObject>
        </>
      )}
      {stage >= 2 && (
        <InteractiveObject id="sofa">
          <SofaSet />
        </InteractiveObject>
      )}
      {stage >= 3 && (
        <>
          <InteractiveObject id="corkboard">
            <Corkboard />
          </InteractiveObject>
          <InteractiveObject id="diploma">
            <Diploma />
          </InteractiveObject>
        </>
      )}
      {stage >= 4 && <RoomDetails />}
    </group>
  )
}
