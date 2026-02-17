<template>
  <Transition>
    <div
      v-if="!isLoaded"
      class="pagePreloader fixed left-0 top-0 z-50 flex h-full w-full items-center justify-center duration-300"
    >
      <div class="flex h-[200px] w-[200px] items-center justify-center">
        <svg
          class="absolute animate-spin fill-main"
          style="shape-rendering: auto"
          width="200px"
          height="200px"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid"
        >
          <path d="M10 50A40 40 0 0 0 90 50A40 42 0 0 1 10 50" stroke="none"></path>
        </svg>
        <picture class="flex w-3/5 items-center justify-center">
          <source :srcset="logosWebP[mode as keyof typeof logos]" type="image/webp" />
          <img :src="logos[mode as keyof typeof logos]" class="w-full" alt="Logo" />
        </picture>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { reactive, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, type RouteLocationNormalizedLoaded } from 'vue-router'

import darklogo from '~project_assets/images/logo.png'
import lightlogo from '~project_assets/images/logo-light.png'
import darklogoWebP from '~project_assets/images/logo.webp'
import lightlogoWebP from '~project_assets/images/logo-light.webp'
import { useMainStore } from '@/stores/ui/main'

const mainStore = useMainStore()

const isLoaded = ref<boolean>(false)

const { mode } = storeToRefs(mainStore)

const route = useRoute()

const logos = reactive<Record<'light' | 'dark', string>>({
  light: lightlogo,
  dark: darklogo
})

const logosWebP = reactive<Record<'light' | 'dark', string>>({
  light: lightlogoWebP,
  dark: darklogoWebP
})

const handleLoad = () => {
  if (route.name !== 'spySignIn') {
    isLoaded.value = true
  } else {
    const stopWatch = watch(
      () => route.name,
      (newName) => {
        if (newName !== 'spySignIn') {
          isLoaded.value = true
          stopWatch()
        }
      }
    )
  }
}

let domContentLoadedHandler: (() => void) | null = null

onMounted(() => {
  // Используем DOMContentLoaded для более раннего скрытия прелоадера
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    // Небольшая задержка для обеспечения рендеринга контента
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        handleLoad()
      })
    })
  } else {
    domContentLoadedHandler = () => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          handleLoad()
        })
      })
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', domContentLoadedHandler, { once: true })
    } else {
      domContentLoadedHandler()
    }
    // Fallback на window.load для совместимости
    window.addEventListener('load', handleLoad, { once: true })
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('load', handleLoad)
  if (domContentLoadedHandler) {
    document.removeEventListener('DOMContentLoaded', domContentLoadedHandler)
  }
})
</script>

<style scoped>
.v-leave-to {
  opacity: 0;
}
</style>
