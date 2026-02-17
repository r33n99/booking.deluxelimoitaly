import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'

const STORE_NAME = 'googleAddress'
const LOCALSTORAGE_KEY = 'googleAddress'

type PickupDropoffKey = 'pickup' | 'dropoff'
type TransferType = 'summary' | 'oneWayTransfer' | string

interface GoogleAddressField {
  name: PickupDropoffKey
  placeholder: string
  valid: boolean
}

type GoogleAddressFields = {
  pickup: GoogleAddressField
  dropoff?: GoogleAddressField
}

interface PathStartFinish {
  pickup?: unknown
  dropoff?: unknown
}

interface GoogleAddressStoreState {
  fields: Ref<GoogleAddressFields>
  pathStartFinish: Ref<PathStartFinish>
  activeAuto: Ref<string>
}

interface GoogleAddressStoreActions {
  $reset(): void
  updatePickupDropOff(latLng: unknown, point: PickupDropoffKey): void
  getFieldsWay(type: TransferType): GoogleAddressFields
}

const createField = (
  name: PickupDropoffKey,
  placeholder: string,
  valid: boolean
): GoogleAddressField => ({
  name,
  placeholder,
  valid
})

const createDefaultFields = (): GoogleAddressFields => ({
  pickup: createField('pickup', 'Pick Up Location*', false),
  dropoff: createField('dropoff', 'Drop off Location*', false)
})

const createDefaultPathStartFinish = (): PathStartFinish => ({})

export const useGoogleAddressStore = defineStore(STORE_NAME, () => {
  const fields = ref<GoogleAddressFields>(createDefaultFields())
  const pathStartFinish = ref<PathStartFinish>(createDefaultPathStartFinish())
  const activeAuto = ref<string>('')

  const $reset: GoogleAddressStoreActions['$reset'] = () => {
    sessionStorage.removeItem(LOCALSTORAGE_KEY)
    pathStartFinish.value = createDefaultPathStartFinish()
    fields.value = createDefaultFields()
    activeAuto.value = ''
  }

  const updatePickupDropOff: GoogleAddressStoreActions['updatePickupDropOff'] = (latLng, point) => {
    pathStartFinish.value = {
      ...pathStartFinish.value,
      [point]: latLng
    }
  }

  const getFieldsWay: GoogleAddressStoreActions['getFieldsWay'] = (type) => {
    switch (type) {
      case 'summary':
        return {
          pickup: createField('pickup', 'Pick Up Location*', true),
          dropoff: createField('dropoff', 'Drop off Location*', true)
        }
      case 'oneWayTransfer':
        return createDefaultFields()
      default:
        return {
          pickup: createField('pickup', 'Pick Up Location*', false)
        }
    }
  }

  return {
    fields,
    activeAuto,
    pathStartFinish,
    $reset,
    getFieldsWay,
    updatePickupDropOff
  } as GoogleAddressStoreState & GoogleAddressStoreActions
})

export type GoogleAddressStore = ReturnType<typeof useGoogleAddressStore>
