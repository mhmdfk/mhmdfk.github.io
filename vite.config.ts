import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { seo } from './src/content/content.ts'

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'portfolio-metadata',
      transformIndexHtml(html) {
        const values: Record<string, string> = {
          __SEO_TITLE__: seo.title,
          __SEO_DESCRIPTION__: seo.description,
          __SEO_URL__: seo.url,
          __SEO_IMAGE_ALT__: seo.imageAlt,
        }
        return html
          .replace(/__SEO_\w+__/g, (key) =>
            values[key]
              .replaceAll('&', '&amp;')
              .replaceAll('<', '&lt;')
              .replaceAll('>', '&gt;')
              .replaceAll('"', '&quot;'),
          )
          .replace('__PERSON_JSON_LD__', () =>
            JSON.stringify(seo.person).replaceAll('<', '\\u003c'),
          )
      },
    },
  ],
})
