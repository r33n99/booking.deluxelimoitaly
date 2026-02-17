import { ref } from 'vue'
import { defineStore } from 'pinia'

interface ConfirmingCreditBasedPaymentModalState {
  isOpen: boolean
  agreed: boolean
}

interface ConfirmingCreditBasedPaymentModalActions {
  show(): void
  close(): void
  agree(): void
}

export const useConfirmingCreditBasedPaymentModalStore = defineStore(
  'confirmingCreditBasedPaymentModal',
  () => {
    const isOpen = ref<boolean>(false)
    const agreed = ref<boolean>(false)

    const show: ConfirmingCreditBasedPaymentModalActions['show'] = () => {
      isOpen.value = true
    }

    const close: ConfirmingCreditBasedPaymentModalActions['close'] = () => {
      isOpen.value = false
      agreed.value = false
    }

    const agree: ConfirmingCreditBasedPaymentModalActions['agree'] = () => {
      agreed.value = true
    }

    return {
      isOpen,
      agreed,
      show,
      close,
      agree
    } satisfies Record<keyof ConfirmingCreditBasedPaymentModalState, typeof isOpen> &
      ConfirmingCreditBasedPaymentModalActions
  }
)

export type ConfirmingCreditBasedPaymentModalStore = ReturnType<
  typeof useConfirmingCreditBasedPaymentModalStore
>
