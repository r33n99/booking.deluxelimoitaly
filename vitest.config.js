/// <reference types="vitest" />
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '~project_assets': fileURLToPath(new URL('./src/assets/' + env.VITE_PROJECT_ALIAS, import.meta.url)),
        'virtual:pwa-register/vue': fileURLToPath(new URL('./tests/unit/mocks/pwa-register.js', import.meta.url))
      }
    },
    test: {
      // Общие настройки
      globals: true,
      environment: 'happy-dom',
      
      // Включаем файлы тестов
      include: [
        'tests/unit/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx,vue}',
        'tests/integration/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx,vue}'
      ],
      
      // Setup файлы
      setupFiles: [
        'tests/unit/setup/vitest.setup.js'
      ],
      
      // Настройки coverage
      coverage: {
        provider: 'c8',
        reporter: ['text', 'json', 'html'],
        reportsDirectory: 'tests/coverage',
        exclude: [
          'node_modules/',
          'tests/',
          'playwright.config.js',
          'vite.config.js',
          'vitest.config.js',
          'tailwind.config.js',
          'postcss.config.js',
          '**/*.d.ts',
          'public/',
          'dist/'
        ],
        // Целевые показатели покрытия
        thresholds: {
          global: {
            branches: 70,
            functions: 70,
            lines: 70,
            statements: 70
          }
        }
      },
      
      // Настройки таймаутов
      testTimeout: 10000,
      hookTimeout: 10000,
      
      // Подавление предупреждений для определенных модулей
      outputFile: {
        json: 'tests/coverage/coverage.json',
        html: 'tests/coverage/index.html'
      }
    },
    server: {
      deps: {
        // Обработка внешних зависимостей в тестах
        inline: [
          '@vue',
          '@vueuse',
          'vue-demi'
        ]
      }
    },
    // Для поддержки geojson файлов в тестах
    assetsInclude: ['**/*.geojson']
  }
}) 