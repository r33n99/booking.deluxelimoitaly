<template>
  <section
    class="gap-x-15 relative mt-[6px] flex overflow-hidden rounded-[18px] bg-white p-3 dark:bg-dark_wind max-xl:flex-col lg:p-12 xl:mt-12"
  >
    <div class="mb-6 flex w-full flex-col xl:mb-0 xl:max-w-[293px]">
      <!-- Step number skeleton -->
      <tour-skeleton class="mb-2.5 h-[18px] w-[60px]" />
      <!-- Title skeleton -->
      <tour-skeleton class="mb-6 h-[35px] w-[220px] lg:h-[45px]" />
      <!-- Description skeleton -->
      <tour-skeleton class="mb-2 h-[18px] w-full" />
      <tour-skeleton class="mb-2 h-[18px] w-[90%]" />
      <tour-skeleton class="h-[18px] w-[70%]" />
    </div>

    <div class="flex w-full flex-col gap-y-6">
      <!-- Addon cards skeletons (3 cards) -->
      <div
        v-for="index in 3"
        :key="index"
        class="flex gap-4 rounded-[18px] bg-[#F2F2F2] p-[18px] dark:bg-[#1E1E20] max-xl:flex-col"
      >
        <div class="flex h-full w-full flex-col gap-x-4 gap-y-4 xl:flex-row">
          <!-- Image skeleton -->
          <div
            class="relative flex h-[160px] w-full items-center justify-center rounded-[10px] bg-[#00000033] py-4 xl:h-full xl:max-w-[218px] xl:py-0"
          >
            <tour-skeleton class="h-[121px] w-[185px] rounded-xl" />
          </div>

          <div class="flex flex-1 flex-col">
            <!-- Addon name skeleton -->
            <tour-skeleton class="mb-2 h-[28px] w-[200px]" />
            <!-- Addon description skeletons -->
            <tour-skeleton class="mb-1 h-[14px] w-full" />
            <tour-skeleton class="mb-1 h-[14px] w-[95%]" />
            <tour-skeleton class="h-[14px] w-[80%]" />

            <div class="border-t-1 my-5 border-[#1F1F1F]"></div>

            <!-- Price button skeleton -->
            <tour-skeleton class="h-[68px] w-full rounded-[40px]" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import TourSkeleton from '@/components/ui/tours/TourSkeleton.vue'
</script>
