<template>
  <div
    class="leading-24 rounded-full px-2 py-0 text-[12px] lg:px-3 lg:py-[0.25rem]"
    :class="variantClasses"
  >
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type TourChipVariant = 'default' | 'outlined'

const props = withDefaults(defineProps<{ variant?: TourChipVariant }>(), {
  variant: 'default'
})

const variantClasses = computed<string>(() => {
  const classes: Record<TourChipVariant, string> = {
    default: 'bg-main/50 text-white backdrop-blur-[4px]',
    outlined: 'bg-main/5 border border-main text-black dark:text-[#FFFFFF]'
  }

  return classes[props.variant]
})
</script>

<style scoped></style>
