<template>
  <div
    style="z-index: 1000099 !important"
    @click="closeModal"
    class="defaultModal fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-70 p-4"
  >
    <div @click.stop class="wrapper h-max w-full max-w-2xl rounded-lg bg-transparent">
      <div class="flex justify-end p-4">
        <button
          @click="closeModal"
          aria-label="close"
          class="closeButton inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400"
          type="button"
        >
          <svg
            class="h-5 w-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              clip-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              fill-rule="evenodd"
            ></path>
          </svg>
        </button>
      </div>
      <div class="p-6 pt-0">
        <h1 class="mb-3 text-3xl">Invalid Address</h1>
        <p class="text-lg">
          The address entered is not valid. Please select a location within EU or Switzerland to
          proceed.
        </p>
      </div>
      <div class="border-t border-gray-600 p-6">
        <button
          @click="closeModal"
          type="button"
          class="rounded-[37px] bg-main px-5 py-2.5 text-center text-background"
        >
          Ok
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{ (event: 'closeModal'): void }>()

const closeModal = () => {
  emit('closeModal')
}
</script>

<style scoped></style>
