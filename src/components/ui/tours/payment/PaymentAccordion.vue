<template>
  <div class="flex w-full flex-col">
    <div @click="toggleAccordion" class="flex cursor-pointer items-center gap-[0.75rem]">
      <span>{{ title }}</span>
      <svg
        width="14"
        height="8"
        viewBox="0 0 14 8"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        data-v-inspector="components/ui/TrustyComplete.vue:8:7"
        class="stroke-black stroke-2 duration-300 dark:stroke-white max-md:ml-auto"
        :class="{ 'rotate-180': isShow, 'rotate-0': !isShow }"
        data-v-e7d25b7a=""
      >
        <path
          d="M1 1L7 7L13 1"
          stroke-linecap="square"
          data-v-inspector="components/icons/ArrowDownOutlinedIcon.vue:3:5"
        ></path>
      </svg>
    </div>
    <div v-show="isShow" class="duration-300">
      <slot></slot>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'

const isShow = ref(false)

const toggleAccordion = () => {
  isShow.value = !isShow.value
}
defineProps({
  title: {
    type: String,
    default: 'Show details'
  }
})
</script>
