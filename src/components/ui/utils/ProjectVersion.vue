<template>
  <div v-if="!isProduction" class="fixed bottom-5 left-5 z-50 flex flex-col items-start gap-2.5">
    <div
      v-if="isShown"
      class="whitespace-nowrap rounded-lg bg-background px-4 py-2 text-sm text-white shadow-lg"
    >
      <div class="flex items-center gap-2">
        <div class="h-2 w-2 rounded-full bg-green-400"></div>
        <span>v{{ version }}</span>
      </div>
    </div>
    <button
      @click="showVersion"
      aria-label="Show project version"
      class="h-12 w-12 rounded-full bg-background p-2.5 shadow-lg transition-shadow hover:shadow-xl"
    >
      <GitIcon />
    </button>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import GitIcon from '@/components/ui/icons/GitIcon.vue'

const isShown = ref(false)
const isProduction = computed(() => {
  return import.meta.env.VITE_APP_ENV === 'production'
})
const version = computed(() => {
  return import.meta.env.VITE_PROJECT_VERSION
})

const showVersion = () => (isShown.value = !isShown.value)
</script>

<style scoped></style>
