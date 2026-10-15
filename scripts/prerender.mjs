import { readFile, rm, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { build } from 'vite'

const root = new URL('../', import.meta.url)
const ssrDirectory = new URL('dist-ssr/', root)

try {
  await build({
    root: fileURLToPath(root),
    build: {
      ssr: 'src/entry-server.tsx',
      outDir: 'dist-ssr',
      copyPublicDir: false,
    },
  })

  const { render } = await import(new URL('entry-server.js', ssrDirectory).href)
  const indexPath = new URL('dist/index.html', root)
  const template = await readFile(indexPath, 'utf8')
  const placeholder = '<div id="root"></div>'
  if (!template.includes(placeholder)) {
    throw new Error(
      'Prerender root placeholder is missing from dist/index.html',
    )
  }
  const html = template.replace(
    placeholder,
    () => '<div id="root">' + render() + '</div>',
  )
  await writeFile(indexPath, html)
  await writeFile(new URL('dist/404.html', root), html)
} finally {
  await rm(ssrDirectory, { recursive: true, force: true })
}
