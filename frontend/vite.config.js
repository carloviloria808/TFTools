import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'logo.png'],
      manifest: {
        name: 'TFTools — TFT Set 17 Companion',
        short_name: 'TFTools',
        description: 'Comp tier list, team builder, and game data for Teamfight Tactics Set 17.',
        theme_color: '#0e1015',
        background_color: '#0e1015',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        icons: [
          { src: '/logo.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/logo.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        ],
      },
      workbox: {
        // Don't precache the giant logo or source maps; runtime-cache instead
        globPatterns: ['**/*.{js,css,html,svg,woff2}'],
        runtimeCaching: [
          {
            // Champion/item art from CommunityDragon + CDNs
            urlPattern: /^https:\/\/(raw\.communitydragon\.org|cdn\.metatft\.com|cmsassets\.rgpub\.io)\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'tft-images',
              expiration: { maxEntries: 400, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
    }),
  ],
})
