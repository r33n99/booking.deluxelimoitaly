;(function optimizeCriticalResources() {
  const projectAlias = import.meta.env.VITE_PROJECT_ALIAS

  const criticalFonts = [
    { name: 'BasierCircle-Regular.woff2', weight: 400 },
    { name: 'BasierCircle-Medium.woff2', weight: 500 }
  ]

  // Preload только в dev режиме, в production Vite сам оптимизирует
  if (import.meta.env.DEV) {
    criticalFonts.forEach((font) => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'font'
      link.type = 'font/woff2'
      link.crossOrigin = 'anonymous'
      link.href = `/src/assets/${projectAlias}/fonts/${font.name}`
      document.head.appendChild(link)
    })
  }
})()

const stylesReady = Promise.allSettled([
  import('./assets/main.css'),
  import('~project_assets/project_style.css')
])

import { createApp, nextTick } from 'vue'
import App from '@/App.vue'
import router from '@/router/index.js'
import storage from '@/plugins/storage'
import appAxios from '@/plugins/axios'
import utils from '@/plugins/utils'
import { init, captureException, vueRouterInstrumentation } from '@sentry/vue'
import { BrowserTracing } from '@sentry/browser'
import { createPinia } from 'pinia'
import { piniaSentryPlugin } from '@/plugins/piniaSentry'
import { createGtm } from '@gtm-support/vue-gtm'
import loadGoogleMapsApi from 'load-google-maps-api'
import VueGoogleMaps from '@fawmi/vue-google-maps'
import logAppVersion from '@/plugins/appVersion'
import vSafeHtml from '@/directives/safeHtml'

logAppVersion()

const pinia = createPinia()
pinia.use(piniaSentryPlugin)
const app = createApp(App)

app.directive('safe-html', vSafeHtml)

/**
 * Plugin install
 */
app.use(router)
app.use(pinia)
app.use(appAxios, {
  baseUrl: import.meta.env.VITE_APP_API_URL
})

// Динамическая загрузка VueTelInput - загружается только при необходимости
let vueTelInputLoaded = false
const loadVueTelInput = async () => {
  if (vueTelInputLoaded) return
  vueTelInputLoaded = true
  const VueTelInput = (await import('vue-tel-input')).default
  const globalOptions = {
    mode: 'international',
    inputOptions: {
      placeholder: 'Mobile Phone Number',
      autocomplete: 'off'
    },
    autoFormat: false,
    dropdownOptions: [
      {
        showDialCodeInSelection: true,
        showFlags: true
      }
    ]
  }
  app.use(VueTelInput, globalOptions)
}

// Экспортируем функцию для использования в router
if (typeof window !== 'undefined') {
  window.__loadVueTelInput = loadVueTelInput
}

const loadAnalytics = () => {
  if (import.meta.env.VITE_GTM_ID) {
    app.use(
      createGtm({
        id: import.meta.env.VITE_GTM_ID,
        defer: true,
        compatibility: false,
        enabled: true,
        debug: true,
        vueRouter: router
      })
    )
  }
}

/**
 * Provides install
 */
app.provide('storage', storage)
app.provide('utils', utils)

const regexLink =
  /^(?!.*(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})).*$/g
const regexIsHttps = /^(?!.*ftp|https|http|www).*$/g
const regexNameField = /^(?!.*[!@#$%^*_<>]).*$/g
const regexEmail =
  /^[_a-zA-Z0-9-]+(\.[_a-zA-Z0-9-]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*(\.[a-zA-Z]{2,3})$/g

app.provide('regexLink', regexLink)
app.provide('regexIsHttps', regexIsHttps)
app.provide('regexNameField', regexNameField)
app.provide('regexEmail', regexEmail)

if (import.meta.env.VITE_APP_ENV !== 'local') {
  const isProduction = import.meta.env.MODE === 'production' || import.meta.env.MODE === 'staging'

  init({
    app,
    environment: import.meta.env.VITE_APP_ENV,
    dsn: import.meta.env.VITE_SENTRY_DSN,
    ignoreErrors: ['Blocked a frame with origin'],
    integrations: [
      new BrowserTracing({
        tracePropagationTargets: [
          'localhost',
          import.meta.env.VITE_APP_URL,
          import.meta.env.VITE_APP_PRODUCTION_URL
        ],
        routingInstrumentation: vueRouterInstrumentation(router)
      })
    ],
    tracesSampleRate: isProduction ? 0.1 : 1.0
  })
}

let googleMapsLoaded = false
let googleMapsLoading = false
let googleMapsPluginInstalled = false

const loadGoogleMaps = async (retries = 3, delay = 2000) => {
  if (googleMapsLoaded || (typeof google !== 'undefined' && window.google?.maps)) {
    googleMapsLoaded = true
    return
  }
  if (googleMapsLoading) {
    // Ждем завершения текущей загрузки
    while (googleMapsLoading) {
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
    return
  }

  googleMapsLoading = true
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      let observer = null
      const addAsyncToScript = () => {
        observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
              if (
                node.tagName === 'SCRIPT' &&
                node.src &&
                node.src.includes('maps.googleapis.com/maps/api/js')
              ) {
                if (!node.src.includes('loading=async')) {
                  node.src += (node.src.includes('?') ? '&' : '?') + 'loading=async'
                  node.async = true
                  if (observer) observer.disconnect()
                }
              }
            })
          })
        })
        observer.observe(document.head, { childList: true, subtree: true })
        setTimeout(() => {
          if (observer) observer.disconnect()
        }, 5000)
      }

      addAsyncToScript()

      await loadGoogleMapsApi({
        key: import.meta.env.VITE_APP_GOOGLE_API_KEY,
        libraries: ['places', 'drawing', 'geometry'],
        v: 'quarterly',
        language: 'en',
        timeout: 30000
      })

      if (observer) observer.disconnect()

      googleMapsLoaded = true
      googleMapsLoading = false

      // Устанавливаем плагин VueGoogleMaps после загрузки
      if (!googleMapsPluginInstalled) {
        app.use(VueGoogleMaps)
        googleMapsPluginInstalled = true
      }

      return
    } catch (err) {
      const isLastAttempt = attempt === retries
      const errorDetails = {
        attempt,
        totalRetries: retries,
        apiKey: import.meta.env.VITE_APP_GOOGLE_API_KEY ? 'present' : 'missing',
        error: err?.message || String(err)
      }

      if (isLastAttempt) {
        googleMapsLoading = false
        captureException(new Error('Failed to load Google Maps API after retries'), {
          extra: errorDetails
        })
        console.error('[Google Maps] Failed to load after', retries, 'attempts:', errorDetails)
        throw err
      } else {
        console.warn(`[Google Maps] Attempt ${attempt} failed, retrying in ${delay}ms...`)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }
}

// Отложенная загрузка Google Maps при взаимодействии пользователя или скролле
const initGoogleMapsLazy = () => {
  let initialized = false
  const init = () => {
    if (initialized) return
    initialized = true
    loadGoogleMaps().catch((err) => {
      console.error('Lazy Google Maps load failed', err)
    })
  }

  // Загружаем при первом взаимодействии
  const interactionEvents = ['mousedown', 'touchstart', 'keydown', 'scroll', 'click']
  interactionEvents.forEach((event) => {
    document.addEventListener(
      event,
      () => {
        init()
      },
      { passive: true, once: true }
    )
  })

  // Загружаем при скролле (даже без взаимодействия) с задержкой
  let scrollTimeout
  window.addEventListener(
    'scroll',
    () => {
      if (!initialized) {
        clearTimeout(scrollTimeout)
        scrollTimeout = setTimeout(() => {
          init()
        }, 2000) // Увеличиваем задержку до 2 секунд
      }
    },
    { passive: true }
  )
}

const startApp = async () => {
  try {
    await stylesReady
  } catch (err) {
    console.error('Styles load failed', err)
  }
  app.mount('#app')
  nextTick(() => {
    initGoogleMapsLazy()
  })
}

startApp()

nextTick(() => {
  let analyticsLoaded = false
  const initAnalytics = () => {
    if (!analyticsLoaded) {
      analyticsLoaded = true
      loadAnalytics()
    }
  }

  if ('requestIdleCallback' in window) {
    requestIdleCallback(initAnalytics, { timeout: 5000 })
  } else {
    setTimeout(initAnalytics, 5000)
  }

  const userInteractionEvents = ['mousedown', 'touchstart', 'keydown']
  userInteractionEvents.forEach((event) => {
    document.addEventListener(event, initAnalytics, { passive: true, once: true })
  })
})
