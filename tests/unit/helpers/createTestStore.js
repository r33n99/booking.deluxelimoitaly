import { createPinia, setActivePinia } from 'pinia'
import { createTestingPinia } from '@pinia/testing'
import { vi, expect } from 'vitest'

// Импорты stores для тестов форм
import { useOrderStore } from '@/stores/ride/order'
import { useMainStore } from '@/stores/ui/main'
import { useTrustyStore } from '@/stores/data/trustyComplete'
import { useUserStore } from '@/stores/user/profile'
import { useCarsStore } from '@/stores/ride/cars'
import { useCentrifugoStore } from '@/stores/data/centrifugo'

/**
 * Создает изолированное тестовое окружение для Pinia store
 * 
 * @param {Function} storeDefinition - Определение store (useStore функция)
 * @param {Object} options - Опции настройки
 * @param {Object} options.initialState - Начальное состояние store
 * @param {Object} options.stubActions - Мокировать ли actions (по умолчанию true)
 * @param {Object} options.plugins - Дополнительные плагины для Pinia
 * @returns {Object} - Объект с store и утилитами для тестирования
 */
export function createTestStore(storeDefinition, options = {}) {
  const {
    initialState = {},
    stubActions = true,
    plugins = []
  } = options

  // Создание тестового Pinia instance
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    stubActions,
    plugins
  })

  setActivePinia(pinia)

  // Создание store
  const store = storeDefinition()

  // Установка начального состояния, если передано
  if (Object.keys(initialState).length > 0) {
    Object.keys(initialState).forEach(key => {
      if (key in store) {
        store[key] = initialState[key]
      }
    })
  }

  return {
    store,
    pinia,
    
    /**
     * Сброс store к начальному состоянию
     */
    reset: () => {
      store.$reset()
      if (Object.keys(initialState).length > 0) {
        Object.keys(initialState).forEach(key => {
          if (key in store) {
            store[key] = initialState[key]
          }
        })
      }
    },

    /**
     * Обновление состояния store
     */
    setState: (newState) => {
      Object.keys(newState).forEach(key => {
        if (key in store) {
          store[key] = newState[key]
        }
      })
    },

    /**
     * Получение всего состояния store
     */
    getState: () => {
      const state = {}
      Object.keys(store.$state).forEach(key => {
        state[key] = store[key]
      })
      return state
    },

    /**
     * Мокирование action
     */
    mockAction: (actionName, implementation) => {
      if (store[actionName]) {
        vi.mocked(store[actionName]).mockImplementation(implementation)
      }
    },

    /**
     * Проверка вызова action
     */
    expectActionCalled: (actionName, ...args) => {
      expect(store[actionName]).toHaveBeenCalledWith(...args)
    },

    /**
     * Получение количества вызовов action
     */
    getActionCallCount: (actionName) => {
      return store[actionName].mock?.calls?.length || 0
    }
  }
}

/**
 * Создает реальный (не замоканный) store для интеграционных тестов
 */
export function createRealStore(storeDefinition, initialState = {}) {
  const pinia = createPinia()
  setActivePinia(pinia)
  
  const store = storeDefinition()
  
  if (Object.keys(initialState).length > 0) {
    Object.keys(initialState).forEach(key => {
      if (key in store) {
        store[key] = initialState[key]
      }
    })
  }

  return { store, pinia }
}

/**
 * Хелпер для создания мок данных API ответов
 */
export function createApiResponse(data, options = {}) {
  const {
    status = 200,
    message = 'Success',
    delay = 0
  } = options

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (status >= 200 && status < 300) {
        resolve({
          data,
          status,
          message,
          ok: true
        })
      } else {
        reject({
          response: {
            data: { message },
            status
          },
          message,
          ok: false
        })
      }
    }, delay)
  })
}

/**
 * Хелпер для создания мок данных пользователя
 */
export function createMockUser(overrides = {}) {
  return {
    id: 1,
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    phone: '+1234567890',
    isActive: true,
    role: 'user',
    createdAt: new Date().toISOString(),
    ...overrides
  }
}

/**
 * Хелпер для создания мок данных заказа
 */
export function createMockOrder(overrides = {}) {
  return {
    id: 1,
    type: 'one-way',
    status: 'pending',
    pickupLocation: {
      address: 'Test Address 1',
      lat: 51.1,
      lng: 45.3
    },
    dropoffLocation: {
      address: 'Test Address 2',
      lat: 51.2,
      lng: 45.4
    },
    pickupDate: new Date().toISOString(),
    pickupTime: '10:00',
    passengers: 2,
    price: 100,
    currency: 'USD',
    createdAt: new Date().toISOString(),
    ...overrides
  }
}

/**
 * Хелпер для создания мок данных автомобиля
 */
export function createMockCar(overrides = {}) {
  return {
    id: 1,
    name: 'Test Car',
    type: 'sedan',
    capacity: 4,
    pricePerKm: 2.5,
    image: 'test-car.jpg',
    features: ['AC', 'WiFi'],
    isAvailable: true,
    ...overrides
  }
} 

/**
 * Создает все необходимые stores для тестов форм
 * 
 * @param {Object} options - Опции настройки
 * @param {boolean} options.stubActions - Мокировать ли actions (по умолчанию true)
 * @returns {Object} - Объект со всеми stores для тестов форм
 */
export function createFormTestStores(options = {}) {
  const { stubActions = true } = options

  // Создание тестового Pinia instance
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    stubActions
  })

  setActivePinia(pinia)

  // Создание всех необходимых stores
  const orderStore = useOrderStore()
  const mainStore = useMainStore()
  const trustyStore = useTrustyStore()
  const userStore = useUserStore()
  const carsStore = useCarsStore()
  const centrifugoStore = useCentrifugoStore()

  // Установка базовых значений для форм
  if (stubActions) {
    // Мокируем основные actions
    orderStore.update = vi.fn()
    orderStore.updateStorage = vi.fn().mockResolvedValue({
      data: {
        data: {
          id: 'test-order-id'
        }
      }
    })
    trustyStore.validateEuAddress = vi.fn().mockReturnValue(true)
    centrifugoStore.send = vi.fn()
    carsStore.selectCar = vi.fn()
    carsStore.update = vi.fn()
  }

  return {
    orderStore,
    mainStore,
    trustyStore,
    userStore,
    carsStore,
    centrifugoStore,
    pinia
  }
} 