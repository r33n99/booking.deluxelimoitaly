import { vi } from 'vitest'

/**
 * Создает мок для axios с предустановленными методами
 */
export function createAxiosMock() {
  const axiosMock = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    request: vi.fn(),
    create: vi.fn(() => axiosMock),
    defaults: {
      headers: {
        common: {},
        get: {},
        post: {},
        put: {},
        patch: {},
        delete: {}
      },
      timeout: 10000,
      baseURL: ''
    },
    interceptors: {
      request: {
        use: vi.fn(),
        eject: vi.fn()
      },
      response: {
        use: vi.fn(),
        eject: vi.fn()
      }
    }
  }

  return axiosMock
}

/**
 * Создает успешный ответ API
 */
export function createSuccessResponse(data, config = {}) {
  return Promise.resolve({
    data,
    status: config.status || 200,
    statusText: config.statusText || 'OK',
    headers: config.headers || {},
    config: config.config || {},
    request: config.request || {}
  })
}

/**
 * Создает ошибочный ответ API
 */
export function createErrorResponse(error, config = {}) {
  const errorResponse = {
    response: {
      data: error.data || { message: error.message || 'Request failed' },
      status: error.status || 500,
      statusText: error.statusText || 'Internal Server Error',
      headers: error.headers || {}
    },
    message: error.message || 'Request failed',
    code: error.code || 'UNKNOWN_ERROR',
    config: config.config || {},
    request: config.request || {}
  }

  return Promise.reject(errorResponse)
}

/**
 * Настройка моков для различных API эндпоинтов
 */
export class ApiMocker {
  constructor(axiosMock) {
    this.axios = axiosMock
    this.mocks = new Map()
  }

  /**
   * Мокирование GET запроса
   */
  mockGet(url, response, options = {}) {
    const mockImplementation = (requestUrl) => {
      if (this.matchUrl(requestUrl, url)) {
        if (options.delay) {
          return new Promise(resolve => {
            setTimeout(() => resolve(response), options.delay)
          })
        }
        return response
      }
      return this.axios.get.mockImplementation()
    }

    this.axios.get.mockImplementation(mockImplementation)
    this.mocks.set(`GET:${url}`, { response, options })
    return this
  }

  /**
   * Мокирование POST запроса
   */
  mockPost(url, response, options = {}) {
    const mockImplementation = (requestUrl, data) => {
      if (this.matchUrl(requestUrl, url)) {
        if (options.validateData && !options.validateData(data)) {
          return createErrorResponse({ status: 400, message: 'Invalid data' })
        }
        if (options.delay) {
          return new Promise(resolve => {
            setTimeout(() => resolve(response), options.delay)
          })
        }
        return response
      }
      return this.axios.post.mockImplementation()
    }

    this.axios.post.mockImplementation(mockImplementation)
    this.mocks.set(`POST:${url}`, { response, options })
    return this
  }

  /**
   * Мокирование PUT запроса
   */
  mockPut(url, response, options = {}) {
    const mockImplementation = (requestUrl) => {
      if (this.matchUrl(requestUrl, url)) {
        if (options.delay) {
          return new Promise(resolve => {
            setTimeout(() => resolve(response), options.delay)
          })
        }
        return response
      }
      return this.axios.put.mockImplementation()
    }

    this.axios.put.mockImplementation(mockImplementation)
    this.mocks.set(`PUT:${url}`, { response, options })
    return this
  }

  /**
   * Мокирование DELETE запроса
   */
  mockDelete(url, response, options = {}) {
    const mockImplementation = (requestUrl) => {
      if (this.matchUrl(requestUrl, url)) {
        if (options.delay) {
          return new Promise(resolve => {
            setTimeout(() => resolve(response), options.delay)
          })
        }
        return response
      }
      return this.axios.delete.mockImplementation()
    }

    this.axios.delete.mockImplementation(mockImplementation)
    this.mocks.set(`DELETE:${url}`, { response, options })
    return this
  }

  /**
   * Сброс всех моков
   */
  reset() {
    this.axios.get.mockReset()
    this.axios.post.mockReset()
    this.axios.put.mockReset()
    this.axios.patch.mockReset()
    this.axios.delete.mockReset()
    this.mocks.clear()
    return this
  }

  /**
   * Проверка соответствия URL
   */
  matchUrl(requestUrl, mockUrl) {
    if (typeof mockUrl === 'string') {
      return requestUrl.includes(mockUrl)
    }
    if (mockUrl instanceof RegExp) {
      return mockUrl.test(requestUrl)
    }
    return false
  }

  /**
   * Получение статистики вызовов
   */
  getCallCount(method, url) {
    const methodMock = this.axios[method.toLowerCase()]
    if (!methodMock || !methodMock.mock) return 0
    
    return methodMock.mock.calls.filter(call => {
      const requestUrl = call[0]
      return this.matchUrl(requestUrl, url)
    }).length
  }

  /**
   * Получение последнего вызова
   */
  getLastCall(method) {
    const methodMock = this.axios[method.toLowerCase()]
    if (!methodMock || !methodMock.mock || methodMock.mock.calls.length === 0) {
      return null
    }
    return methodMock.mock.calls[methodMock.mock.calls.length - 1]
  }
}

/**
 * Предустановленные моки для общих API эндпоинтов
 */
export function setupCommonApiMocks(apiMocker) {
  // Авторизация
  apiMocker
    .mockPost('/auth/login', createSuccessResponse({
      token: 'mock-token',
      user: {
        id: 1,
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe'
      }
    }))
    .mockPost('/auth/register', createSuccessResponse({
      message: 'Registration successful'
    }))
    .mockPost('/auth/logout', createSuccessResponse({
      message: 'Logout successful'
    }))

  // Пользователь
  apiMocker
    .mockGet('/user/profile', createSuccessResponse({
      id: 1,
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1234567890'
    }))
    .mockPut('/user/profile', createSuccessResponse({
      message: 'Profile updated successfully'
    }))

  // Заказы
  apiMocker
    .mockGet('/orders', createSuccessResponse([
      {
        id: 1,
        type: 'one-way',
        status: 'completed',
        price: 100
      }
    ]))
    .mockPost('/orders', createSuccessResponse({
      id: 2,
      message: 'Order created successfully'
    }))

  // Автомобили
  apiMocker
    .mockGet('/cars', createSuccessResponse([
      {
        id: 1,
        name: 'Economy Car',
        type: 'sedan',
        capacity: 4,
        pricePerKm: 2.5
      },
      {
        id: 2,
        name: 'Business Car',
        type: 'business',
        capacity: 4,
        pricePerKm: 4.0
      }
    ]))

  return apiMocker
}

/**
 * Утилита для быстрого создания API мокера с общими настройками
 */
export function createApiMocker(axiosMock = null) {
  const axios = axiosMock || createAxiosMock()
  const apiMocker = new ApiMocker(axios)
  return setupCommonApiMocks(apiMocker)
} 