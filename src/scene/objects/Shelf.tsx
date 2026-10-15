import { anchors, palette } from '../layout'
import { Block, Blocks } from '../primitives'

export function Shelf() {
  return (
    <group position={anchors.shelf.position} rotation={[0, Math.PI / 2, 0]}>
      <Block
        rounded
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
            1.05 + Math.floor(i / 6) * 0.85 + (0.42 + (i % 4) * 0.09) / 2,
            0.42,
          ],
          scale: [0.8 + (i % 3) * 0.15, (0.42 + (i % 4) * 0.09) / 0.55, 1],
          color: [
            palette.fabric,
            palette.accent,
            palette.paper,
            '#b47c61',
            '#778d99',
          ][i % 5],
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
