export type SceneQuality = 'high' | 'low' | 'off'

type DeviceNavigator = Navigator & {
  deviceMemory?: number
  connection?: { saveData?: boolean }
}

export function detectQuality(): SceneQuality {
  const device = navigator as DeviceNavigator
  if (
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    device.connection?.saveData
  )
    return 'off'

  let gl: WebGLRenderingContext | WebGL2RenderingContext | null = null
  try {
    const canvas = document.createElement('canvas')
    gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
    if (!gl || gl.isContextLost()) return 'off'

    let software = false
    try {
      const debug = gl.getExtension('WEBGL_debug_renderer_info')
      const renderer = debug
        ? String(gl.getParameter(debug.UNMASKED_RENDERER_WEBGL))
        : ''
      software =
        /swiftshader|llvmpipe|softpipe|software|swrast|microsoft basic render|lavapipe/i.test(
          renderer,
        )
    } catch {
      // Renderer details may be restricted by the browser.
    }
    return window.matchMedia('(pointer: coarse)').matches ||
      window.innerWidth < 768 ||
      (device.deviceMemory !== undefined && device.deviceMemory <= 4) ||
      (device.hardwareConcurrency > 0 && device.hardwareConcurrency <= 4) ||
      software
      ? 'low'
      : 'high'
  } catch {
    return 'off'
  } finally {
    try {
      gl?.getExtension('WEBGL_lose_context')?.loseContext()
    } catch {
      // Context cleanup is optional on restricted implementations.
    }
  }
}
