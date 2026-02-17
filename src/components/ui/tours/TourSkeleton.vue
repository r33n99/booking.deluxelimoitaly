<template>
  <div class="animate-pulse rounded-md bg-[#0E0E0E]" :class="[customClass]"></div>
</template>

<script setup lang="ts">
defineProps({
  customClass: {
    type: String,
    default: ''
  }
})
</script>
