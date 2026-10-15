import { MonitorScreen } from './MonitorScreen'
import { anchors, palette } from '../layout'
import { Block, Blocks } from '../primitives'

export function Desk() {
  return (
    <group position={anchors.desk.position}>
      <Block
        rounded
        position={[0, 1.15, 0]}
        size={[2.7, 0.15, 1.2]}
        color={palette.wood}
      />
      <Blocks
        size={[0.12, 1.1, 0.12]}
        color={palette.metal}
        items={[-1.15, 1.15].flatMap((x) =>
          [-0.45, 0.45].map((z) => ({ position: [x, 0.55, z] })),
        )}
      />
      <Block
        rounded
        position={[0, 1.4, -0.25]}
        size={[0.12, 0.5, 0.12]}
        color={palette.metal}
      />
      <Block
        rounded
        position={[0, 1.85, -0.25]}
        size={[1.4, 0.85, 0.12]}
        color={palette.metal}
      />
      <MonitorScreen />
      <Block
        rounded
        position={[0, 1.25, 0.3]}
        size={[0.85, 0.05, 0.27]}
        color={palette.metal}
      />
      <Block
        rounded
        position={[0, 0.65, 1.1]}
        size={[0.85, 0.18, 0.8]}
        color={palette.fabric}
      />
      <Block
        rounded
        position={[0, 1.1, 1.45]}
        size={[0.85, 0.85, 0.14]}
        color={palette.fabric}
      />
      <Blocks
        size={[0.075, 0.6, 0.075]}
        color={palette.wood}
        items={[-0.32, 0.32].flatMap((x) =>
          [0.83, 1.38].map((z) => ({ position: [x, 0.3, z] })),
        )}
      />
      <Block
        rounded
        position={[0, 1.26, -0.24]}
        size={[0.48, 0.06, 0.3]}
        color={palette.metal}
      />
      <Block
        rounded
        position={[0.94, 1.25, 0.23]}
        size={[0.3, 0.04, 0.4]}
        color={palette.accent}
      />
    </group>
  )
}
