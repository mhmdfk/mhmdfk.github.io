import { anchors, palette } from '../layout'
import { Block, Blocks } from '../primitives'

const cards = Array.from({ length: 7 }, (_, i) => ({
  position: [((i % 3) - 1) * 0.62, Math.floor(i / 3) * 0.57 - 0.55, 0.13] as [
    number,
    number,
    number,
  ],
}))

const strings = [
  [0, 4],
  [1, 3],
  [3, 6],
  [4, 6],
] as const

export function Corkboard() {
  return (
    <group
      position={anchors.corkboard.position}
      rotation={[0, -Math.PI / 2, 0]}
    >
      <Block
        position={[0, 0, 0]}
        size={[2.5, 2.1, 0.12]}
        color={palette.wood}
      />
      <Block position={[0, 0, 0.07]} size={[2.3, 1.9, 0.03]} color="#8d7355" />
      <Blocks items={cards} size={[0.44, 0.4, 0.025]} color={palette.paper} />
      <Blocks
        items={cards.map(({ position: [x, y] }) => ({
          position: [x, y + 0.16, 0.17],
        }))}
        size={[0.06, 0.06, 0.04]}
        color={palette.accent}
      />
      {strings.map(([from, to]) => {
        const [x1, y1] = cards[from].position
        const [x2, y2] = cards[to].position
        const dx = x2 - x1
        const dy = y2 - y1

        return (
          <group
            key={`${from}-${to}`}
            position={[(x1 + x2) / 2, (y1 + y2) / 2 + 0.16, 0.17]}
            rotation={[0, 0, Math.atan2(dy, dx)]}
          >
            <Block
              position={[0, 0, 0]}
              size={[Math.hypot(dx, dy), 0.012, 0.012]}
              color="#bba18b"
            />
          </group>
        )
      })}
    </group>
  )
}
