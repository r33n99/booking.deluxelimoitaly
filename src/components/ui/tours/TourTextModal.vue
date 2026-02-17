<template>
  <div class="fixed inset-0 z-40 bg-black/50" @click="handleClose"></div>
  <div
    class="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-full max-w-[1299px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[18px] bg-white p-6 dark:bg-[#2B2D32] md:p-16"
  >
    <div
      @click="handleClose"
      class="absolute right-6 top-6 flex w-max cursor-pointer items-center justify-center self-end rounded-full bg-[#1A1A1A] p-4"
    >
      <close-icon />
    </div>
    <div class="grid grid-cols-3 gap-6">
      <p>
        {{ props.title }}
      </p>
      <div class="col-span-full flex flex-col gap-y-6 md:col-span-2">
        <p
          v-if="props.description"
          class="text-24 font-medium text-black dark:text-white"
          v-safe-html="props.description"
        ></p>
        <span
          class="text-[20px]/[110%] font-light text-[#8D8D8D]"
          v-safe-html="props.text ?? ''"
        ></span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import CloseIcon from '@/components/ui/icons/CloseIcon.vue'

interface TourTextModalProps {
  title: string
  description?: string | null
  text?: string | null
  modalId?: string | number | null
}

const props = defineProps<TourTextModalProps>()

const emit = defineEmits<{ (e: 'close', modalId?: string | number | null): void }>()

const handleClose = (): void => {
  emit('close', props.modalId)
}
</script>
