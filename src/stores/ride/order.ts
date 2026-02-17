import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { useFetcher } from '@/compose/axios'
import type { AxiosResponse } from 'axios'
import type { OrderData, OrderStoreActions, OrderStoreState } from '@/types/stores/ride/order'

const STORE_NAME = 'order'
const LOCALSTORAGE_ORDER_DATA = 'orderData'
const LOCALSTORAGE_ORDER_ID = 'order_id'
const LOCALSTORAGE_MAIL_CAR = 'mailCar'
const LOCALSTORAGE_FLEET = 'fleet'
const LOCALSTORAGE_TOUR = 'tour'
const SUCCESS_PAGE_ORDER_KEY = 'successPageOrderData'
const SESSION_ORDER_KEY = 'order'

const parseJSON = <T>(value: string | null, fallback: T): T => {
  if (!value) {
    return fallback
  }

  try {
    return (JSON.parse(value) as T) ?? fallback
  } catch (error) {
    console.error('Failed to parse stored value', error)
    return fallback
  }
}

const getBooleanFromStorage = (key: string, fallback = false): boolean => {
  const value = localStorage.getItem(key)
  if (value === null) {
    return fallback
  }

  try {
    return Boolean(JSON.parse(value))
  } catch (error) {
    console.error('Failed to parse boolean from storage', error)
    return fallback
  }
}

const createDefaultOrderData = (): OrderData => ({
  pickup: null,
  dropoff: null,
  hours: null,
  email: null,
  type_of_service: null,
  website: (import.meta.env.VITE_PROJECT_URL as string) ?? null,
  reqs: null,
  date_start: null,
  first_name: null,
  last_name: null,
  notes: null,
  phone: null,
  car: null,
  status: 2,
  code: null,
  extra_kms: null,
  payment_code: null,
  payment_date: null,
  consulting: null,
  country_prefix: null,
  total: null,
  amount: null,
  distance: null,
  utm_source: null,
  utm_medium: null,
  utm_campaign: null,
  utm_content: null,
  utm_term: null,
  redis_id: null,
  deal_id: null,
  lead_id: null,
  redirectStep: null,
  full_url: null,
  file_number: null,
  number_of_passengers: 1,
  main_passenger: null,
  other_language: null,
  pickup_specific: null,
  dropoff_specific: null,
  number_suitcases: null,
  transaction_id: null,
  contact_id: null,
  allowedPages: {
    vehicle: 0,
    contact: 0,
    success_payment_intent: 0,
    contactData: 0,
    serviceData: 0,
    success: 0
  },
  fromStart: null,
  ride_history: null,
  paymentSuccess: false,
  mainTypes: {
    pickup: null,
    dropoff: null
  }
})

export const useOrderStore = defineStore(STORE_NAME, () => {
  const { axiosInstance } = useFetcher({ baseUrl: import.meta.env.VITE_APP_API_URL })

  const orderData = ref<OrderData>(createDefaultOrderData())
  const orderType = ref<string>(localStorage.getItem('orderType') ?? 'NEW')
  const duplicatedOrder = ref<boolean>(false)
  const updatedOrder = ref<boolean>(false)
  const orderId = ref<string | number | null>(null)
  const order = ref<unknown>(null)
  const fleet = ref<unknown>(null)
  const mailCar = ref<unknown>(null)
  const tour = ref<unknown>(null)
  const fromStayWithUs = ref<boolean>(false)
  const hasPhone = ref<boolean>(getBooleanFromStorage('hasPhone', false))

  const changeTypeOrder: OrderStoreActions['changeTypeOrder'] = (type) => {
    orderType.value = type
    localStorage.setItem('orderType', type)
  }

  const changeHasPhoneStatus: OrderStoreActions['changeHasPhoneStatus'] = (status) => {
    hasPhone.value = status
    localStorage.setItem('hasPhone', status as unknown as string)
  }

  const getUtmData: OrderStoreActions['getUtmData'] = () => {
    const { utm_source, utm_medium, utm_campaign, utm_content, utm_term } = orderData.value

    return {
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term
    }
  }

  const persistOrderDataRaw = () => {
    sessionStorage.setItem(LOCALSTORAGE_ORDER_DATA, JSON.stringify(orderData.value))
  }

  const persistOrderData = useDebounceFn(persistOrderDataRaw, 500)

  const update: OrderStoreActions['update'] = (data) => {
    orderData.value = { ...orderData.value, ...data }
    updatedOrder.value = !updatedOrder.value
    persistOrderData()
  }

  const updateWithoutToggle = (data: Partial<OrderData>): void => {
    orderData.value = { ...orderData.value, ...data }
    persistOrderDataRaw()
  }

  const updateStorage: OrderStoreActions['updateStorage'] = async (data) => {
    orderData.value = { ...orderData.value, ...data }
    persistOrderData()

    return axiosInstance.post('orders/cache/create', orderData.value) as Promise<
      AxiosResponse<unknown>
    >
  }

  const updateOrder: OrderStoreActions['updateOrder'] = (data) => {
    order.value = data
    if (data !== null) {
      sessionStorage.setItem(SESSION_ORDER_KEY, JSON.stringify(data))
    } else {
      sessionStorage.removeItem(SESSION_ORDER_KEY)
    }
  }

  const updateFleet: OrderStoreActions['updateFleet'] = (data) => {
    fleet.value = data
    if (data !== null) {
      sessionStorage.setItem(LOCALSTORAGE_FLEET, JSON.stringify(data))
    } else {
      sessionStorage.removeItem(LOCALSTORAGE_FLEET)
    }
  }

  const updateTour: OrderStoreActions['updateTour'] = (data) => {
    tour.value = data
    if (data !== null) {
      sessionStorage.setItem(LOCALSTORAGE_TOUR, JSON.stringify(data))
    } else {
      sessionStorage.removeItem(LOCALSTORAGE_TOUR)
    }
  }

  const updateOrderId: OrderStoreActions['updateOrderId'] = (data) => {
    if (
      data === null ||
      data === undefined ||
      data === 'null' ||
      data === 'undefined' ||
      data === ''
    ) {
      orderId.value = null
      sessionStorage.removeItem(LOCALSTORAGE_ORDER_ID)
    } else {
      orderId.value = data
      sessionStorage.setItem(LOCALSTORAGE_ORDER_ID, String(data))
    }
  }

  const updateMailCar: OrderStoreActions['updateMailCar'] = (data) => {
    mailCar.value = data
    if (data === null) {
      sessionStorage.removeItem(LOCALSTORAGE_MAIL_CAR)
    }
  }

  const $reset: OrderStoreActions['$reset'] = () => {
    orderData.value = createDefaultOrderData()
    orderId.value = null
    mailCar.value = null
    fleet.value = null
    tour.value = null
    persistOrderDataRaw()
    sessionStorage.removeItem(LOCALSTORAGE_ORDER_ID)
    sessionStorage.removeItem(LOCALSTORAGE_FLEET)
    sessionStorage.removeItem(STORE_NAME)
    sessionStorage.removeItem(LOCALSTORAGE_MAIL_CAR)
    sessionStorage.removeItem(LOCALSTORAGE_TOUR)
  }

  const $resetOrder: OrderStoreActions['$resetOrder'] = () => {
    order.value = null
    sessionStorage.removeItem(SESSION_ORDER_KEY)
  }

  const $resetOrderId: OrderStoreActions['$resetOrderId'] = () => {
    orderId.value = null
    sessionStorage.removeItem(LOCALSTORAGE_ORDER_ID)
  }

  const $resetGuestOrderData: OrderStoreActions['$resetGuestOrderData'] = () => {
    localStorage.removeItem('orderType')
    localStorage.removeItem('hasPhone')
    localStorage.removeItem(SUCCESS_PAGE_ORDER_KEY)

    orderType.value = 'NEW'
    hasPhone.value = false
  }

  const loadDefaultValue = (): void => {
    const storedOrderData = parseJSON<OrderData | null>(
      sessionStorage.getItem(LOCALSTORAGE_ORDER_DATA),
      null
    )

    if (storedOrderData) {
      updateWithoutToggle({ ...createDefaultOrderData(), ...storedOrderData })
    } else {
      updateWithoutToggle(createDefaultOrderData())
    }

    const storedOrderId = sessionStorage.getItem(LOCALSTORAGE_ORDER_ID)
    if (storedOrderId === 'null' || storedOrderId === 'undefined' || storedOrderId === '') {
      orderId.value = null
    } else {
      orderId.value = storedOrderId ?? null
    }

    const storedOrder = parseJSON<unknown>(sessionStorage.getItem(SESSION_ORDER_KEY), null)
    order.value = storedOrder

    const storedFleet = parseJSON<unknown>(sessionStorage.getItem(LOCALSTORAGE_FLEET), null)
    fleet.value = storedFleet

    const storedTour = parseJSON<unknown>(sessionStorage.getItem(LOCALSTORAGE_TOUR), null)
    tour.value = storedTour

    const storedMailCar = parseJSON<unknown>(sessionStorage.getItem(LOCALSTORAGE_MAIL_CAR), null)
    mailCar.value = storedMailCar
  }

  loadDefaultValue()

  const saveOrderForSuccessPage: OrderStoreActions['saveOrderForSuccessPage'] = () => {
    try {
      const clone: Partial<OrderData> = { ...orderData.value }
      delete clone.allowedPages
      localStorage.setItem(SUCCESS_PAGE_ORDER_KEY, JSON.stringify(clone))
    } catch (error) {
      console.error('Failed to save order for success page', error)
    }
  }

  const restoreOrderForSuccessPage: OrderStoreActions['restoreOrderForSuccessPage'] = () => {
    const data = localStorage.getItem(SUCCESS_PAGE_ORDER_KEY)
    if (!data) {
      return
    }

    try {
      const parsed = JSON.parse(data) as Partial<OrderData>
      updateWithoutToggle(parsed)
    } catch (error) {
      console.error('Failed to restore order for success page', error)
    }
  }

  return {
    orderType,
    duplicatedOrder,
    updatedOrder,
    fromStayWithUs,
    orderData,
    orderId,
    order,
    mailCar,
    fleet,
    tour,
    hasPhone,
    updateMailCar,
    updateStorage,
    updateFleet,
    updateTour,
    update,
    updateOrder,
    updateOrderId,
    changeTypeOrder,
    $resetOrder,
    $resetOrderId,
    $reset,
    $resetGuestOrderData,
    changeHasPhoneStatus,
    getUtmData,
    saveOrderForSuccessPage,
    restoreOrderForSuccessPage
  } satisfies OrderStoreState & OrderStoreActions
})

export type OrderStore = ReturnType<typeof useOrderStore>
