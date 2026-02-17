import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useFetcher } from '@/compose/axios'
import type { AxiosResponse } from 'axios'
import type {
  RideHistoryItem,
  RidesFilter,
  RidesHistoryStoreActions,
  RidesHistoryStoreState
} from '@/types/stores/ride/history'

const STORE_NAME = 'rides-history'
const LOCALSTORAGE_KEY = 'rides-history'
const TIMER_KEY = `timer-${LOCALSTORAGE_KEY}`
const REQUEST_KEY = `request-${LOCALSTORAGE_KEY}`

interface RidesResponse {
  data: RideHistoryItem[]
}

const DEFAULT_RIDES: RideHistoryItem[] = []

export const useRidesHistoryStore = defineStore(STORE_NAME, () => {
  const rides = ref<RideHistoryItem[]>([...DEFAULT_RIDES])
  const isRidesFetched = ref<boolean>(false)
  const isNoRides = ref<boolean>(false)
  const isRequestPending = ref<boolean>(false)
  const isRequestRefused = ref<boolean>(false)
  const isRequestSuccessful = ref<boolean>(false)
  const isRequestMessage = ref<boolean>(true)
  const isRidesFilteredEmpty = ref<boolean>(false)
  const requestSent = ref<boolean>(false)

  const $reset: RidesHistoryStoreActions['$reset'] = () => {
    rides.value = [...DEFAULT_RIDES]
    isRidesFetched.value = false
    isNoRides.value = false
    isRequestPending.value = false
    isRequestRefused.value = false
    isRequestSuccessful.value = false
    isRequestMessage.value = true
    isRidesFilteredEmpty.value = false
    requestSent.value = false
    sessionStorage.removeItem(TIMER_KEY)
    sessionStorage.removeItem(REQUEST_KEY)
    sessionStorage.removeItem(LOCALSTORAGE_KEY)
  }

  const updateRides: RidesHistoryStoreActions['updateRides'] = (newRides) => {
    const data = newRides?.data ?? []

    if (!data.length) {
      rides.value = [...DEFAULT_RIDES]
      isRidesFetched.value = false
      isNoRides.value = true
    } else {
      rides.value = data
      isRidesFetched.value = true
      isNoRides.value = false
      isRidesFilteredEmpty.value = false
      sessionStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(data))
    }
  }

  const updateRide: RidesHistoryStoreActions['updateRide'] = (rideIndex, newRide) => {
    const ride = rides.value[rideIndex]
    if (!ride) {
      return
    }

    Object.assign(ride, newRide)
    sessionStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(rides.value))
  }

  const loadRides: RidesHistoryStoreActions['loadRides'] = async (filter = {}) => {
    if (!isRequestMessage.value) {
      return
    }

    const { axiosInstance } = useFetcher({ baseUrl: import.meta.env.VITE_APP_API_URL })

    isRequestPending.value = true
    isRequestRefused.value = false
    isRequestSuccessful.value = false
    isRidesFilteredEmpty.value = false
    requestSent.value = true

    try {
      const response: AxiosResponse<RidesResponse> = await axiosInstance.get('/rides/histories', {
        params: filter as Record<string, unknown>
      })

      const ridesData = response.data?.data ?? []

      isRequestMessage.value = false
      isRequestPending.value = false
      isRequestRefused.value = false
      isRequestSuccessful.value = ridesData.length > 0
      isRidesFilteredEmpty.value = ridesData.length === 0

      updateRides({ data: ridesData })
    } catch (error: any) {
      console.error('Ошибка загрузки истории поездок:', error)

      isRequestMessage.value = false
      isRequestPending.value = false
      isRequestSuccessful.value = false
      isRequestRefused.value = true

      if (error?.response) {
        const status: number = error.response.status
        if (status >= 500) {
          console.error('Ошибка сервера:', status)
        } else if (status === 401 || status === 403) {
          console.error('Ошибка авторизации:', status)
        } else {
          console.error('Ошибка клиента:', status)
        }
      } else if (error?.request) {
        console.error('Сетевая ошибка или таймаут:', error.message)
      } else {
        console.error('Неожиданная ошибка:', error?.message ?? error)
      }

      updateRides({ data: [] })
    }
  }

  const updateRequestStatus: RidesHistoryStoreActions['updateRequestStatus'] = (status) => {
    sessionStorage.setItem(REQUEST_KEY, JSON.stringify({ status }))

    if (status === 'refused') {
      setTimeout(
        () => {
          sessionStorage.removeItem(LOCALSTORAGE_KEY)
        },
        60 * 60 * 1000
      )
    }

    if (status === 'empty') {
      setTimeout(
        () => {
          sessionStorage.removeItem(LOCALSTORAGE_KEY)
        },
        2 * 3600 * 1000
      )
    }
  }

  return {
    rides,
    isRidesFetched,
    isNoRides,
    isRequestPending,
    isRidesFilteredEmpty,
    isRequestRefused,
    isRequestSuccessful,
    isRequestMessage,
    requestSent,
    $reset,
    loadRides,
    updateRides,
    updateRequestStatus,
    updateRide
  } satisfies RidesHistoryStoreState & RidesHistoryStoreActions
})
