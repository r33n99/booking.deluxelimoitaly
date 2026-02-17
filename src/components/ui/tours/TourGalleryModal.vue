<template>
  <div class="fixed inset-0 z-40 bg-black/50" @click="handleClose"></div>
  <div
    class="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-full max-w-[1299px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[18px] bg-[#151515]"
    @click.stop
  >
    <div
      @click="handleClose"
      class="absolute right-6 top-6 flex w-max cursor-pointer items-center justify-center self-end rounded-full bg-[#1A1A1A] p-4"
    >
      <close-icon />
    </div>
    <tour-about-content v-if="props.pageData" :data="props.pageData" />
  </div>
</template>

<script setup lang="ts">
import CloseIcon from '@/components/ui/icons/CloseIcon.vue'
import TourAboutContent from '@/components/ui/tours/TourAboutContent.vue'
import type { TourAboutContentData } from '@/components/ui/tours/types'

const props = defineProps<{ pageData?: TourAboutContentData | null }>()

const emit = defineEmits<{ (e: 'close'): void }>()

const handleClose = (): void => {
  emit('close')
}
</script>

<style lang="scss"></style>
