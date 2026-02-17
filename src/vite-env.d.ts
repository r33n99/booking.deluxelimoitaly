/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface ImportMetaEnv {
  // Environment
  readonly VITE_APP_ENV: string

  // Application URLs
  readonly VITE_APP_URL: string
  readonly VITE_APP_PRODUCTION_URL: string

  // API URLs
  readonly VITE_APP_API_URL: string
  readonly VITE_APP_API_INSP: string

  // API Keys
  readonly VITE_APP_STRIPE_KEY: string
  readonly VITE_APP_STRIPE_KEY_INSP: string
  readonly VITE_APP_GOOGLE_API_KEY: string

  // Centrifugo
  readonly VITE_CENTRIFUGO_BASE_URL: string

  // Analytics and monitoring
  readonly VITE_GTM_ID: string
  readonly VITE_SEED_PAGESENSE: string

  // Sentry
  readonly VITE_SENTRY_DSN: string
  readonly VITE_SENTRY_PROJECT: string

  // Project info
  readonly VITE_PROJECT_TITLE: string
  readonly VITE_PROJECT_URL: string
  readonly VITE_PROJECT_EMAIL: string
  readonly VITE_PROJECT_PHONE: string
  readonly VITE_PROJECT_ADDRESS: string
  readonly VITE_PROJECT_ADDRESS_LINK: string
  readonly VITE_PROJECT_ALIAS: string
  readonly VITE_PROJECT_VERSION: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
