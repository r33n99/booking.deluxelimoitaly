import { vi } from 'vitest'

const mockAxiosInstance = {
  interceptors: {
    response: {
      use: vi.fn(),
    },
    request: {
      use: vi.fn(),
    }
  },
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
}

const axios = {
  create: vi.fn(() => mockAxiosInstance),
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  defaults: {
    headers: {
      common: {},
    },
  },
}

export default axios 