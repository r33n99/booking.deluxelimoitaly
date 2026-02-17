/* eslint-env node */
import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

import { sentryVitePlugin } from '@sentry/vite-plugin'
import viteCompression from 'vite-plugin-compression'

let checker

export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  if (!checker) {
    const checkerModule = await import('vite-plugin-checker')
    checker = checkerModule.checker || checkerModule.default
  }
  const isProduction = mode === 'production' || mode === 'staging'
  
  // Увеличиваем таймаут для sentry-cli до 120 секунд (по умолчанию 30)
  if (!process.env.SENTRY_HTTP_TIMEOUT) {
    process.env.SENTRY_HTTP_TIMEOUT = '120'
  }

  const projectAlias = env.VITE_PROJECT_ALIAS || 'dli'
  const otherProjects = ['dli', 'rlt', 'dgt'].filter((p) => p !== projectAlias)
  const projectGlobIgnores = otherProjects.map((p) => `**/images/${p}/**/*`)

  return {
    build: {
      sourcemap: isProduction,
      minify: isProduction ? 'esbuild' : false,
      target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
      cssCodeSplit: false,
      chunkSizeWarningLimit: 500,
      rollupOptions: {
        plugins: [
          {
            name: 'asset-path-rewriter',
            resolveId(source) {
              if (source.startsWith('~project_assets')) {
                return require.resolve(
                  `./src/assets/${env.VITE_PROJECT_ALIAS}/${source.split('/')[1]}`
                )
              }
            }
          },
        ],
        output: {
          manualChunks: (id) => {
            // Vendor libraries разделяем по категориям
            if (id.includes('node_modules')) {
              // Разбиваем vendor-core на отдельные чанки для лучшей загрузки
              if (id.includes('vue') && !id.includes('vue-router') && !id.includes('pinia')) {
                return 'vendor-vue'
              }
              if (id.includes('vue-router')) {
                return 'vendor-router'
              }
              if (id.includes('pinia')) {
                return 'vendor-pinia'
              }
              if (id.includes('@fawmi/vue-google-maps') ||
                  id.includes('google-maps') ||
                  id.includes('@googlemaps') ||
                  id.includes('supercluster') ||
                  id.includes('kdbush') ||
                  id.includes('load-google-maps-api')) {
                return 'vendor-maps'
              }
              // UI Components - отдельный чанк для загрузки по требованию
              if (id.includes('flowbite') ||
                  id.includes('swiper') ||
                  id.includes('@vuepic/vue-datepicker') ||
                  id.includes('@takuma-ru/vue-swipe-modal')) {
                return 'vendor-ui'
              }
              // vue-tel-input - отдельный чанк для динамической загрузки
              if (id.includes('vue-tel-input')) {
                return 'vendor-tel-input'
              }
              // Utils
              if (
                id.includes('dayjs') ||
                id.includes('axios') ||
                id.includes('libphonenumber-js') ||
                id.includes('collect.js')
              ) {
                return 'vendor-utils'
              }
              // Sentry без replay для уменьшения размера
              if (id.includes('@sentry')) {
                // Исключаем Replay/rrweb из бандла полностью
                if (id.includes('replay') || id.includes('rrweb') || id.includes('@sentry-internal/rrweb')) {
                  return null
                }
                return 'vendor-sentry'
              }
              // Validation
              if (id.includes('vee-validate') || id.includes('yup')) {
                return 'vendor-validation'
              }
              // Stripe для отдельного чанка
              if (id.includes('@stripe')) {
                return 'vendor-stripe'
              }
              // Centrifuge для отдельного чанка
              if (id.includes('centrifuge') || id.includes('jwt-decode')) {
                return 'vendor-centrifuge'
              }
              // Исключаем devtools из production build
              if (isProduction && (id.includes('@vue/devtools') || id.includes('devtools'))) {
                return null
              }
              return 'vendor-other'
            }
          },
          external: isProduction ? (id) => {
            // Исключаем Vue devtools и Sentry Replay из production bundle
            if (id.includes('@vue/devtools') || id.includes('@sentry-internal/rrweb') || id.includes('/replay')) {
              return true
            }
            return false
          } : undefined,
          chunkFileNames: isProduction
            ? 'assets/[name]-[hash].js'
            : 'assets/[name].js',
          entryFileNames: isProduction
            ? 'assets/[name]-[hash].js'
            : 'assets/[name].js',
          assetFileNames: isProduction
            ? 'assets/[name]-[hash].[ext]'
            : 'assets/[name].[ext]'
        }
      },
      reportCompressedSize: false,
      cssMinify: true
    },
    esbuild: {
      drop: isProduction ? ['console', 'debugger'] : [],
      legalComments: 'none',
      treeShaking: true,
      exclude: isProduction ? ['@vue/devtools'] : [],
      target: 'es2020',
      minifyIdentifiers: isProduction,
      minifySyntax: isProduction,
      minifyWhitespace: isProduction
    },
    plugins: [
      vue(),
      {
        name: 'async-css-loader',
        transformIndexHtml: {
          enforce: 'post',
          transform(html, _ctx) {
            if (!isProduction) return html
            return html.replace(
              /<link([^>]*rel=["']stylesheet["'][^>]*)>/g,
              (match, attrs) => {
                if (attrs.includes('data-critical') || 
                    attrs.includes('data-async') || 
                    attrs.includes('media=') ||
                    attrs.includes('critical.css')) {
                  return match
                }
                const hrefMatch = attrs.match(/href=["']([^"']+)["']/)
                if (hrefMatch) {
                  const href = hrefMatch[1]
                  return `<link rel="preload" as="style" href="${href}" onload="this.onload=null;this.rel='stylesheet'"><noscript>${match}</noscript>`
                }
                return match
              }
            )
          }
        },
        generateBundle(_options, _bundle) {
        }
      },
      checker({
        vueTsc: true,
      }),
      sentryVitePlugin({
        org: 'trustyone',
        project: env.SENTRY_PROJECT,
        authToken: env.SENTRY_AUTH_TOKEN,
        errorHandler: (err, _invokeErr, _compilation) => {
          console.warn('Sentry upload error:', err.message)
        }
      }),
      VitePWA({
        registerType: 'autoUpdate',
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,ttf,eot}'],
          globIgnores: projectGlobIgnores,
          runtimeCaching: [
            {
              urlPattern: ({ request }) => request.destination === 'style' || request.destination === 'script' || request.destination === 'worker',
              handler: 'CacheFirst',
              options: {
                cacheName: 'static-assets',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
                },
              },
            },
            {
              urlPattern: ({ request }) => request.destination === 'image',
              handler: 'CacheFirst',
              options: {
                cacheName: 'images',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 24 * 60 * 60, // 60 Days
                },
              },
            },
            {
              urlPattern: ({ request }) => request.destination === 'font',
              handler: 'CacheFirst',
              options: {
                cacheName: 'fonts',
                expiration: {
                  maxEntries: 30,
                  maxAgeSeconds: 60 * 24 * 60 * 60, // 60 Days
                },
              },
            },
          ]
        },
        includeAssets: [`/images/${projectAlias}/favicon.png`],
        manifest: {
          'name': env.VITE_PROJECT_TITLE,
          'short_name': env.VITE_PROJECT_TITLE,
          'start_url': '/',
          'scope': '.',
          'display': 'standalone',
          'background_color': '#fff',
          'theme_color': '#2B2D32',
          'description': 'Booking platform use ' + env.VITE_PROJECT_TITLE,
          'dir': 'ltr',
          'lang': 'en-US',
          'icons': [
            {
              'src': '/images/' + env.VITE_PROJECT_ALIAS + '/icons/android/android-launchericon-192-192.png',
              'sizes': '192x192',
              'type': 'image/png',
              'purpose': 'any maskable'
            },
            {
              'src': '/images/' + env.VITE_PROJECT_ALIAS + '/icons/android/android-launchericon-512-512.png',
              'sizes': '512x512',
              'type': 'image/png',
              'purpose': 'any maskable'
            },
            {
              'src': '/images/' + env.VITE_PROJECT_ALIAS + '/icons/ios/180.png',
              'sizes': '180x180',
              'type': 'image/png'
            },
            {
              'src': '/images/' + env.VITE_PROJECT_ALIAS + '/icons/ios/512.png',
              'sizes': '512x512',
              'type': 'image/png'
            }
          ]
        }
      }),
      viteCompression({
        verbose: false,
        disable: !isProduction,
        threshold: 1024,
        algorithm: 'gzip',
        ext: '.gz',
        deleteOriginFile: false
      }),
      viteCompression({
        verbose: false,
        disable: !isProduction,
        threshold: 1024,
        algorithm: 'brotliCompress',
        ext: '.br',
        deleteOriginFile: false
      })
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '~project_assets': fileURLToPath(new URL('./src/assets/' + projectAlias, import.meta.url))
      }
    },
    assetsInclude: ['**/*.geojson'],
    optimizeDeps: {
      include: [
        'vue',
        'vue-router',
        'pinia',
        'axios',
        'fast-deep-equal'
      ],
      exclude: [
        '@sentry/vue',
        '@vue/devtools',
        '@sentry-internal/rrweb',
        '@sentry/replay',
        '@sentry-internal/replay'
      ],
      force: false,
      needsInterop: ['fast-deep-equal'],
      esbuildOptions: {
        target: 'es2020'
      }
    },
    preview: {
      port: 4173,
      strictPort: false
    }
  }
})