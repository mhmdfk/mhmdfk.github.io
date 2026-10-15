import { useEffect, useMemo } from 'react'
import { Instance, Instances } from '@react-three/drei'
import { BoxGeometry } from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { palette, room } from './layout'

function Skirting() {
  const geometry = useMemo(() => {
    const boards = [
      new BoxGeometry(room.width, 0.16, 0.1).translate(0, 0.1, -4.85),
      new BoxGeometry(0.1, 0.16, room.depth).translate(-4.85, 0.1, 0),
      new BoxGeometry(0.1, 0.16, room.depth).translate(4.85, 0.1, 0),
    ]
    const merged = mergeGeometries(boards)
    boards.forEach((board) => board.dispose())
    return merged
  }, [])
  useEffect(() => () => geometry.dispose(), [geometry])
  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color={palette.wood} roughness={0.8} />
    </mesh>
  )
}

export function RoomDetails() {
  return (
    <group>
      <Skirting />
      <group position={[-1.1, 0, -3.7]}>
        <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.3, 0.22, 0.5, 8]} />
          <meshStandardMaterial color="#b47c61" roughness={0.95} flatShading />
        </mesh>
        <mesh position={[0, 0.51, 0]}>
          <cylinderGeometry args={[0.26, 0.26, 0.02, 8]} />
          <meshStandardMaterial color="#302c22" roughness={1} />
        </mesh>
        <Instances limit={9} range={9} frames={1} castShadow>
          <cylinderGeometry args={[0.012, 0.018, 1, 5]} />
          <meshStandardMaterial
            color={palette.fabric}
            roughness={1}
            flatShading
          />
          {Array.from({ length: 9 }, (_, i) => (
            <Instance
              key={i}
              position={[
                Math.sin(i * 2.4) * 0.14,
                0.8 + (i % 3) * 0.09,
                Math.cos(i * 2.4) * 0.14,
              ]}
              rotation={[Math.sin(i) * 0.35, 0, Math.cos(i) * 0.35]}
              scale={[1, 0.65 + (i % 3) * 0.18, 1]}
            />
          ))}
        </Instances>
        <Instances limit={18} range={18} frames={1} castShadow receiveShadow>
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial roughness={0.9} flatShading />
          {Array.from({ length: 18 }, (_, i) => (
            <Instance
              key={i}
              position={[
                Math.sin(i * 2.4) * 0.3,
                1 + (i % 5) * 0.13,
                Math.cos(i * 2.4) * 0.3,
              ]}
              rotation={[0.3, i * 2.4, 0.6]}
              scale={[0.13, 0.32, 0.045]}
              color={i % 3 ? palette.fabric : palette.accent}
            />
          ))}
        </Instances>
      </group>
      <group position={[0.3, 0, -1.8]}>
        <mesh position={[0, 3.6, 0]}>
          <cylinderGeometry args={[0.018, 0.018, 0.8, 6]} />
          <meshStandardMaterial color={palette.metal} roughness={0.7} />
        </mesh>
        <mesh position={[0, 3.07, 0]} castShadow>
          <coneGeometry args={[0.52, 0.4, 12, 1, true]} />
          <meshStandardMaterial
            color={palette.wood}
            roughness={0.65}
            side={2}
            flatShading
          />
        </mesh>
        <mesh position={[0, 2.94, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.4, 12]} />
          <meshStandardMaterial
            color="#ffdfb5"
            emissive="#ffdfb5"
            emissiveIntensity={1.6}
            roughness={0.7}
            side={2}
          />
        </mesh>
        <pointLight
          position={[0, 2.8, 0]}
          color="#ffdfb5"
          intensity={3}
          distance={5}
        />
      </group>
    </group>
  )
}
