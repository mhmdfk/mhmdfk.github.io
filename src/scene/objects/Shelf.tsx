import { anchors, palette } from '../layout'
import { Block, Blocks } from '../primitives'

export function Shelf() {
  return (
    <group position={anchors.shelf.position} rotation={[0, Math.PI / 2, 0]}>
      <Block
        position={[0, 1.45, 0.12]}
        size={[2.1, 2.9, 0.12]}
        color={palette.wood}
      />
      <Blocks
        items={[-1, 1].map((x) => ({ position: [x, 1.45, 0.4] }))}
        size={[0.12, 2.9, 0.65]}
        color={palette.wood}
      />
      <Blocks
        items={[0.15, 1, 1.85, 2.8].map((y) => ({ position: [0, y, 0.4] }))}
        size={[2, 0.1, 0.65]}
        color={palette.wood}
      />
      <Blocks
        items={Array.from({ length: 12 }, (_, i) => ({
          position: [
            -0.78 + (i % 6) * 0.28,
            1.35 + Math.floor(i / 6) * 0.85,
            0.42,
          ],
          color: [palette.fabric, palette.accent, palette.paper][i % 3],
        }))}
        size={[0.18, 0.55, 0.36]}
        color="#ffffff"
      />
      <Blocks
        items={[-0.55, 0.3].map((x) => ({ position: [x, 0.49, 0.42] }))}
        size={[0.65, 0.55, 0.48]}
        color={palette.paper}
      />
    </group>
  )
}
