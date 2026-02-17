<template>
  <div>
    <p>{{ formattedTime }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'

interface PaymentTimerProps {
  minutes?: number
  seconds?: number
}

const props = withDefaults(defineProps<PaymentTimerProps>(), {
  minutes: 0,
  seconds: 0
})

const emit = defineEmits<{ (e: 'time-up'): void }>()

const totalTimeInSeconds = ref<number>(0)
let timer: ReturnType<typeof setInterval> | null = null

const formattedTime = computed<string>(() => {
  const minutes = Math.floor(totalTimeInSeconds.value / 60)
  const seconds = totalTimeInSeconds.value % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

const startTimer = (): void => {
  if (timer) clearInterval(timer)
  timer = setInterval(() => {
    if (totalTimeInSeconds.value > 0) {
      totalTimeInSeconds.value -= 1
    } else {
      if (timer) {
        clearInterval(timer)
        timer = null
      }
      emit('time-up')
    }
  }, 1000)
}

onMounted(() => {
  totalTimeInSeconds.value = props.minutes * 60 + props.seconds
  startTimer()
})

onBeforeUnmount(() => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
})

watch(
  () => [props.minutes, props.seconds],
  ([newMinutes, newSeconds]) => {
    totalTimeInSeconds.value = newMinutes * 60 + newSeconds
    startTimer()
  }
)
</script>
