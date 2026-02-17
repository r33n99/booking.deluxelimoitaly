import { ref } from 'vue'
import type { Ref } from 'vue'
import { defineStore } from 'pinia'

type PaymentMethod = 'card' | 'credits' | null

interface PaymentState {
  isLoading: Ref<boolean>
  paymentMethod: Ref<PaymentMethod>
  isModalBlocked: Ref<boolean>
}

interface PaymentStateActions {
  setLoading(loading: boolean, method?: PaymentMethod): void
  setModalBlocked(blocked: boolean): void
  reset(): void
}

export const usePaymentStateStore = defineStore('paymentState', () => {
  const isLoading = ref<boolean>(false)
  const paymentMethod = ref<PaymentMethod>(null)
  const isModalBlocked = ref<boolean>(false)

  const setLoading: PaymentStateActions['setLoading'] = (loading, method = null) => {
    isLoading.value = loading
    paymentMethod.value = method
  }

  const setModalBlocked: PaymentStateActions['setModalBlocked'] = (blocked) => {
    isModalBlocked.value = blocked
  }

  const reset: PaymentStateActions['reset'] = () => {
    isLoading.value = false
    paymentMethod.value = null
    isModalBlocked.value = false
  }

  return {
    isLoading,
    paymentMethod,
    isModalBlocked,
    setLoading,
    setModalBlocked,
    reset
  } satisfies PaymentState & PaymentStateActions
})

export type PaymentStateStore = ReturnType<typeof usePaymentStateStore>
