<template>
  <span v-safe-html="clampedText"></span>
  <span v-if="isClamped">...</span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface TourClampedTextProps {
  text: string
  limit?: number
}

const props = withDefaults(defineProps<TourClampedTextProps>(), {
  limit: 300
})

const isClamped = computed<boolean>(() => props.text.length > props.limit)
const clampedText = computed<string>(() =>
  isClamped.value ? props.text.slice(0, props.limit) : props.text
)
</script>
