<template>
  <div class="flex w-full flex-col items-start justify-between xl:w-[35%]">
    <a
      :href="addressLink"
      target="_blank"
      rel="nofollow noopener noreferrer"
      class="menu_text mb-8 hover:text-placeholder xl:mb-[40px]"
      v-safe-html="address"
    ></a>
    <a :href="phoneLink" class="menu_text mb-2 hover:text-placeholder">
      {{ phone }}
    </a>
    <a :href="'mailto:' + email" class="menu_text mb-8 hover:text-placeholder xl:mb-[40px]">
      {{ email }}
    </a>
    <div v-if="!isRomalimoItaly" class="mb-[40px] flex w-fit flex-row items-start justify-between">
      <a
        href="https://www.instagram.com/DeluxeLimoItaly"
        rel="nofollow noopener noreferrer"
        target="_blank"
        class="menu_text mr-4 hover:text-placeholder"
      >
        IG
      </a>
      <a
        href="https://www.facebook.com/DeluxeLimoItaly"
        rel="nofollow noopener noreferrer"
        target="_blank"
        class="menu_text mr-4 hover:text-placeholder"
      >
        FB
      </a>
      <a
        href="https://twitter.com/DeluxeLimoItaly"
        rel="nofollow noopener noreferrer"
        target="_blank"
        class="menu_text mr-4 hover:text-placeholder"
      >
        TW
      </a>
      <a
        href="https://www.tripadvisor.com/Attraction_Review-g187895-d13397003-Reviews-Deluxe_Limo_Italy-Florence_Tuscany.html"
        rel="nofollow noopener noreferrer"
        target="_blank"
        class="menu_text hover:text-placeholder"
      >
        TA
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const isRomalimoItaly = computed(() => {
  return import.meta.env.VITE_PROJECT_ALIAS === 'rlt'
})

const phone = ref(import.meta.env.VITE_PROJECT_PHONE)
const email = ref(import.meta.env.VITE_PROJECT_EMAIL)

const phoneComputed = computed(() => {
  return phone.value.toString().replace(' ', '')
})

const phoneLink = computed(() => {
  return 'tel:' + phoneComputed.value
})

const address = computed(() => {
  return import.meta.env.VITE_PROJECT_ADDRESS
})

const addressLink = computed(() => {
  return import.meta.env.VITE_PROJECT_ADDRESS_LINK
})
</script>

<style scoped></style>
