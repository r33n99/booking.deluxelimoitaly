<script setup>
import { useRegisterSW } from 'virtual:pwa-register/vue'
import { onMounted, watch } from 'vue'

// eslint-disable-next-line no-console

// replaced dyanmicaly
const reloadSW = '__RELOAD_SW__'

const { needRefresh, updateServiceWorker } = useRegisterSW({
  immediate: true,
  onRegisteredSW(swUrl, r) {
    // eslint-disable-next-line no-console
    // console.log(`Service Worker at: ${swUrl}`)
    if (reloadSW === 'true') {
      r &&
        setInterval(async () => {
          // eslint-disable-next-line no-console
          // console.log('Checking for sw update', r)
          await r.update()
        }, 20000 /* 20s for testing purposes */)
    } else {
      // eslint-disable-next-line no-console
      // console.log(`SW Registered:`, r)
    }
  }
})

onMounted(() => {
  if (needRefresh.value) {
    document.querySelector('body').classList.add('overflow-y-hidden')
  }
})

watch(needRefresh, () => {
  if (!needRefresh.value) {
    document.querySelector('body').classList.remove('overflow-y-hidden')
  }
})
</script>

<template>
  <div
    v-if="needRefresh"
    class="absolute left-0 top-0 z-[70] h-full w-full bg-black/75"
    role="alert"
  >
    <div
      class="pwa-toast fixed left-0 top-0 flex size-full flex-col items-center justify-center space-y-8 bg-gray-700 p-8 shadow-2xl"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        class="h-10 w-10 animate-pulse fill-main"
      >
        <path
          fill-rule="evenodd"
          d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
          clip-rule="evenodd"
        />
      </svg>

      <div class="text-center text-lg text-black dark:text-white">
        New content available, click on reload button to update.
      </div>

      <button
        @click="updateServiceWorker()"
        class="rounded-md border border-main bg-main px-4 py-2 text-black outline-none duration-300 hover:bg-transparent hover:text-main"
      >
        Reload
      </button>
    </div>
  </div>
</template>

<style></style>
