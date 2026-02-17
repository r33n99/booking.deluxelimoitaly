<template>
  <div
    class="flex flex-col flex-wrap items-center justify-center pb-[40px] text-center md:pb-[64px]"
  >
    <h1 class="mr-[15px] mt-[5rem] text-[50px]">Oops! It looks like this page went missing.</h1>
    <button @click="router.push('/')" type="submit" class="button mt-5">Home page</button>
  </div>
</template>
<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>
