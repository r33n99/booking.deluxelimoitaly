import { storeToRefs } from 'pinia'
import type { AxiosInstance } from 'axios'
import type { Router } from 'vue-router'

import { useCarsStore } from '@/stores/ride/cars'
import { useContactsStore, useUserStore } from '@/stores/user'
import { useOrderStore } from '@/stores/ride/order'
import { useMainStore } from '@/stores/ui/main'
import { trackGtmEvent } from '@/utils/gtm'
import { captureError } from '@/utils/sentry'
import type { CarSummary } from '@/types/stores/ride/cars'
import type { OrderData } from '@/types/stores/ride/order'

interface PrepareSubmissionParams {
  values: Record<string, any>
  code: string | null
  phone: string | null
  countryPrefix: string | null
}

interface OrderApiData {
  order: Record<string, any>
  cars: CarSummary[]
}

interface OrderApiPayload {
  data: OrderApiData
}

const BOOKING_STEP_MAP = {
  oneWayTransfer: { funnel: 'one_way_transfer', stepNumber: 2 },
  hourlyAsDirected: { funnel: 'hourly_as_directed', stepNumber: 2 },
  toursRoadshows: { funnel: 'tours_roadshows', stepNumber: 3 }
} as const

export type BookingServiceType = keyof typeof BOOKING_STEP_MAP

export const useOrderSubmit = (axios: AxiosInstance) => {
  const orderStore = useOrderStore()
  const { orderData, orderId, fleet } = storeToRefs(orderStore)

  const carsStore = useCarsStore()
  const { cars, selectedCar } = storeToRefs(carsStore)
  const contactsStore = useContactsStore()
  const userStore = useUserStore()
  const { isLoggedIn } = storeToRefs(userStore)

  const mainStore = useMainStore()
  const { isRequesting } = storeToRefs(mainStore)

  const handleBookingStepTracking = () => {
    const serviceType = orderData.value.type_of_service as BookingServiceType | null

    if (!serviceType || !BOOKING_STEP_MAP[serviceType]) {
      return
    }

    const { funnel, stepNumber } = BOOKING_STEP_MAP[serviceType]

    trackGtmEvent('booking_next_step', {
      booking_funnel: funnel,
      booking_step_number: stepNumber,
      booking_step_name: 'contact'
    })
  }

  const prepareSubmission = ({ values, code, phone, countryPrefix }: PrepareSubmissionParams) => {
    handleBookingStepTracking()

    isRequesting.value = true
    values.code = code
    values.phone = phone ?? ''
    values.country_prefix = countryPrefix

    if (orderId.value === 'undefined' || orderId.value === 'null') {
      orderId.value = null
    }

    orderStore.update(values as Partial<OrderData>)
    orderStore.changeHasPhoneStatus(Boolean(phone))

    orderData.value.fromStart = true

    contactsStore.add({
      first_name: values.first_name,
      last_name: values.last_name,
      email: values.email,
      phone: values.phone ?? '',
      code: code ?? undefined,
      country_prefix: countryPrefix ?? undefined
    })
  }

  const createOrderRequest = async (): Promise<OrderApiData | null> => {
    try {
      const response = await axios.post('/orders', orderData.value)
      const rawData = (response as { data?: unknown })?.data as OrderApiPayload | undefined
      const responseData = rawData?.data

      if (!responseData) {
        const error = new Error('Invalid response structure from order creation API') as Error & {
          responseData?: unknown
        }
        error.responseData = response
        captureError(error)
        console.error('Order creation response structure:', response)
        isRequesting.value = false
        return null
      }

      const { order, cars } = responseData as Partial<OrderApiData>

      if (!order || !cars) {
        const error = new Error('Missing order or cars data in API response') as Error & {
          responseData?: unknown
        }
        error.responseData = responseData
        captureError(error)
        console.error('Order creation response data:', responseData)
        isRequesting.value = false
        return null
      }

      if (!Array.isArray(cars)) {
        const error = new Error('Invalid cars data type: expected array') as Error & {
          carsValue?: unknown
        }
        error.carsValue = cars
        captureError(error)
        console.error('Order creation invalid cars type:', {
          expected: 'array',
          actual: typeof cars,
          value: cars
        })
        isRequesting.value = false
        return null
      }

      if (typeof order !== 'object' || order === null) {
        const error = new Error('Invalid order data type: expected object') as Error & {
          orderValue?: unknown
        }
        error.orderValue = order
        captureError(error)
        console.error('Order creation invalid order type:', {
          expected: 'object',
          actual: typeof order,
          value: order
        })
        isRequesting.value = false
        return null
      }

      return { order: order as Record<string, any>, cars: cars as CarSummary[] }
    } catch (error) {
      captureError(error)
      isRequesting.value = false
      throw error
    }
  }

  const handleOrderResponse = (apiData: OrderApiData) => {
    const dataOrder = apiData.order
    const dataCars = apiData.cars

    if (Array.isArray(dataCars)) {
      carsStore.update(dataCars)
    }

    if (dataOrder) {
      orderStore.update(dataOrder)
      orderStore.updateOrder(dataOrder)
      orderStore.updateOrderId(dataOrder.id)
    }

    return { order: dataOrder, cars: dataCars }
  }

  const getSelectedCarFromStore = (): CarSummary | null => {
    const currentSelected = selectedCar.value

    if (!currentSelected || typeof currentSelected === 'number') {
      return null
    }

    const carsList = cars.value ?? []
    return carsList.find((car) => car.class_id === currentSelected.class_id) ?? null
  }

  const syncUserPhoneData = () => {
    if (!orderData.value.phone || !isLoggedIn.value) {
      return
    }

    const phoneValue = orderData.value.phone as string
    const codeValue = orderData.value.code ?? undefined
    const payload: Record<string, string> = {
      phone: contactsStore.format_phone(phoneValue, codeValue)
    }

    if (typeof codeValue === 'string') {
      payload.code = codeValue
    }

    if (typeof orderData.value.country_prefix === 'string') {
      payload.country_prefix = orderData.value.country_prefix
    }

    userStore.update(payload)
  }

  const postFieldsSearch = (id: string | number | null) => {
    return axios.post(`/fields/search/${id}`, {})
  }

  const allowVehicleStep = () => {
    orderData.value.allowedPages['vehicle'] = 1
  }

  const fetchTransactionAndRedirect = async (router: Router) => {
    if (!orderId.value) {
      isRequesting.value = false
      captureError(new Error('Order ID is not available'))
      return
    }

    try {
      const response = await axios.post(`transaction/fetch/${orderId.value}`)
      const transactionId = response?.data?.data?.transaction_id

      isRequesting.value = false

      if (transactionId) {
        await router.push(`/payment/${transactionId}`)
      } else {
        captureError(new Error('Transaction ID is not available'))
      }
    } catch (error) {
      isRequesting.value = false
      captureError(error)
    }
  }

  const handleToursFlow = async (router: Router, responseOrderId: string | number | null) => {
    isRequesting.value = false
    orderData.value.allowedPages['success'] = 1

    try {
      await postFieldsSearch(responseOrderId)
    } catch (error) {
      captureError(error)
    }

    await router.push('/success')
  }

  const handleHourlyFlow = async (router: Router, responseOrderId: string | number | null) => {
    const searchId = responseOrderId ?? orderId.value

    try {
      await postFieldsSearch(searchId)
    } catch (error) {
      captureError(error)

      if (!fleet.value) {
        allowVehicleStep()
        isRequesting.value = false
        await router.push('vehicle')
      } else {
        isRequesting.value = false
      }

      return
    }

    if (!fleet.value) {
      allowVehicleStep()
      isRequesting.value = false
      await router.push('vehicle')
      return
    }

    const selected = getSelectedCarFromStore()

    if (!selected) {
      isRequesting.value = false
      captureError(new Error('Selected car is not available'))
      return
    }

    const carPrice = Number(selected.price ?? 0)
    orderStore.update({ total: carPrice })

    try {
      await axios.patch(`/orders/${orderId.value}`, {
        car: selected.class_id ?? null,
        total: carPrice,
        step: 2
      })

      await fetchTransactionAndRedirect(router)
    } catch (error) {
      isRequesting.value = false
      captureError(error)
    }
  }

  const handleOneWayFlow = async (
    router: Router,
    responseOrder: Record<string, any>
  ): Promise<void> => {
    const responseOrderId = responseOrder?.id ?? orderId.value

    if (responseOrder?.distance !== undefined && responseOrder?.distance !== null) {
      orderStore.update({ distance: responseOrder.distance || 0 })
    }

    if (!fleet.value) {
      allowVehicleStep()

      try {
        await postFieldsSearch(responseOrderId)
        isRequesting.value = false
        await router.push('vehicle')
      } catch (error) {
        isRequesting.value = false
        captureError(error)
      }

      return
    }

    const selected = getSelectedCarFromStore()

    if (!selected) {
      isRequesting.value = false
      captureError(new Error('Selected car is not available'))
      return
    }

    const carPrice = Number(selected.price ?? 0)
    orderStore.update({ total: carPrice })

    try {
      await postFieldsSearch(responseOrderId)
    } catch (error) {
      isRequesting.value = false
      captureError(error)
      return
    }

    if (orderData.value.distance === 0) {
      isRequesting.value = false
      orderData.value.allowedPages['success'] = 1
      await router.push('/success')
      return
    }

    try {
      await axios.patch(`/orders/${orderId.value}`, {
        car: selected.class_id ?? null,
        total: carPrice,
        step: 2
      })

      await fetchTransactionAndRedirect(router)
    } catch (error) {
      isRequesting.value = false
      captureError(error)
    }
  }

  const processServiceFlow = async ({
    serviceType,
    router,
    responseOrder
  }: {
    serviceType: string | null
    router: Router
    responseOrder: Record<string, any> | null
  }) => {
    if (!responseOrder) {
      isRequesting.value = false
      return
    }

    const typedService = (serviceType ?? '') as BookingServiceType

    if (typedService === 'toursRoadshows') {
      await handleToursFlow(router, responseOrder.id ?? null)
      return
    }

    if (typedService === 'hourlyAsDirected') {
      await handleHourlyFlow(router, responseOrder.id ?? null)
      return
    }

    if (typedService === 'oneWayTransfer') {
      await handleOneWayFlow(router, responseOrder)
      return
    }

    isRequesting.value = false
  }

  return {
    prepareSubmission,
    createOrderRequest,
    handleOrderResponse,
    syncUserPhoneData,
    postFieldsSearch,
    processServiceFlow,
    isRequesting
  }
}
