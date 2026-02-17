<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center bg-opacity-30 backdrop-blur-sm"
        @click="closeOnBackdrop && close()"
      >
        <div class="relative" :class="[containerClass]" @click.stop>
          <div class="overflow-hidden rounded-2xl bg-white dark:bg-[#2A2A2A]" :class="[modalClass]">
            <!-- Header -->
            <div v-if="$slots.header || title" class="p-6" :class="[headerClass]">
              <slot name="header">
                <h2 class="text-center text-[28px] font-medium text-white">{{ title }}</h2>
              </slot>
            </div>

            <!-- Close button -->
            <button
              v-if="showCloseButton"
              @click="close"
              class="absolute right-4 top-4 text-gray-400 hover:text-white"
              :class="[closeButtonClass]"
            >
              <slot name="close-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M18 6L6 18"></path>
                  <path d="M6 6L18 18"></path>
                </svg>
              </slot>
            </button>

            <!-- Body -->
            <div class="p-1" :class="[bodyClass]">
              <slot>
                <!-- Modal content goes here -->
              </slot>
            </div>

            <!-- Footer -->
            <div v-if="$slots.footer || showDefaultFooter" class="p-6" :class="[footerClass]">
              <slot name="footer">
                <button
                  v-if="showDefaultFooter"
                  class="button w-full"
                  :class="[actionButtonClass]"
                  @click="confirm"
                >
                  <p class="text-18 font-medium">{{ actionButtonText }}</p>
                </button>
              </slot>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'

interface PaymentModalProps {
  modelValue: boolean
  title?: string
  showCloseButton?: boolean
  closeOnBackdrop?: boolean
  closeOnEsc?: boolean
  showDefaultFooter?: boolean
  actionButtonText?: string
  modalClass?: string
  containerClass?: string
  headerClass?: string
  bodyClass?: string
  footerClass?: string
  closeButtonClass?: string
  actionButtonClass?: string
}

const props = withDefaults(defineProps<PaymentModalProps>(), {
  title: '',
  showCloseButton: true,
  closeOnBackdrop: true,
  closeOnEsc: true,
  showDefaultFooter: false,
  actionButtonText: 'OK',
  modalClass: 'w-full max-w-md',
  containerClass: '',
  headerClass: '',
  bodyClass: '',
  footerClass: '',
  closeButtonClass: '',
  actionButtonClass: ''
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'close'): void
  (e: 'confirm'): void
}>()

const close = (): void => {
  emit('update:modelValue', false)
  emit('close')
}

const confirm = (): void => {
  emit('confirm')
  close()
}

const handleKeyDown = (event: KeyboardEvent): void => {
  if (event.key === 'Escape' && props.closeOnEsc && props.modelValue) {
    close()
  }
}

const preventScroll = (): void => {
  if (props.modelValue) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

watch(
  () => props.modelValue,
  () => {
    preventScroll()
  }
)

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
  preventScroll()
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
