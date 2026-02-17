<template>
  <div
    v-if="confirmingCreditBasedPaymentModalStore.isOpen"
    @click="!isModalBlocked && handleClose()"
    class="fixed inset-0 z-40 flex items-center justify-center bg-gray-900 bg-opacity-50 p-4 dark:bg-opacity-80"
  >
    <div
      @click.stop
      class="contact_form_wrapper m-0 h-max w-full max-w-[991px] bg-white dark:bg-[#3D4043] max-md:p-4"
    >
      <div class="w-full">
        <form class="flex flex-col gap-6">
          <div class="relative flex w-full items-center justify-between gap-x-4">
            <span class="justify-self-center text-2xl/[26.4px] font-medium text-main"
              >Confirming Credit-Based Payment</span
            >
            <button
              @click="handleClose"
              :disabled="isModalBlocked"
              aria-label="close"
              class="ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white"
              type="button"
            >
              <svg
                class="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  clip-rule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  fill-rule="evenodd"
                ></path>
              </svg>
            </button>
          </div>
          <div class="text-[18px]">
            <p class="mb-4 font-medium leading-[110%]">
              By selecting this option, you acknowledge and agree:
            </p>
            <ul class="list-disc pl-4 leading-[138%]">
              <li>
                You will pay for this service as part of the cumulative invoice that we'll issue.
              </li>
              <li>
                Your credit limit is indicated in the Account Information. If this limit is
                approached, we will issue an invoice for the services carried out till that moment,
                and once paid the credit line will be reset. In the meanwhile you may book
                additional services paying them individually by credit card.
              </li>
            </ul>
          </div>
          <div class="next_step_button_wrapper w-full !justify-end gap-4 md:flex-row md:gap-10">
            <button
              type="button"
              @click="handleAgree"
              :disabled="isModalBlocked"
              class="next_step_button !text-background disabled:cursor-not-allowed disabled:opacity-50"
            >
              <LoadingSpinner v-show="isModalBlocked" class="stroke-current mr-1" />
              {{ isModalBlocked ? 'Processing...' : 'I agree' }}
            </button>
            <button
              type="button"
              @click="handleClose"
              :disabled="isModalBlocked"
              class="next_step_button gap-x-2.5 !bg-transparent px-16 !text-main disabled:cursor-not-allowed disabled:opacity-50 md:max-w-max"
            >
              I disagree
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useConfirmingCreditBasedPaymentModalStore } from '@/stores/ui/confirmingCreditBasedPaymentModal'
import { usePaymentStateStore } from '@/stores/ui/paymentState'
import LoadingSpinner from '@/components/ui/icons/LoadingSpinner.vue'

const confirmingCreditBasedPaymentModalStore = useConfirmingCreditBasedPaymentModalStore()
const paymentStateStore = usePaymentStateStore()

const isModalBlocked = computed(() => paymentStateStore.isModalBlocked)

const handleClose = () => {
  if (!isModalBlocked.value) {
    confirmingCreditBasedPaymentModalStore.close()
  }
}

const handleAgree = () => {
  if (!isModalBlocked.value) {
    confirmingCreditBasedPaymentModalStore.agree()
  }
}
</script>
