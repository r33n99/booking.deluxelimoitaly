import { defineStore } from 'pinia'
import { ref, watch, type Ref } from 'vue'
import storage from '@/plugins/storage'

const STORE_NAME = 'main'

type FlowType = 'platform' | 'mainsite' | 'mailcar' | 'transaction'

interface MainStoreState {
  mode: Ref<string>
  ssid: Ref<string | null>
  paymentVisited: Ref<boolean | null>
  priceChanged: Ref<boolean>
  paymentCode: Ref<string | null>
  paymentLink: Ref<string | null>
  paymentSession: Ref<string | null>
  paymentComplete: Ref<boolean>
  isRequesting: Ref<boolean>
  waitPreloaderTitle: Ref<string>
  flow: Ref<FlowType>
}

interface MainStoreActions {
  update(mode: string): void
  updatePriceChanged(value: boolean): void
  updatePaymentComplete(value: boolean): void
  $reset(): void
}

const DEFAULT_FLOW: FlowType = 'platform'
const PAYMENT_COMPLETE_KEY = 'paymentComplete'
const MODE_KEY = 'mode'

const getDefaultMode = (): string => {
  const savedMode = storage.getItem(MODE_KEY)
  if (!savedMode) {
    return 'dark'
  }
  return savedMode
}

const toggleDarkClass = (mode: string): void => {
  const root = document.documentElement
  if (mode === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

export const useMainStore = defineStore(STORE_NAME, () => {
  const paymentCode = ref<string | null>(null)
  const paymentLink = ref<string | null>(null)
  const paymentSession = ref<string | null>(null)
  const paymentComplete = ref<boolean>(Boolean(storage.getItem(PAYMENT_COMPLETE_KEY)))
  const isRequesting = ref<boolean>(false)
  const waitPreloaderTitle = ref<string>('')
  const flow = ref<FlowType>(DEFAULT_FLOW)
  const ssid = ref<string | null>(null)

  const mode = ref<string>(getDefaultMode())
  toggleDarkClass(mode.value)
  watch(mode, (newMode) => toggleDarkClass(newMode))

  const paymentVisited = ref<boolean | null>(null)
  const priceChanged = ref<boolean>(false)

  const update: MainStoreActions['update'] = (value) => {
    mode.value = value
    storage.setItem(MODE_KEY, value)
  }

  const updatePriceChanged: MainStoreActions['updatePriceChanged'] = (value) => {
    priceChanged.value = value
  }

  const updatePaymentComplete: MainStoreActions['updatePaymentComplete'] = (value) => {
    paymentComplete.value = value
    storage.setItem(PAYMENT_COMPLETE_KEY, JSON.stringify(value))
  }

  const $reset: MainStoreActions['$reset'] = () => {
    paymentVisited.value = null
    isRequesting.value = false
    priceChanged.value = false
  }

  return {
    mode,
    ssid,
    paymentVisited,
    priceChanged,
    paymentCode,
    paymentLink,
    paymentSession,
    isRequesting,
    waitPreloaderTitle,
    flow,
    paymentComplete,
    update,
    updatePriceChanged,
    updatePaymentComplete,
    $reset
  } satisfies MainStoreState & MainStoreActions
})

export type MainStore = ReturnType<typeof useMainStore>
