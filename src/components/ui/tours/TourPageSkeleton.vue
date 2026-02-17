<template>
  <div class="tour-page-skeleton my-3 lg:my-12 lg:mt-12">
    <!-- Gallery skeleton -->
    <section class="space-y-14 rounded-[18px]">
      <div class="lg:min-h-auto block xl:max-h-[750px] 2xl:max-h-[1024px]">
        <tour-skeleton class="aspect-[4/3] w-full rounded-[14px] md:max-h-[550px]" />
      </div>
    </section>

    <!-- Tour info skeleton -->
    <section
      class="lg:gap-x-15 relative mt-12 flex overflow-hidden rounded-[18px] bg-white p-3 py-8 dark:bg-dark_wind max-lg:flex-col lg:p-12"
    >
      <div class="flex gap-y-6 pb-0 max-lg:flex-col lg:gap-x-[70px]">
        <div class="lg:max-w-[530px]">
          <!-- Title skeleton -->
          <tour-skeleton class="mb-4 h-[40px] w-[90%] lg:h-[58px]" />
          <div class="flex flex-row flex-wrap gap-1.5">
            <!-- Chips skeletons -->
            <tour-skeleton class="h-[38px] w-[120px] rounded-full" />
            <tour-skeleton class="h-[38px] w-[150px] rounded-full" />
          </div>
        </div>
        <div class="text-16 xl:text-20 col-span-full w-full lg:col-span-7">
          <!-- Description skeletons -->
          <tour-skeleton class="mb-2 h-[20px] w-full" />
          <tour-skeleton class="mb-2 h-[20px] w-full" />
          <tour-skeleton class="mb-2 h-[20px] w-[95%]" />
          <tour-skeleton class="mb-2 h-[20px] w-full" />
          <tour-skeleton class="mb-6 h-[20px] w-[80%]" />

          <!-- Highlights chips skeletons -->
          <div class="mt-6 flex flex-wrap gap-2">
            <tour-skeleton
              v-for="index in 4"
              :key="index"
              class="h-[36px] w-[100px] rounded-full"
            />
          </div>

          <!-- Button skeleton -->
          <tour-skeleton class="mt-6 h-[58px] w-full rounded-[40px] md:mt-12 lg:w-[180px]" />
        </div>
      </div>
    </section>

    <!-- Participants section skeleton -->
    <section
      class="lg:gap-x-15 relative mt-[6px] flex overflow-hidden rounded-[18px] bg-white p-3 dark:bg-dark_wind max-lg:flex-col lg:p-12 xl:mt-12"
    >
      <div class="flex w-full flex-col lg:mb-0 lg:max-w-[293px]">
        <tour-skeleton class="mb-2.5 h-[18px] w-[60px]" />
        <tour-skeleton class="mb-7 h-[35px] w-[200px] lg:h-[45px]" />
      </div>
      <div class="flex w-full flex-col gap-y-6 lg:-col-end-1">
        <div
          class="flex h-full justify-between gap-6 rounded-[40px] bg-[#F2F2F2] p-[18px] dark:bg-[#1E1E20] max-sm:flex-col sm:items-center lg:max-xl:flex-col"
        >
          <tour-skeleton class="h-[28px] w-[200px]" />
          <div class="flex w-full flex-row items-center gap-x-4 sm:max-lg:w-max xl:w-max">
            <tour-skeleton class="h-[56px] w-full rounded-full sm:w-[140px] lg:w-[180px]" />
            <tour-skeleton class="h-[28px] w-[40px]" />
            <tour-skeleton class="h-[56px] w-full rounded-full sm:w-[140px] lg:w-[180px]" />
          </div>
        </div>
      </div>
    </section>

    <!-- Addon blocks skeletons -->
    <tour-selector-block-skeleton v-for="index in 3" :key="index" />

    <!-- Divider -->
    <div class="border-b-1 my-[6px] border-[#313131] xl:my-12"></div>

    <!-- Booking bar skeleton -->
    <section class="bottom-[20px] left-0 z-10 flex w-full flex-col items-center xl:hidden">
      <div class="w-full rounded-[18px] bg-white p-6 dark:bg-dark_wind">
        <tour-skeleton class="mb-4 h-[60px] w-full rounded-[40px]" />
        <div class="flex gap-4">
          <tour-skeleton class="h-[48px] flex-1 rounded-[40px]" />
          <tour-skeleton class="h-[48px] flex-1 rounded-[40px]" />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import TourSkeleton from '@/components/ui/tours/TourSkeleton.vue'
import TourSelectorBlockSkeleton from '@/components/ui/tours/TourSelectorBlockSkeleton.vue'
</script>
