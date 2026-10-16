import {
  Bloom,
  EffectComposer,
  ToneMapping,
  Vignette,
} from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'

// Loaded only on the full-quality tier, so phones never download or parse the
// postprocessing libraries.
export default function Effects() {
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom
        mipmapBlur
        intensity={0.12}
        luminanceThreshold={1}
        luminanceSmoothing={0.15}
      />
      <Vignette eskil={false} offset={0.2} darkness={0.3} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  )
}
