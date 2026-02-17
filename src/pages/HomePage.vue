<template>
  <h1 data-testid="homepage-title" class="title px-4 sm:p-0" v-show="shouldShowTitle">
    Car Service<span v-if="isAgency"> - Agency Area</span
    ><span v-else><br />with Private Driver</span>
  </h1>
  <router-link
    v-if="showGoBackButton"
    type="button"
    class="go_back_button group"
    to="/account/ridehistory"
  >
    <ArrowLeftIcon />
    <span class="go_back_button__text">Go Back</span>
  </router-link>
  <div
    class="contact_form_wrapper"
    :class="[
      flow !== 'mainsite' ? '!mt-6 !bg-opacity-50 md:!mt-[48px]' : '!m-0 !bg-opacity-80',
      isAgency ? '!px-0 !pb-0' : ''
    ]"
  >
    <div class="w-full">
      <span :class="isAgency ? 'px-8' : 'px-0'" class="summary_title home_form__title"
        >Choose Type of Service</span
      >
      <div
        :class="isAgency ? 'px-8' : 'px-0'"
        class="relative w-full overflow-x-auto pb-[2px] [-ms-overflow-style:_none] [scrollbar-width:_none] sm:w-max [&::-webkit-scrollbar]:hidden"
      >
        <div class="home_form__toggler w-max">
          <button
            v-for="(button, index) in buttons"
            @click="changeForm(button)"
            :key="index"
            :class="{ ...button.class, active: button.active }"
          >
            {{ button.name }}
          </button>
        </div>
      </div>
      <Transition name="form-switch" mode="out-in">
        <OneWayTransferForm
          v-if="formActive === 1 && !isAgency"
          :key="'oneway-regular-' + formActive"
          :handleKeyDown="handleKeyDown"
        />
        <OneWayTransferFormForAgency
          v-else-if="formActive === 1 && isAgency"
          :key="'oneway-agency-' + formActive"
          :handleKeyDown="handleKeyDown"
        />
        <HourlyAsDirectedForm
          v-else-if="formActive === 2 && !isAgency"
          :key="'hourly-regular-' + formActive"
        />
        <HourlyAsDirectedFormForAgency
          v-else-if="formActive === 2 && isAgency"
          :key="'hourly-agency-' + formActive"
        />
        <ToursForm
          v-else-if="formActive === 3 && !isAgency"
          :key="'tours-regular-' + formActive"
          :handleKeyDown="handleKeyDown"
        />
        <ToursFormForAgency
          v-else-if="formActive === 3 && isAgency"
          :key="'tours-agency-' + formActive"
          :handleKeyDown="handleKeyDown"
        />
      </Transition>
    </div>
  </div>

  <confirming-credit-based-payment-modal />
</template>
<script setup lang="ts">
import { reactive, ref, onBeforeMount, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import { useMainStore } from '@/stores/ui/main'
import { useOrderStore } from '@/stores/ride/order'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user'
import { useGoBackStore } from '@/stores/ui/goBack'
import { defineAsyncComponent } from 'vue'
import ArrowLeftIcon from '@/components/ui/icons/ArrowLeftIcon.vue'
import ConfirmingCreditBasedPaymentModal from '@/components/layout/modals/ConfirmingCreditBasedPaymentModal.vue'

// Асинхронная загрузка форм для уменьшения начального размера бандла
const OneWayTransferForm = defineAsyncComponent(
  () => import('@/components/ui/forms/OneWayTransferForm.vue')
)
const HourlyAsDirectedForm = defineAsyncComponent(
  () => import('@/components/ui/forms/HourlyAsDirectedForm.vue')
)
const ToursForm = defineAsyncComponent(() => import('@/components/ui/forms/ToursForm.vue'))

// Lazy loading форм для агентств - загружаются по первому взаимодействию
const OneWayTransferFormForAgency = defineAsyncComponent(
  () => import('@/components/ui/forms/OneWayTransferFormForAgency.vue')
)
const HourlyAsDirectedFormForAgency = defineAsyncComponent(
  () => import('@/components/ui/forms/HourlyAsDirectedFormForAgency.vue')
)
const ToursFormForAgency = defineAsyncComponent(
  () => import('@/components/ui/forms/ToursFormForAgency.vue')
)
import type { HomePageButton, HomePageFormIndex, HomePageServiceTypesMap } from '@/types/pages/Home'
import type { OrderData } from '@/types/stores/ride/order'

const goBackStore = useGoBackStore()

const orderStore = useOrderStore()
const userStore = useUserStore()

const { orderType } = storeToRefs(orderStore)
const { user } = storeToRefs(userStore)

const mainStore = useMainStore()
const { flow } = storeToRefs(mainStore)
const shouldShowTitle = computed(() => {
  // По умолчанию показываем заголовок, если flow еще не определен или не равен 'mainsite'
  return flow.value !== 'mainsite'
})

const buttons = reactive<HomePageButton[]>([
  {
    class: { 'home_form__button button mr-2': true },
    active: true,
    name: 'One Way Transfer',
    index: 1
  },
  {
    class: { 'home_form__button button mr-2': true },
    active: false,
    name: 'Hourly as directed',
    index: 2
  }
])

if (import.meta.env.VITE_PROJECT_ALIAS !== 'rlt') {
  buttons.push({
    class: { 'home_form__button button': true },
    active: false,
    name: 'Tours/Roadshows',
    index: 3
  })
}
const SERVICE_TYPES: HomePageServiceTypesMap = {
  1: 'oneWayTransfer',
  2: 'hourlyAsDirected',
  3: 'toursRoadshows'
}

const isAgency = computed<boolean>(() => {
  if (!user?.value) {
    return false
  } else {
    return user?.value.type === 'agency'
  }
})
const formActive = ref<HomePageFormIndex>(1)

let datepickerCssLoaded = false
const loadDatepickerCss = async (): Promise<void> => {
  if (!datepickerCssLoaded) {
    datepickerCssLoaded = true
    await import('@vuepic/vue-datepicker/dist/main.css')
  }
}

const changeForm = (button?: HomePageButton | null, index?: HomePageFormIndex | null): void => {
  if (button && button.active && !index) {
    return
  }

  const targetIndex = button?.index ?? index ?? null

  if (!targetIndex || formActive.value === targetIndex) {
    return
  }

  requestAnimationFrame(() => {
    buttons.forEach((el) => {
      el.active = false
    })

    if (button) {
      button.active = true
    } else if (index) {
      const buttonToActivate = buttons.find((btn) => btn.index === index)
      if (!buttonToActivate) {
        return
      }
      buttonToActivate.active = true
    }

    formActive.value = targetIndex
    orderStore.orderData.type_of_service = SERVICE_TYPES[targetIndex]
  })
}
let isInitialRun = true
watch(formActive, (newVal, oldVal) => {
  if (isInitialRun) {
    isInitialRun = false
    return
  }
  if (orderType.value === 'DUPLICATE' && newVal !== oldVal) {
    orderStore.changeTypeOrder('NEW')
  }
})

// Determine next input and move focus to it
const focusNextInput = (): void => {
  const inputs = Array.from(
    document.querySelectorAll<HTMLInputElement>('.home_form input:not(.dp__input)')
  )
  const activeElement = document.activeElement as HTMLElement | null
  const focusedInputIndex = activeElement
    ? inputs.findIndex((input) => input === activeElement)
    : -1

  if (focusedInputIndex !== -1) {
    const nextIndex = focusedInputIndex + 1
    if (nextIndex < inputs.length) {
      inputs[nextIndex].focus()
    } else {
      activeElement?.blur()
    }
  }
}

const handleKeyDown = (event: KeyboardEvent): void => {
  if (event.key === 'Enter') {
    event.preventDefault()
    focusNextInput()
  }
}

const showGoBackButton = ref<boolean>(false)
const userInteracted = ref<boolean>(false)

// Функция для предзагрузки форм агентств при первом взаимодействии
const preloadAgencyForms = (): void => {
  if (userInteracted.value || !isAgency.value) {
    return
  }

  userInteracted.value = true

  // Предзагружаем все три формы параллельно
  Promise.all([
    import('@/components/ui/forms/OneWayTransferFormForAgency.vue'),
    import('@/components/ui/forms/HourlyAsDirectedFormForAgency.vue'),
    import('@/components/ui/forms/ToursFormForAgency.vue')
  ]).catch((error) => {
    console.error('Ошибка при предзагрузке форм для агентств:', error)
  })
}

// Обработчики первого взаимодействия пользователя
const handleFirstInteraction = (): void => {
  if (userInteracted.value) {
    return
  }
  preloadAgencyForms()
}

let interactionEventHandlers: Array<{ element: EventTarget; event: string; handler: () => void }> =
  []
let hoverHandlers: Array<{ element: EventTarget; handler: () => void }> = []

onMounted(() => {
  loadDatepickerCss()

  const from =
    (window.history.state as { back?: string } | null)?.back ??
    localStorage.getItem('lastGoBackFrom')

  showGoBackButton.value = Boolean(
    goBackStore.showGoBack && from === '/account/ridehistory' && isAgency.value
  )
  if (flow.value === 'mainsite') {
    document.body.classList.add('!bg-transparent', '!p-0')
  }

  // Добавляем обработчики для первого взаимодействия
  const interactionEvents = ['click', 'scroll', 'touchstart', 'keydown', 'mousemove']
  const options = { once: true, passive: true }

  interactionEvents.forEach((event) => {
    window.addEventListener(event, handleFirstInteraction, options)
    interactionEventHandlers.push({
      element: window,
      event,
      handler: handleFirstInteraction
    })
  })

  // Предзагрузка при hover на кнопки переключения форм (только для агентств)
  if (isAgency.value) {
    const buttons = document.querySelectorAll('.home_form__button')
    buttons.forEach((button) => {
      button.addEventListener('mouseenter', preloadAgencyForms, { once: true, passive: true })
      hoverHandlers.push({
        element: button,
        handler: preloadAgencyForms
      })
    })
  }
})

onBeforeUnmount(() => {
  // Очищаем обработчики событий для предотвращения утечек памяти
  interactionEventHandlers.forEach(({ element, event, handler }) => {
    element.removeEventListener(event, handler)
  })
  interactionEventHandlers = []

  hoverHandlers.forEach(({ element, handler }) => {
    element.removeEventListener('mouseenter', handler)
  })
  hoverHandlers = []
})

onBeforeMount(() => {
  // Clear Timer in Payment
  if (orderStore.orderData.type_of_service === 'oneWayTransfer') {
    changeForm(null, 1)
  }
  if (orderStore.orderData.type_of_service === 'hourlyAsDirected') {
    changeForm(null, 2)
  }
  if (orderStore.orderData.type_of_service === 'toursRoadshows') {
    changeForm(null, 3)
  }

  orderStore.update({
    countdown: 'stop'
  } as Partial<OrderData>)
  if (!user.value || !orderStore.duplicatedOrder) {
    orderStore.changeTypeOrder('NEW')
  }
})
</script>

<style scoped>
.form-switch-enter-active,
.form-switch-leave-active {
  transition: all 0.2s ease;
}

.form-switch-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.form-switch-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.form-switch-enter-to,
.form-switch-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>
