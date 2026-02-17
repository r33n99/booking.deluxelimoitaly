<template>
  <div class="tour-card-skeleton animate-pulse rounded-[18px] bg-[#F2F2F2] p-3 dark:bg-[#1E1E20]">
    <!-- Image Skeleton -->
    <div class="mb-4 aspect-[4/3] w-full rounded-[14px] bg-gray-300 dark:bg-gray-700"></div>

    <!-- Title Skeleton -->
    <div class="mb-3 h-6 w-3/4 rounded bg-gray-300 dark:bg-gray-700"></div>

    <!-- Description Lines -->
    <div class="mb-2 h-4 w-full rounded bg-gray-300 dark:bg-gray-700"></div>
    <div class="mb-4 h-4 w-5/6 rounded bg-gray-300 dark:bg-gray-700"></div>

    <!-- Chips Skeleton -->
    <div class="flex gap-2">
      <div class="h-8 w-20 rounded-full bg-gray-300 dark:bg-gray-700"></div>
      <div class="h-8 w-24 rounded-full bg-gray-300 dark:bg-gray-700"></div>
    </div>
  </div>
</template>

<script setup>
// Простой skeleton компонент для TourCard
</script>

<style lang="scss" scoped>
.tour-card-skeleton {
  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  .animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
}
</style>
