import { collect } from 'collect.js'
import { computed, type ComputedRef } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useOrderStore } from '@/stores/ride/order'

type PrepareRef = ComputedRef<string | undefined> | { value?: string | null } | undefined

const preparedFields = {
  serviceData: ['pickup', 'dropoff', 'date_start', 'hours', 'reqs', 'distance', 'duration', 'car'],
  contactData: ['first_name', 'last_name', 'email', 'phone'],
  contact: ['pickup', 'dropoff', 'date_start', 'hours', 'reqs', 'car'],
  vehicle: ['pickup', 'dropoff', 'date_start', 'hours', 'reqs', 'distance', 'duration'],
  payment: ['pickup', 'dropoff', 'date_start', 'hours', 'reqs', 'distance', 'duration', 'car']
} as const

type PreparedFieldKey = keyof typeof preparedFields
type PreparedFieldValue = (typeof preparedFields)[PreparedFieldKey][number]

interface UseFieldVisibilityResult {
  checkField: (field: string) => boolean
  preparedFields: typeof preparedFields
  sourceFields: ComputedRef<PreparedFieldKey | undefined>
}

const isPreparedFieldKey = (value: string): value is PreparedFieldKey => value in preparedFields

const resolvePrepareValue = (prepareRef: PrepareRef): string | undefined => {
  if (!prepareRef) {
    return undefined
  }

  if (typeof prepareRef === 'object' && 'value' in prepareRef) {
    const rawValue = prepareRef.value
    return typeof rawValue === 'string' ? rawValue : undefined
  }

  return undefined
}

export function useFieldVisibility(prepare?: PrepareRef): UseFieldVisibilityResult {
  const route = useRoute()
  const orderStore = useOrderStore()
  const { orderData } = storeToRefs(orderStore)
  const orderDataRecord = computed(() => orderData.value as Record<string, unknown>)

  const sourceFields = computed<PreparedFieldKey | undefined>(() => {
    const prepareValue = resolvePrepareValue(prepare)
    if (prepareValue && isPreparedFieldKey(prepareValue)) {
      return prepareValue
    }

    const routeName = typeof route.name === 'string' ? route.name : undefined
    if (routeName && isPreparedFieldKey(routeName)) {
      return routeName
    }

    return undefined
  })

  const checkField = (field: string): boolean => {
    const currentSource = sourceFields.value
    if (!currentSource) {
      return false
    }

    const fieldsList = preparedFields[currentSource] as readonly PreparedFieldValue[]
    const fieldName = String(field)

    if (!fieldsList.includes(fieldName as PreparedFieldValue)) {
      return false
    }

    if (!(fieldName in orderDataRecord.value)) {
      return false
    }

    const value = orderDataRecord.value[fieldName]

    if (value == null) {
      return false
    }

    if (fieldName === 'reqs' && value === '') {
      return false
    }

    return true
  }

  return {
    checkField,
    preparedFields,
    sourceFields
  }
}
