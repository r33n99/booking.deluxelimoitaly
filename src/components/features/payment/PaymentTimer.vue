<template>
  <div>
    <div class="payment_timer_text" v-show="showTimer">
      This offer will expire within the next:
      <div class="countdown_wrapper payment_timer">
        <div class="countdown" id="countdown">
          <div class="countdown-number">
            <span class="minutes">{{ formattedRemainingTime.minutes }}</span>
          </div>
          <span class="countdown-text">:</span>
          <div class="countdown-number">
            <span class="seconds">{{ formattedRemainingTime.seconds }}</span>
          </div>
        </div>
      </div>
      after which the price might be different
    </div>
    <p id="time_over" v-show="!showTimer" class="payment_timer_text text-error">
      The time to book this ride online has expired, but no worries, our consultants will reach out
      to you with an updated offer in due course.
    </p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useOrderStore } from '@/stores'

const orderStore = useOrderStore()
const { orderData } = storeToRefs(orderStore)

const emit = defineEmits(['expired'])

const showTimer = ref(true)
const remainingTime = ref({ minutes: 0, seconds: 0 })
const hasExpired = ref(false)
const formattedRemainingTime = computed(() => ({
  minutes: ('0' + remainingTime.value.minutes).slice(-2),
  seconds: ('0' + remainingTime.value.seconds).slice(-2)
}))
const props = defineProps({
  initial_time: {
    type: [String, Number, Date],
    default: null
  },
  timerExpires: {
    type: Boolean,
    default: false
  }
})

const initial_time = ref(props.initial_time)
const timerExpires = ref(props.timerExpires)
let timeinterval = null

const timerExpiresCss = () => {
  if (document.getElementById('countdown_wrap')) {
    document.getElementById('countdown_wrap').style.display = 'none'
  }
  if (document.getElementById('payment-form')) {
    document.getElementById('payment-form').style.display = 'none'
  }
  if (document.getElementById('time_over')) {
    document.getElementById('time_over').style.display = 'block'
  }
}

const getTimeRemaining = (endtime) => {
  const parsedEndTime = endtime ? new Date(endtime) : null
  if (!parsedEndTime || Number.isNaN(parsedEndTime.getTime())) {
    return {
      total: 0,
      minutes: 0,
      seconds: 0
    }
  }

  const nowUTC = new Date().getTime()
  const t = parsedEndTime.getTime() - nowUTC

  const seconds = Math.floor((t / 1000) % 60)
  const minutes = Math.floor((t / 1000 / 60) % 60)

  return {
    total: t,
    minutes: Math.max(0, minutes),
    seconds: Math.max(0, seconds)
  }
}

const stopClock = () => {
  if (timeinterval) {
    clearInterval(timeinterval)
    timeinterval = null
  }
}

const applyExpiryState = (notifyParent = false) => {
  stopClock()
  showTimer.value = false
  remainingTime.value = { minutes: 0, seconds: 0 }
  timerExpiresCss()
  hasExpired.value = true
  if (notifyParent) {
    orderStore.update({
      timer_expires: true,
      timer_updated: null,
      countdown: 'stop'
    })
    emit('expired')
  }
}

const updateClock = () => {
  const t = getTimeRemaining(initial_time.value)

  remainingTime.value = {
    minutes: t.minutes,
    seconds: t.seconds
  }

  if (t.total <= 0) {
    applyExpiryState(true)
  }
}

const startClock = () => {
  if (!initial_time.value || timerExpires.value || hasExpired.value) {
    return
  }

  showTimer.value = true
  remainingTime.value = { minutes: '00', seconds: '00' }
  stopClock()

  updateClock()
  if (!timeinterval) {
    timeinterval = setInterval(updateClock, 1000)
  }
}

onMounted(() => {
  if (timerExpires.value) {
    showTimer.value = false
    timerExpiresCss()
  }

  startClock()
})

watch(
  () => props.initial_time,
  (value) => {
    initial_time.value = value
    if (value) {
      startClock()
    }
  }
)

watch(
  () => props.timerExpires,
  (value) => {
    timerExpires.value = value
    if (value) {
      applyExpiryState()
    } else if (initial_time.value) {
      startClock()
    }
  },
  { immediate: true }
)

watch(
  () => orderData.value.countdown,
  (value) => {
    if (value === 'stop') {
      stopClock()
    }
  }
)

onBeforeUnmount(() => {
  stopClock()
})
</script>
