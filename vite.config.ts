import { execSync } from 'node:child_process'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { profile, seo } from './src/content/content.ts'
import {
  buildLlmsTxt,
  buildSitemap,
  buildStructuredData,
} from './src/content/seo.ts'

// Last commit that touched the content, so dateModified/lastmod only move when
// the profile actually changes. Falls back to now outside a git checkout.
function contentDate() {
  try {
    const date = execSync(
      'git log -1 --format=%cI -- src/content/content.ts',
      { encoding: 'utf8' },
    ).trim()
    if (date) return new Date(date).toISOString()
  } catch {
    // not a git checkout
  }
  return new Date().toISOString()
}

const date = contentDate()

// Fonts for the h1 and the body text (the LCP element), preloaded in builds.
const preloadedFonts = [
  'space-grotesk-latin-500-normal',
  'inter-latin-400-normal',
]

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'portfolio-metadata',
      generateBundle() {
        if (this.environment.config.build.ssr) return
        this.emitFile({
          type: 'asset',
          fileName: 'llms.txt',
          source: buildLlmsTxt(),
        })
        this.emitFile({
          type: 'asset',
          fileName: 'sitemap.xml',
          source: buildSitemap(date),
        })
      },
      transformIndexHtml(html, ctx) {
        const values: Record<string, string> = {
          __SEO_TITLE__: seo.title,
          __SEO_DESCRIPTION__: seo.description,
          __SEO_URL__: seo.url,
          __SEO_SITE_NAME__: profile.fullName,
          __SEO_IMAGE__: new URL('og-image.png', seo.url).href,
          __SEO_IMAGE_ALT__: seo.imageAlt,
        }
        // ctx.bundle only exists in builds, where the font files are hashed.
        const bundled = Object.keys(ctx.bundle ?? {})
        const tags = preloadedFonts.flatMap((font) => {
          const file = bundled.find(
            (name) =>
              name.startsWith(`assets/${font}-`) && name.endsWith('.woff2'),
          )
          return file
            ? [
                {
                  tag: 'link',
                  attrs: {
                    rel: 'preload',
                    as: 'font',
                    type: 'font/woff2',
                    crossorigin: true,
                    href: `/${file}`,
                  },
                  injectTo: 'head' as const,
                },
              ]
            : []
        })
        return {
          html: html
            .replace(/__SEO_\w+__/g, (key) =>
              values[key]
                .replaceAll('&', '&amp;')
                .replaceAll('<', '&lt;')
                .replaceAll('>', '&gt;')
                .replaceAll('"', '&quot;'),
            )
            .replace('__PERSON_JSON_LD__', () =>
              JSON.stringify(buildStructuredData(date)).replaceAll(
                '<',
                '\\u003c',
              ),
            ),
          tags,
        }
      },
    },
  ],
})
