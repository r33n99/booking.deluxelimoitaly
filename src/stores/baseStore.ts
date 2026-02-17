import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface ApiError {
  message: string
  code?: string | number
  status?: number
  details?: unknown
}

/**
 * Базовый store с общей логикой загрузки и обработки ошибок
 */
export const useBaseStore = defineStore('base', () => {
  const loading = ref<boolean>(false)
  const error = ref<ApiError | null>(null)
  const loadingMap = ref<Map<string, boolean>>(new Map())

  /**
   * Проверяет, идёт ли загрузка
   */
  const isLoading = computed(() => loading.value)

  /**
   * Проверяет, есть ли ошибка
   */
  const hasError = computed(() => error.value !== null)

  /**
   * Получает текст ошибки
   */
  const errorMessage = computed(() => error.value?.message || '')

  /**
   * Устанавливает состояние загрузки
   */
  const setLoading = (value: boolean, key?: string) => {
    if (key) {
      loadingMap.value.set(key, value)
      // Обновляем общий loading если хотя бы один ключ загружается
      loading.value = Array.from(loadingMap.value.values()).some((v) => v)
    } else {
      loading.value = value
    }
  }

  /**
   * Проверяет загрузку по ключу
   */
  const isLoadingByKey = (key: string): boolean => {
    return loadingMap.value.get(key) || false
  }

  /**
   * Устанавливает ошибку
   */
  const setError = (err: string | Error | ApiError | unknown) => {
    if (typeof err === 'string') {
      error.value = { message: err }
    } else if (err instanceof Error) {
      error.value = {
        message: err.message,
        details: err
      }
    } else if (err && typeof err === 'object' && 'message' in err) {
      error.value = err as ApiError
    } else {
      error.value = {
        message: 'An unknown error occurred',
        details: err
      }
    }
  }

  /**
   * Очищает ошибку
   */
  const clearError = () => {
    error.value = null
  }

  /**
   * Сбрасывает все состояния
   */
  const reset = () => {
    loading.value = false
    error.value = null
    loadingMap.value.clear()
  }

  /**
   * Выполняет async операцию с автоматическим управлением loading/error
   *
   * @param asyncFn - Асинхронная функция для выполнения
   * @param errorMessage - Сообщение об ошибке по умолчанию
   * @param key - Ключ для отслеживания конкретной загрузки
   * @returns Результат выполнения функции или undefined при ошибке
   */
  const withLoading = async <T>(
    asyncFn: () => Promise<T>,
    errorMessage = 'An error occurred',
    key?: string
  ): Promise<T | undefined> => {
    try {
      setLoading(true, key)
      clearError()
      const result = await asyncFn()
      return result
    } catch (err) {
      console.error(`[baseStore] Error:`, err)

      // Формируем детальное сообщение об ошибке
      let detailedMessage = errorMessage
      if (err && typeof err === 'object') {
        if ('response' in err) {
          const response = (err as any).response
          if (response?.data?.message) {
            detailedMessage = response.data.message
          } else if (response?.statusText) {
            detailedMessage = `${errorMessage}: ${response.statusText}`
          }
        }
      }

      setError(detailedMessage)
      return undefined
    } finally {
      setLoading(false, key)
    }
  }

  /**
   * Выполняет async операцию без изменения состояния loading
   * Полезно для фоновых операций
   */
  const withoutLoading = async <T>(
    asyncFn: () => Promise<T>,
    errorMessage = 'An error occurred'
  ): Promise<T | undefined> => {
    try {
      clearError()
      const result = await asyncFn()
      return result
    } catch (err) {
      console.error(`[baseStore] Error:`, err)
      setError(errorMessage)
      return undefined
    }
  }

  /**
   * Выполняет операцию с retry логикой
   *
   * @param asyncFn - Функция для выполнения
   * @param retries - Количество попыток
   * @param delay - Задержка между попытками (мс)
   */
  const withRetry = async <T>(
    asyncFn: () => Promise<T>,
    retries = 3,
    delay = 1000
  ): Promise<T | undefined> => {
    let lastError: unknown

    for (let i = 0; i < retries; i++) {
      try {
        return await asyncFn()
      } catch (err) {
        lastError = err
        if (i < retries - 1) {
          await new Promise((resolve) => setTimeout(resolve, delay))
        }
      }
    }

    setError(lastError)
    return undefined
  }

  return {
    // State
    loading,
    error,
    loadingMap,

    // Computed
    isLoading,
    hasError,
    errorMessage,

    // Actions
    setLoading,
    isLoadingByKey,
    setError,
    clearError,
    reset,
    withLoading,
    withoutLoading,
    withRetry
  }
})
