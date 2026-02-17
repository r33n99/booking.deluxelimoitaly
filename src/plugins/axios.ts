import axios from 'axios'
import * as Sentry from '@sentry/vue'
import { getGAParameters } from '@/utils/gaCookies'

export default {
  install: (app: any, options: any) => {
    axios.defaults.headers.common = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'X-Project': import.meta.env.VITE_PROJECT_ALIAS
    }

    // Глобальный request interceptor для axios
    // Добавляет client_id и session_id из Google Analytics cookies
    // для отправки лидов в Zoho CRM
    // Применяется ко всем axios запросам, включая прямые вызовы axios.post()
    axios.interceptors.request.use(
      (config: any) => {
        const shouldAddGAParams =
          config.method === 'post' &&
          config.url &&
          (config.url.includes('/orders') || config.url.includes('/zoho/createRequest'))

        if (shouldAddGAParams && config.data && typeof config.data === 'object') {
          const gaParams = getGAParameters()

          if (gaParams.client_id) {
            config.data.client_id = gaParams.client_id
          }
          if (gaParams.session_id) {
            config.data.session_id = gaParams.session_id
          }
        }

        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    const axiosInstance = axios.create({
      baseURL: options.baseUrl
    })

    // Request interceptor для экземпляра
    // Дублируем логику для кастомного экземпляра на случай если он используется отдельно
    axiosInstance.interceptors.request.use(
      (config: any) => {
        const shouldAddGAParams =
          config.method === 'post' &&
          config.url &&
          (config.url.includes('/orders') || config.url.includes('/zoho/createRequest'))

        if (shouldAddGAParams && config.data && typeof config.data === 'object') {
          const gaParams = getGAParameters()

          if (gaParams.client_id) {
            config.data.client_id = gaParams.client_id
          }
          if (gaParams.session_id) {
            config.data.session_id = gaParams.session_id
          }
        }

        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    axiosInstance.interceptors.response.use(null, (error) => {
      Sentry.captureException(error)
      return Promise.reject(error)
    })

    app.config.globalProperties.$axios = axiosInstance
    app.provide('axios', axiosInstance)
  }
}
