import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AxiosInstance } from 'axios'
import { useFetcher } from '@/compose/axios'
import type {
  Tour,
  Area,
  CustomTour,
  TourPage,
  ToursApiResponse,
  TourApiResponse,
  TourPageResponse
} from '@/types/tours'
import { adaptTour, adaptTours } from '@/utils/tourAdapter'
import { normalizeObject } from '@/utils/storeHelpers'
import { useBaseStore } from './baseStore'

const STORE_NAME = 'tours'

// Время жизни кэша в миллисекундах (5 минут)
const CACHE_TTL = 5 * 60 * 1000

interface CacheEntry<T> {
  data: T
  timestamp: number
}

export const useToursStore = defineStore(STORE_NAME, () => {
  const { axiosInstance } = useFetcher({ baseUrl: import.meta.env.VITE_APP_API_INSP }) as {
    axiosInstance: AxiosInstance
  }

  const baseStore = useBaseStore()

  const tours = ref<Tour[]>([])
  const areas = ref<Area[]>([])
  const selectedTourId = ref<number | null>(null)
  const customTour = ref<CustomTour | null>(null)

  // Кэш с TTL для туров
  const cachedTours = ref<Map<string, CacheEntry<Tour[]>>>(new Map())
  const cachedTourById = ref<Map<string, CacheEntry<Tour>>>(new Map()) // Используем string для поддержки как ID, так и slug
  const cachedPages = ref<Map<number, CacheEntry<TourPage>>>(new Map())

  /**
   * Проверяет валидность кэша по timestamp
   */
  const isCacheValid = (timestamp: number): boolean => {
    return Date.now() - timestamp < CACHE_TTL
  }

  /**
   * Очищает устаревший кэш
   */
  const clearExpiredCache = () => {
    const now = Date.now()

    // Очищаем туры
    for (const [key, entry] of cachedTours.value.entries()) {
      if (now - entry.timestamp >= CACHE_TTL) {
        cachedTours.value.delete(key)
      }
    }

    // Очищаем отдельные туры
    for (const [key, entry] of cachedTourById.value.entries()) {
      if (now - entry.timestamp >= CACHE_TTL) {
        cachedTourById.value.delete(key)
      }
    }

    // Очищаем страницы
    for (const [key, entry] of cachedPages.value.entries()) {
      if (now - entry.timestamp >= CACHE_TTL) {
        cachedPages.value.delete(key)
      }
    }
  }

  /**
   * Получает данные из кэша или возвращает null
   */
  const getCachedTours = (key: string): Tour[] | null => {
    const cached = cachedTours.value.get(key)
    if (cached && isCacheValid(cached.timestamp)) {
      return cached.data
    }
    return null
  }

  /**
   * Сохраняет туры в кэш
   */
  const setCachedTours = (key: string, data: Tour[]) => {
    cachedTours.value.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  /**
   * Инвалидирует (очищает) весь кэш
   */
  function invalidateCache() {
    cachedTours.value.clear()
    cachedTourById.value.clear()
    cachedPages.value.clear()
  }

  /**
   * Инвалидирует кэш конкретного тура
   */
  function invalidateTour(tourId: number) {
    cachedTourById.value.delete(String(tourId))
    cachedPages.value.delete(tourId)
  }

  // Computed для удобного доступа к состояниям
  const isLoading = computed(() => baseStore.isLoading)
  const error = computed(() => baseStore.error)
  const hasError = computed(() => baseStore.hasError)

  function updateCustomTour(tour: CustomTour | null) {
    customTour.value = tour
      ? normalizeObject<CustomTour>(tour as unknown as Record<string, unknown>)
      : null
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('customTour', JSON.stringify(customTour.value))
    }
  }

  async function fetchAreas(): Promise<Area[]> {
    const result = await baseStore.withLoading(
      async () => {
        const { data } = await axiosInstance.get<{ data: Area[] }>('/areas')
        areas.value = data.data ?? []
        return areas.value
      },
      'Failed to fetch areas',
      'areas'
    )

    return result || []
  }

  async function getTourPage(tourId: number): Promise<TourPage | undefined> {
    // Проверяем кэш
    const cached = cachedPages.value.get(tourId)
    if (cached && isCacheValid(cached.timestamp)) {
      return cached.data
    }

    const result = await baseStore.withLoading(
      async () => {
        const { data } = await axiosInstance.get<TourPageResponse>('/pages/' + tourId)
        const page = data.data
          ? normalizeObject<TourPage>(data.data as unknown as Record<string, unknown>)
          : undefined

        // Сохраняем в кэш
        if (page) {
          cachedPages.value.set(tourId, {
            data: page,
            timestamp: Date.now()
          })
        }

        return page
      },
      `Failed to fetch page for tour #${tourId}`,
      `page_${tourId}`
    )

    return result
  }

  function clearTours() {
    tours.value = []
  }

  async function fetchTours(areaId?: number, append = false): Promise<void> {
    const cacheKey = areaId != null ? `area_${areaId}` : 'all'

    // Проверяем кэш (только если не append режим)
    if (!append) {
      const cached = getCachedTours(cacheKey)
      if (cached) {
        tours.value = cached
        return
      }
    }

    const result = await baseStore.withLoading(
      async () => {
        const params: Record<string, number> = {}
        if (areaId != null) {
          params.area_id = areaId
        }

        const { data } = await axiosInstance.get<ToursApiResponse>('/tours', { params })
        const fetchedTours = data.data ?? []

        // Адаптируем туры для обратной совместимости
        const adaptedTours = adaptTours(fetchedTours)

        if (append) {
          const existingIds = new Set(tours.value.map((t) => t.id))
          const newTours = adaptedTours.filter((t) => !existingIds.has(t.id))
          tours.value.push(...newTours)
        } else {
          tours.value = adaptedTours
          // Сохраняем в кэш с timestamp
          setCachedTours(cacheKey, adaptedTours)
        }

        return adaptedTours
      },
      'Failed to fetch tours',
      `tours_${cacheKey}`
    )

    // Очищаем устаревший кэш после загрузки
    clearExpiredCache()
  }

  async function getTourById(tourId: number | string): Promise<Tour | undefined> {
    // Проверяем кэш (используем строку для ключа, чтобы поддерживать и ID, и slug)
    const cacheKey = String(tourId)
    const cached = cachedTourById.value.get(cacheKey)
    if (cached && isCacheValid(cached.timestamp)) {
      return cached.data
    }

    const result = await baseStore.withLoading(
      async () => {
        const { data } = await axiosInstance.get<TourApiResponse>('/tours/' + tourId)
        const tour = data.data

        // Адаптируем тур для обратной совместимости
        const adaptedTour = tour ? adaptTour(tour) : undefined

        // Сохраняем в кэш (используем строку для ключа)
        if (adaptedTour) {
          cachedTourById.value.set(cacheKey, {
            data: adaptedTour,
            timestamp: Date.now()
          })
          // Также кэшируем по ID тура для быстрого доступа
          if (adaptedTour.id) {
            cachedTourById.value.set(String(adaptedTour.id), {
              data: adaptedTour,
              timestamp: Date.now()
            })
          }
          // И по slug, если он есть
          if (adaptedTour.slug) {
            cachedTourById.value.set(adaptedTour.slug, {
              data: adaptedTour,
              timestamp: Date.now()
            })
          }
        }

        return adaptedTour
      },
      `Failed to fetch tour ${tourId}`,
      `tour_${cacheKey}`
    )

    return result
  }

  // --- LOCAL STORAGE HELPERS ---
  function saveToursToLocalStorage() {
    localStorage.setItem('tours', JSON.stringify(tours.value))
  }
  function loadToursFromLocalStorage() {
    try {
      const stored = localStorage.getItem('tours')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          tours.value = parsed as Tour[]
        }
      }
    } catch (err) {
      console.log(err)
    }
  }
  function saveSelectedTourIdToLocalStorage() {
    const value = selectedTourId.value
    if (value == null) {
      localStorage.removeItem('selectedTourId')
      return
    }
    localStorage.setItem('selectedTourId', value.toString())
  }
  function loadSelectedTourIdFromLocalStorage() {
    try {
      const stored = localStorage.getItem('selectedTourId')
      if (stored) {
        const parsed = Number(stored)
        selectedTourId.value = Number.isNaN(parsed) ? null : parsed
      }
    } catch (err) {
      console.log(err)
    }
  }
  function setSelectedTourId(id: number | null) {
    selectedTourId.value = id
    saveSelectedTourIdToLocalStorage()
  }

  return {
    // State
    tours,
    areas,
    selectedTourId,
    customTour,

    // Computed
    isLoading,
    error,
    hasError,

    // Actions
    fetchAreas,
    fetchTours,
    clearTours,
    updateCustomTour,
    getTourPage,
    getTourById,
    saveToursToLocalStorage,
    loadToursFromLocalStorage,
    saveSelectedTourIdToLocalStorage,
    loadSelectedTourIdFromLocalStorage,
    setSelectedTourId,
    invalidateCache,
    invalidateTour,
    clearExpiredCache
  }
})
