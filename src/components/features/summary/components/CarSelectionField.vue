<template>
  <div
    v-if="checkField('car') && selectedCar"
    class="summary_item_wrapper mb-4 h-max w-min pb-0 md:mb-0 md:pb-[20px]"
  >
    <span class="summary_item_title">Car:</span>
    <div
      :class="smallScreen ? 'flex-col items-start' : 'flex-row items-center'"
      class="flex justify-start"
    >
      <span class="summary_item_input_sibling break-word w-max"
        >{{ selectedCar.slug_class_name }}
      </span>
      <div v-if="!isMobile" class="popup_opened group relative py-2">
        <div
          class="fixed left-1/2 top-1/2 z-40 hidden w-[514px] -translate-x-1/2 -translate-y-1/2 drop-shadow-popup group-hover:block"
        >
          <car-popup-content />
        </div>
        <span class="summary_view_button ml-2 cursor-pointer">View</span>
      </div>
      <div v-if="isMobile" :class="!smallScreen && 'ml-2'" class="py-2 leading-[1]">
        <button @click="emit('open-modal')" class="summary_view_button">View</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { onMounted, onUnmounted, ref } from 'vue'
import { useMobile } from '@/compose/ismobile'
import { useCarsStore } from '@/stores/ride/cars'
import CarPopupContent from '@/components/features/car/CarPopupContent.vue'
import type { CarSummary } from '@/types/stores/ride/cars'

interface CarSelectionFieldProps {
  checkField: (field: string) => boolean
  isModalOpen?: boolean
}

const props = withDefaults(defineProps<CarSelectionFieldProps>(), {
  isModalOpen: false
})

const emit = defineEmits<{
  (event: 'open-modal'): void
  (event: 'close-modal'): void
}>()

const { isMobile } = useMobile()
const smallScreen = ref(false)

const updateSmallScreen = () => {
  if (typeof window === 'undefined') {
    return
  }
  smallScreen.value = window.innerWidth <= 450
}

onMounted(() => {
  updateSmallScreen()
  window.addEventListener('resize', updateSmallScreen)
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', updateSmallScreen)
  }
})

const carsStore = useCarsStore()
const { selectedCar } = storeToRefs(carsStore)

const checkField = (field: 'car') => props.checkField(field)
</script>
