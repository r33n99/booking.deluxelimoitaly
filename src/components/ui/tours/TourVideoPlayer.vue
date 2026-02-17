<template>
  <div
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    class="video-player relative w-full overflow-hidden"
    :class="isLoading && 'animate-pulse bg-background'"
    @click.stop
  >
    <div
      v-if="isLoading && loader"
      class="absolute inset-0 flex h-full w-full items-center justify-center"
    >
      <svg
        class="animate-spin lg:size-[50px]"
        width="112"
        height="111"
        viewBox="0 0 112 111"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M41.0916 102.882C40.1256 105.952 41.8285 109.257 44.9829 109.896C50.5894 111.031 56.3495 111.295 62.0588 110.668C69.7034 109.829 77.0901 107.41 83.7503 103.564C90.4105 99.7189 96.1988 94.5314 100.748 88.3307C105.297 82.13 108.508 75.0515 110.177 67.5442C111.846 60.0369 111.937 52.2647 110.443 44.7206C108.949 37.1765 105.904 30.0251 101.5 23.7202C97.0968 17.4152 91.4308 12.0943 84.862 8.09496C79.9561 5.10807 74.6265 2.907 69.0671 1.5602C65.9391 0.802437 62.9966 3.07387 62.5709 6.26403C62.1451 9.45418 64.4026 12.3475 67.5082 13.1922C71.4726 14.2706 75.2753 15.9034 78.8009 18.05C83.9903 21.2095 88.4665 25.413 91.9454 30.3939C95.4243 35.3749 97.8301 41.0244 99.0101 46.9843C100.19 52.9441 100.119 59.0842 98.8001 65.0149C97.4816 70.9457 94.945 76.5377 91.351 81.4363C87.7571 86.3348 83.1843 90.433 77.9227 93.4708C72.6612 96.5086 66.8257 98.4197 60.7864 99.083C56.6834 99.5336 52.5471 99.4015 48.4992 98.6986C45.3282 98.148 42.0575 99.8124 41.0916 102.882Z"
          fill="white"
        />
        <path
          class="fill-main"
          d="M49.0869 104.689C48.639 107.876 45.6808 110.127 42.5582 109.348C35.6282 107.618 29.0788 104.562 23.28 100.329C15.9078 94.9483 9.97644 87.8324 6.01125 79.6117C2.04605 71.391 0.169453 62.3193 0.547674 53.2001C0.925895 44.0809 3.54726 35.1957 8.17958 27.3316C12.8119 19.4675 19.3122 12.8672 27.1046 8.11532C34.8971 3.36345 43.7412 0.606699 52.8535 0.0892623C61.9659 -0.428174 71.0652 1.30967 79.3455 5.14887C85.8586 8.16867 91.7068 12.4153 96.5795 17.6376C98.7751 19.9908 98.2406 23.6694 95.6702 25.6063C93.0999 27.5432 89.471 26.9967 87.2105 24.7057C83.5373 20.9828 79.2161 17.9357 74.443 15.7226C67.9015 12.6896 60.7131 11.3167 53.5143 11.7255C46.3155 12.1343 39.3287 14.3121 33.1727 18.0661C27.0166 21.8201 21.8814 27.0343 18.2219 33.247C14.5623 39.4596 12.4915 46.4789 12.1927 53.6831C11.8939 60.8872 13.3764 68.0539 16.5089 74.5483C19.6414 81.0426 24.3272 86.6642 30.1512 90.915C34.4009 94.0168 39.1609 96.3189 44.1979 97.7267C47.2975 98.593 49.5348 101.502 49.0869 104.689Z"
        />
      </svg>
    </div>
    <div v-if="isLoading && skeleton" class="absolute inset-0 h-full w-full">
      <slot name="skeleton"></slot>
    </div>
    <img
      v-if="onlyView && posterToDisplay"
      :src="posterToDisplay"
      alt="video preview"
      class="h-full w-full object-cover"
    />

    <video
      v-else-if="src"
      ref="video"
      :playsinline="true"
      @play="emit('play')"
      @pause="emit('pause')"
      @canplay="handleCanPlay"
      @loadeddata="handleLoaded"
      @waiting="handleWaiting"
      @error="handleError"
      :src="src"
      :loop="loop"
      :poster="posterToDisplay"
      @ended="onEnded"
      :controls="controls"
      :autoplay="autoplay"
      allow="autoplay"
      :muted="true"
      :class="{
        'opacity-50':
          isMouseOnVideo &&
          !props.onlyView &&
          (props.src?.split('.').pop() === 'webm' || props.src?.split('.').pop() === 'mp4')
      }"
      class="h-full w-full object-cover duration-300"
    />

    <div
      class="play-button size-[50px] bg-white opacity-0 duration-300 md:size-[122px]"
      :class="[
        playButtonCustomClass,
        {
          '!opacity-100':
            !props.onlyView &&
            isMouseOnVideo &&
            isVideoReady &&
            (props.src?.split('.').pop() === 'webm' || props.src?.split('.').pop() === 'mp4')
        }
      ]"
      @click.stop.prevent="togglePlay"
    >
      <svg
        v-if="!isPlaying"
        class="icon size-5 fill-main backdrop-opacity-5 md:size-[50px]"
        :class="[playButtonIconCustomClass]"
        xmlns="http://www.w3.org/2000/svg"
        width="40"
        height="46"
        viewBox="0 0 40 46"
        fill="none"
      >
        <path
          d="M38 19.5359C40.6667 21.0755 40.6667 24.9245 38 26.4641L6.5 44.6506C3.83333 46.1902 0.500002 44.2657 0.500002 41.1865L0.500003 4.81346C0.500003 1.73426 3.83334 -0.190237 6.5 1.34936L38 19.5359Z"
        />
      </svg>
      <svg
        v-else
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        class="icon size-5 fill-main backdrop-opacity-5 md:size-[50px]"
        :class="[playButtonIconCustomClass]"
      >
        <rect x="6" y="3" width="4" height="18" />
        <rect x="14" y="3" width="4" height="18" />
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed, type Ref } from 'vue'

type ClassValue = string | string[] | Record<string, boolean>

interface TourVideoPlayerProps {
  src?: string
  controls?: boolean
  poster?: string
  autoplay?: boolean
  onlyView?: boolean
  loop?: boolean
  skeleton?: boolean
  playButtonCustomClass?: ClassValue
  playButtonIconCustomClass?: ClassValue
  loader?: boolean
}

const props = withDefaults(defineProps<TourVideoPlayerProps>(), {
  controls: false,
  autoplay: false,
  onlyView: false,
  loop: false,
  skeleton: false,
  playButtonCustomClass: '',
  playButtonIconCustomClass: '',
  loader: false
})

const emit = defineEmits<{
  (e: 'play'): void
  (e: 'pause'): void
  (e: 'ended'): void
  (e: 'mouseenter'): void
  (e: 'mouseleave'): void
  (e: 'loaded'): void
  (e: 'loading'): void
}>()

const isMouseOnVideo = ref<boolean>(true)
const isPlaying = ref<boolean>(false)
const video: Ref<HTMLVideoElement | null> = ref(null)
const localPoster = ref<string | undefined>(undefined)
const isVideoReady = ref<boolean>(false)
const isLoading = ref<boolean>(true)

const posterToDisplay = computed<string | undefined>(() => props.poster ?? localPoster.value)

const handleCanPlay = (): void => {
  isVideoReady.value = true
  if (!isLoading.value) return
  window.setTimeout(() => {
    isLoading.value = false
    emit('loaded')
  }, 300)
}

const togglePlay = (): void => {
  if (props.onlyView || !video.value) return

  if (isPlaying.value) {
    video.value.pause()
    isPlaying.value = false
    emit('pause')
    return
  }

  video.value
    .play()
    .then(() => {
      isPlaying.value = true
      emit('play')
    })
    .catch(() => {
      isPlaying.value = false
    })
}

const handleLoaded = (): void => {
  isLoading.value = false
  emit('loaded')
}

const handleWaiting = (): void => {
  isLoading.value = true
  emit('loading')
}

const handleError = (): void => {
  isLoading.value = false
  emit('loaded')
}

const handleMouseEnter = (): void => {
  isMouseOnVideo.value = true
  emit('mouseenter')
}

const handleMouseLeave = (): void => {
  isMouseOnVideo.value = false
  emit('mouseleave')
}

const onEnded = (): void => {
  isPlaying.value = false
  emit('ended')
}

watch(
  () => props.src,
  () => {
    isVideoReady.value = false

    if (props.autoplay && video.value) {
      video.value
        .play()
        .then(() => {
          isPlaying.value = true
          emit('play')
        })
        .catch(() => {
          isPlaying.value = false
        })
    }
  }
)

onMounted(() => {
  if (props.autoplay && video.value) {
    video.value
      .play()
      .then(() => {
        isPlaying.value = true
        emit('play')
      })
      .catch(() => {
        isPlaying.value = false
      })
  }
})

watch(
  () => props.src,
  () => {
    if (props.autoplay && video.value) {
      video.value
        .play()
        .then(() => {
          isPlaying.value = true
          emit('play')
        })
        .catch(() => {
          isPlaying.value = false
        })
    }
  }
)
</script>

<style scoped>
.video-player {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  width: 100%;
}

.play-button {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}
</style>
