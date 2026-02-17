import axios, {
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig
} from 'axios'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
import { getGAParameters } from '@/utils/gaCookies'

interface FetcherOptions {
  baseUrl?: string
  headers?: Record<string, string>
}

interface FetcherReturn {
  axiosInstance: AxiosInstance
}

/**
 * Custom axios instance with authentication handling
 * @param options - Configuration options for the fetcher
 * @returns Object containing the configured axios instance
 */
export function useFetcher(options: FetcherOptions = {}): FetcherReturn {
  // Set default headers
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'X-Project': import.meta.env.VITE_PROJECT_ALIAS as string
  }

  // Initialize user store
  const userStore = useUserStore()
  const { token, isLoggedIn } = storeToRefs(userStore)

  // Clone headers to avoid mutating the original object
  const headersData: Record<string, string> = { ...defaultHeaders }

  // Add authorization header if user is logged in and not on tour page
  const currentPath = window.location.pathname
  if (isLoggedIn.value && token.value && !currentPath.includes('/tour')) {
    headersData['Authorization'] = `Bearer ${token.value}`
  }

  // Apply headers to axios defaults
  axios.defaults.headers.common = { ...axios.defaults.headers.common, ...headersData }

  // Create axios instance with provided base URL
  const axiosInstance: AxiosInstance = axios.create({
    baseURL: options.baseUrl,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  })

  // Response interceptor
  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
      // Any status code that lie within the range of 2xx cause this function to trigger
      return response
    },
    (error: any) => {
      // Handle 401 Unauthorized
      if (error?.response?.status === 401) {
        userStore.preventLogout?.()
      }
      return Promise.reject(error)
    }
  )

  // Request interceptor for adding auth token and GA parameters
  axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      if (isLoggedIn.value && token.value && !config.headers['Authorization']) {
        config.headers.Authorization = `Bearer ${token.value}`
      }

      // Добавляем GA параметры (client_id, session_id) для отправки лидов в Zoho
      // Проверяем, что это POST запрос к эндпоинтам заказов или Zoho
      const shouldAddGAParams =
        config.method === 'post' &&
        config.url &&
        (config.url.includes('/orders') || config.url.includes('/zoho/createRequest'))

      if (shouldAddGAParams && config.data && typeof config.data === 'object') {
        const gaParams = getGAParameters()

        // Добавляем параметры только если они существуют
        if (gaParams.client_id) {
          config.data.client_id = gaParams.client_id
        }
        if (gaParams.session_id) {
          config.data.session_id = gaParams.session_id
        }
      }

      return config
    },
    (error: any) => {
      return Promise.reject(error)
    }
  )

  return { axiosInstance }
}
