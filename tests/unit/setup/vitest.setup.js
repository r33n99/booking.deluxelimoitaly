import { vi } from 'vitest'
import '@testing-library/jest-dom'

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), 
    removeListener: vi.fn(), 
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

const createStorage = () => {
  let store = {}
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value !== null && value !== undefined ? value.toString() : String(value)
    }),
    removeItem: vi.fn((key) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
    key: vi.fn((index) => Object.keys(store)[index] || null),
    get length() { return Object.keys(store).length },
    _getStore: () => store,
    _setStore: (newStore) => store = newStore
  }
}

Object.defineProperty(window, 'localStorage', {
  value: createStorage(),
  writable: true
})

Object.defineProperty(window, 'sessionStorage', {
  value: createStorage(),
  writable: true
})

global.localStorage = window.localStorage
global.sessionStorage = window.sessionStorage

Object.defineProperty(window.URL, 'createObjectURL', {
  value: vi.fn(() => 'mocked-url'),
})

Object.defineProperty(window.URL, 'revokeObjectURL', {
  value: vi.fn(),
})

global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

console.warn = vi.fn()

vi.stubGlobal('setTimeout', vi.fn())
vi.stubGlobal('setInterval', vi.fn())
vi.stubGlobal('clearTimeout', vi.fn())
vi.stubGlobal('clearInterval', vi.fn())

// Глобальные переменные окружения для тестов
process.env.NODE_ENV = 'test'
process.env.VITE_PROJECT_ALIAS = 'dli' // По умолчанию для тестов

// Настройка fetch мока (для API запросов)
global.fetch = vi.fn()

// Мок для Google Maps (если используется)
global.google = {
  maps: {
    Map: vi.fn(),
    Marker: vi.fn(),
    InfoWindow: vi.fn(),
    LatLng: vi.fn(),
    places: {
      Autocomplete: vi.fn(),
      PlacesService: vi.fn(),
    },
    geometry: {
      spherical: {
        computeDistanceBetween: vi.fn(),
      },
    },
  },
}

// Мок для navigator.geolocation
Object.defineProperty(navigator, 'geolocation', {
  value: {
    getCurrentPosition: vi.fn((success) => 
      success({
        coords: {
          latitude: 51.1,
          longitude: 45.3,
        },
      })
    ),
    watchPosition: vi.fn(),
    clearWatch: vi.fn(),
  },
  writable: true,
})

// Подавление ошибок Vue для тестового окружения
const originalError = console.error
console.error = (...args) => {
  if (
    args[0]?.includes?.('Failed to resolve component') ||
    args[0]?.includes?.('[Vue warn]')
  ) {
    return
  }
  originalError(...args)
} 