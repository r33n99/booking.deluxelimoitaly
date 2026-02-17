import { mount, shallowMount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { createRouter, createWebHistory } from 'vue-router'
import { vi, expect } from 'vitest'

/**
 * Универсальный хелпер для монтирования Vue компонентов в тестах
 * 
 * @param {Object} component - Vue компонент для монтирования
 * @param {Object} options - Опции для настройки
 * @param {boolean} options.shallow - Использовать shallowMount вместо mount
 * @param {Object} options.props - Props для компонента
 * @param {Object} options.slots - Слоты для компонента
 * @param {Object} options.global - Глобальные настройки
 * @param {Object} options.pinia - Настройки для Pinia
 * @param {Object} options.router - Настройки для Router
 * @param {Object} options.provide - Provide/inject значения
 * @param {Object} options.data - Начальные данные компонента
 * @param {Object} options.computed - Мокированные computed свойства
 * @param {Object} options.methods - Мокированные методы
 * @returns {Object} - Wrapper компонента
 */
export function mountComponent(component, options = {}) {
  const {
    shallow = false,
    props = {},
    slots = {},
    global = {},
    pinia = {},
    router = {},
    provide = {},
    data,
    computed,
    methods,
    ...restOptions
  } = options

  // Мок плагина storage
  const mockStoragePlugin = () => ({
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  })

  // Создание тестового Pinia store
  const testingPinia = createTestingPinia({
    createSpy: vi.fn,
    stubActions: true,
    ...pinia,
  })

  // Создание тестового роутера
  const testRouter = createRouter({
    history: createWebHistory(),
    routes: [
      { path: '/', component: { template: '<div>Home</div>' } },
      { path: '/test', component: { template: '<div>Test</div>' } },
      ...Object.values(router.routes || {})
    ]
  })

  // Настройка глобальных зависимостей
  const globalConfig = {
    plugins: [
      testingPinia,
      mockStoragePlugin, // <--- Добавляем мок сюда
      ...(router.enabled !== false ? [testRouter] : []),
      ...(global.plugins || [])
    ],
    components: {
      ...(global.components || {})
    },
    directives: {
      ...(global.directives || {})
    },
    provide: {
      ...provide,
      ...(global.provide || {})
    },
    mocks: {
      $t: (key) => key, // Мок для i18n
      $route: {
        path: '/',
        params: {},
        query: {},
        ...(router.route || {})
      },
      $router: {
        push: vi.fn(),
        replace: vi.fn(),
        go: vi.fn(),
        back: vi.fn(),
        forward: vi.fn(),
        ...(router.mocks || {})
      },
      ...(global.mocks || {})
    },
    stubs: {
      'router-link': true,
      'router-view': true,
      ...(global.stubs || {})
    }
  }

  // Подготовка опций для монтирования
  const mountOptions = {
    props,
    slots,
    global: globalConfig,
    ...restOptions
  }

  // Добавление data, computed, methods если они переданы
  if (data) {
    mountOptions.data = () => ({ ...data })
  }

  if (computed) {
    mountOptions.computed = computed
  }

  if (methods) {
    mountOptions.methods = methods
  }

  // Выбор метода монтирования
  const mountFunction = shallow ? shallowMount : mount

  const wrapper = mountFunction(component, mountOptions)

  // Добавление дополнительных утилит к wrapper
  wrapper.findByTestId = (testId) => wrapper.find(`[data-testid="${testId}"]`)
  wrapper.findAllByTestId = (testId) => wrapper.findAll(`[data-testid="${testId}"]`)

  return wrapper
}

/**
 * Хелпер для создания тестовых данных форм
 */
export function createFormData(overrides = {}) {
  return {
    email: 'test@example.com',
    password: 'password123',
    firstName: 'John',
    lastName: 'Doe',
    phone: '+1234567890',
    ...overrides
  }
}

/**
 * Хелпер для создания мок функций с возвращаемыми значениями
 */
export function createMockFunction(returnValue = undefined, implementation = null) {
  const mockFn = vi.fn()
  
  if (implementation) {
    mockFn.mockImplementation(implementation)
  } else if (returnValue !== undefined) {
    mockFn.mockReturnValue(returnValue)
  }
  
  return mockFn
}

/**
 * Хелпер для асинхронного ожидания в тестах
 */
export function waitFor(ms = 0) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Хелпер для симуляции пользовательского ввода
 */
export async function userInput(wrapper, selector, value) {
  const input = wrapper.find(selector)
  await input.setValue(value)
  await input.trigger('input')
  await input.trigger('change')
}

/**
 * Хелпер для симуляции клика
 */
export async function userClick(wrapper, selector) {
  const element = wrapper.find(selector)
  await element.trigger('click')
}

/**
 * Хелпер для проверки эмиссии событий
 */
export function expectEmitted(wrapper, eventName, expectedValue = undefined) {
  const emittedEvents = wrapper.emitted(eventName)
  expect(emittedEvents).toBeTruthy()
  
  if (expectedValue !== undefined) {
    const lastEmission = emittedEvents[emittedEvents.length - 1]
    expect(lastEmission[0]).toEqual(expectedValue)
  }
  
  return emittedEvents
} 