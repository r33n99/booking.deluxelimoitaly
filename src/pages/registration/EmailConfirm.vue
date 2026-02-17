<template>
  <div class="flex flex-col justify-between">
    <div>
      <div>
        <router-link
          @click="registrationStore.handleChangeStep(1)"
          type="button"
          class="go_back_button group"
          :to="backButtonUrl"
        >
          <ArrowLeftIcon />
          <span class="go_back_button__text">Go Back</span>
        </router-link>
        <p
          class="mb-[73px] mt-[32px] text-[40px] font-bold leading-[44px] text-[#2B2D32] dark:text-[#FFFFFF] md:mb-[64px] md:mt-[40px] md:text-[80px] md:leading-[70px]"
        >
          Check Your Email
        </p>
      </div>
      <Form @submit="onSubmit" class="flex w-full flex-row items-end justify-center">
        <div
          class="right_side w-full max-w-none rounded-[40px] bg-white px-4 py-6 dark:bg-[#333639] max-md:mb-0 md:rounded-b-[40px] md:p-8 lg:max-w-[552px]"
        >
          <span class="text-sm leading-[25px] md:text-[18px]"
            >We sent a confirmation email to the email
            {{ isLoginFlow ? loginData.email : defaultData.email }}, it will be delivered soon,
            please proceed further by the link inside, if you didn't receive a confirmation email,
            please double check your address, you could change it on previous step. If the code
            hasn't arrived, click 'Resend Code' to request a new one.</span
          >
          <Field
            type="text"
            name="code"
            maxlength="6"
            class="input account_input mt-[24px]"
            v-model="code"
            :class="{ 'error-input': wrongCode }"
            placeholder="Enter verification code"
            @beforeinput="utils.isNumber($event)"
          />
          <p
            v-if="resendTimer > 0"
            class="mb-[24px] cursor-pointer text-[18px] leading-[25px] text-main"
          >
            Resend available in {{ resendTimer }} sec
          </p>
          <button
            :disabled="loading"
            v-if="resendTimer === 0"
            @click="resendCode"
            class="mb-[24px] inline-flex w-[150px] cursor-pointer text-[18px] leading-[25px] text-main"
          >
            Resend code
          </button>
          <button
            :disabled="loading"
            type="submit"
            class="button w-full border-dark_main px-4 py-[18px] text-base/[17.6px] dark:border-main dark:hover:text-background md:py-5 md:text-[18px]/[23.8px]"
          >
            Next
          </button>
          <!--          <div-->
          <!--            v-if="isMobile"-->
          <!--            class="mt-6 flex flex-col items-center text-center text-[12px] leading-[17px] text-[#2B2D32] dark:text-[#FFFFFF]"-->
          <!--          >-->
          <!--            <p>-->
          <!--              For multiple rides/days service-->
          <!--              <span @click="stayWithUsModalStore.show" class="text-main cursor-pointer"-->
          <!--                >click here</span-->
          <!--              >.-->
          <!--            </p>-->
          <!--            <p>For Agency requests add your IATA or License Code in the notes</p>-->
          <!--          </div>-->
        </div>
      </Form>
    </div>
    <!--    <div-->
    <!--      v-if="!isMobile"-->
    <!--      class="flex flex-col items-center text-center text-[18px] leading-[25px] text-[#2B2D32] dark:text-[#FFFFFF]"-->
    <!--    >-->
    <!--      <p>-->
    <!--        For multiple rides/days service-->
    <!--        <span @click="stayWithUsModalStore.show" class="text-main cursor-pointer">click here</span>.-->
    <!--      </p>-->
    <!--      <p>For Agency requests add your IATA or License Code in the notes</p>-->
    <!--    </div>-->
    <registration-modal v-if="modal" @close-modal="closeModal" :text="errorText" />
    <PleaseWaitPreloader v-if="loading" />
  </div>
</template>

<script setup>
import { ref, inject, onBeforeMount, onMounted, computed } from 'vue'
import { Form, Field } from 'vee-validate'
// import { useMobile } from '@/compose/ismobile'
import ArrowLeftIcon from '@/components/ui/icons/ArrowLeftIcon.vue'
import { useRoute, useRouter } from 'vue-router'
import { useRegistrationStore } from '@/stores/user/registration'
import { storeToRefs } from 'pinia'
import { useFetcher } from '@/compose/axios'
import RegistrationModal from '@/components/layout/modals/RegistrationModal.vue'
import PleaseWaitPreloader from '@/components/ui/loaders/PleaseWaitPreloader.vue'
import { useUserStore } from '@/stores'
// import { useStayWithUsModalStore } from '@/stores/ui/stayWithUsModal'

// const stayWithUsModalStore = useStayWithUsModalStore()

const utils = inject('utils')
const registrationStore = useRegistrationStore()
const userStore = useUserStore()
const { defaultData } = storeToRefs(registrationStore)
const { loginData } = storeToRefs(userStore)
const code = ref(null)
const backButtonUrl = ref('/registration/details')
const resendTimer = ref(0)
const loading = ref(false)
const wrongCode = ref(false)
const modal = ref(false)
const errorText = ref('')
let timerInterval = null
const router = useRouter()

const { axiosInstance } = useFetcher({ baseUrl: import.meta.env.VITE_APP_API_URL })

// const { isMobile } = useMobile()

const isLoginFlow = computed(() => route.name === 'signin_email_confirm')

const closeModal = () => {
  modal.value = false
}

const startResendTimer = () => {
  resendTimer.value = 60
  timerInterval = setInterval(() => {
    resendTimer.value--
    if (resendTimer.value <= 0) {
      clearInterval(timerInterval)
      resendTimer.value = 0
    }
  }, 1000)
}

const resendCode = () => {
  loading.value = true

  // Определяем endpoint в зависимости от потока
  const endpoint = isLoginFlow.value ? '/auth/login' : '/auth/resend_code'
  const reqBody = isLoginFlow.value
    ? { ...loginData.value, check: false }
    : { email: defaultData.value.email }

  axiosInstance
    .post(endpoint, reqBody)
    .then(() => {
      loading.value = false
      wrongCode.value = false
      code.value = ''
      startResendTimer() // Используем существующий таймер
    })
    .catch((error) => {
      loading.value = false
      console.error('Ошибка при отправке кода:', error)
      errorText.value = 'Не удалось отправить код. Попробуйте позже.'
      modal.value = true
    })
}

const route = useRoute()
const toStep = parseInt(route.meta.step)

const onSubmit = (values) => {
  loading.value = true
  wrongCode.value = false

  // Для логина и регистрации определяем endpoint и payload
  const endpoint = isLoginFlow.value ? '/auth/login' : '/auth/accept_code'

  // Для совместимости с vee-validate и старой логикой
  const codeToSend = values?.code ?? code.value
  const emailToSend = defaultData.value.email
  const reqBody = isLoginFlow.value
    ? { ...loginData.value, code: codeToSend, check: true }
    : { email: emailToSend, code: codeToSend }

  axiosInstance
    .post(endpoint, reqBody)
    .then((response) => {
      if (isLoginFlow.value) {
        // Для потока входа
        if (response?.data?.status === 'success') {
          userStore.fill(response.data.data)
          userStore.clearLoginData()
          router.push({ name: 'ridehistory' })
        } else {
          wrongCode.value = true
          errorText.value = response?.data?.message || 'Неверный код подтверждения'
          modal.value = true
        }
      } else {
        // Для потока регистрации
        if (response.data.status === 'error') {
          wrongCode.value = true
          errorText.value = response.data.message || 'Ошибка подтверждения'
          modal.value = true
        } else {
          wrongCode.value = false
          // Хэш обязателен для перехода на следующий шаг
          if (response.data?.data?.hash) {
            registrationStore.setHash(response.data.data.hash)
            registrationStore.handleChangeStep(3)
            router.push('/registration/finalize')
          } else {
            errorText.value = 'Hash not found in response data.'
            modal.value = true
            console.error('Hash not found in response data.')
          }
        }
      }
    })
    .catch((err) => {
      console.log(err.message)
      errorText.value = err.message || 'Произошла ошибка. Попробуйте позже.'
      modal.value = true
    })
    .finally(() => {
      loading.value = false
    })
}

onMounted(() => {
  startResendTimer()
})
onBeforeMount(() => {
  registrationStore.handleCheckStep(toStep)
})
</script>

<style scoped>
button[disabled] {
  cursor: not-allowed !important;
}

.error-input {
  border: 1px solid #fa4141 !important;
}
</style>
