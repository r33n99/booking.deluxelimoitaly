<template>
  <PleaseWaitPreloader v-if="loading" />
  <h1 class="title mr-[15px] mt-8 pb-6 md:mt-[45px] md:pb-[64px]">Sign in</h1>
  <div class="flex flex-col justify-center md:flex-row">
    <Form
      @submit="onSubmit"
      class="right_side-wrapper signin_form md:rounded-[37px] md:bg-white md:p-8 md:dark:bg-[#333639]"
      :validation-schema="loginSchema"
      v-slot="{ errors, isSubmitting }"
    >
      <div class="right_side mb-0">
        <span class="account_label">E-mail Address</span>
        <Field
          :key="incorrectData"
          name="email"
          type="email"
          class="input account_input"
          placeholder="E-mail Address"
          :class="errors.email || incorrectData ? 'error-input error' : ''"
        />
        <span class="account_label">Password</span>
        <div class="relative">
          <Field
            :key="incorrectData"
            name="password"
            :type="showPass ? 'text' : 'password'"
            class="input account_input"
            placeholder="Password"
            :class="errors.password || incorrectData ? 'error-input error' : ''"
          />
          <img
            class="absolute right-[20px] top-[26%] w-[20px] cursor-pointer text-[#5b5b5b]"
            @click="toggleShowPass('password')"
            :src="showPass ? EyeShow : EyeHide"
            alt="eye-show"
          />
        </div>
        <div v-if="incorrectData" class="flex justify-center">
          <span class="text-[12px] text-red-500 md:text-[18px]">Invalid email or password</span>
        </div>
      </div>
      <p v-if="isLoggedIn" class="success">Logged in!</p>
      <p v-if="successSendPasswordReset" class="text-sm text-green-500">
        Password change email sent
      </p>
      <p v-if="userNotFound" class="text-sm text-red-500">User not found</p>
      <p v-if="tooManyRequest" class="text-sm text-red-500">Too many request. Try again later</p>
      <button
        type="button"
        class="text-[12px] text-main hover:underline"
        v-if="!successSendPasswordReset"
        @click="resetPasswordModal = true"
      >
        Recover password
      </button>
      <button
        :disabled="isSubmitting"
        type="submit"
        class="next_step_button mt-[15px] h-[56px] w-full px-4 py-3 text-base leading-[17.6px] md:h-[64px] md:w-[488px] md:text-[18px] md:leading-[23.8px]"
      >
        Sign in
      </button>
    </Form>

    <div v-if="resetPasswordModal" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="fixed inset-0 bg-black opacity-50" @click="resetPasswordModal = false"></div>
      <div
        class="relative z-10 w-full max-w-xl rounded-[35px] bg-white p-8 text-white shadow-lg dark:bg-[#272729]"
      >
        <button
          @click="resetPasswordModal = false"
          aria-label="close"
          class="closeButton absolute right-4 top-4 inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-black dark:text-white"
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
        <h1 class="title mb-6 text-2xl font-bold text-background dark:text-white md:text-6xl">
          Reset password
        </h1>
        <p class="mb-6 text-black dark:text-white">
          A link to reset your password will be sent to your email.
        </p>
        <Form @submit="submitFormResetPass" :validation-schema="resetPassSchema">
          <div class="mb-6">
            <label for="" class="w-full space-y-2 text-gray-600 dark:text-[#878787]">
              <span
                >E-mail Address <span class="text-red-600">*</span>
                <br />
                <ErrorMessage class="text-red-600" name="email" />
              </span>
              <Field
                v-model="email"
                name="email"
                type="email"
                class="input ym-record-keys w-full"
                :class="mailBusy ? 'outline outline-1 outline-red-600' : ''"
                @focus="mailBusy = false"
                placeholder="E-mail Address"
              />
            </label>
          </div>
          <button type="submit" class="button w-full">Send an email</button>
        </Form>
      </div>
    </div>
  </div>
</template>
<script setup>
import { inject, ref } from 'vue'
import { useRouter } from 'vue-router'
import * as yup from 'yup'
import { Form, Field, ErrorMessage } from 'vee-validate'
import { useUserStore } from '@/stores/user'
import { useMainStore } from '@/stores'
import { storeToRefs } from 'pinia'
import PleaseWaitPreloader from '@/components/ui/loaders/PleaseWaitPreloader.vue'
import EyeShow from '~project_assets/images/eye-show.svg'
import EyeHide from '~project_assets/images/eye-hide.svg'
const loading = ref(false)

const mainStore = useMainStore()

const { isRequesting, waitPreloaderTitle } = storeToRefs(mainStore)

const resetPasswordModal = ref(false)
const successSendPasswordReset = ref(false)
const userNotFound = ref(false)
const tooManyRequest = ref(false)

const router = useRouter()
const userStore = useUserStore()
const { isLoggedIn } = storeToRefs(userStore)
const axios = inject('axios')
const showPass = ref(false)
const showConfirmPass = ref(false)
const incorrectData = ref(false)

const toggleShowPass = (type) => {
  if (type === 'password') {
    showPass.value = !showPass.value
  } else {
    showConfirmPass.value = !showConfirmPass.value
  }
}

const projectLink = ref(import.meta.env.VITE_PROJECT_URL)
const onSubmit = (values) => {
  loading.value = true
  const loginData = {
    email: values.email,
    password: values.password,
    website: projectLink.value,
    check: false
  }

  axios
    .post('/auth/login', loginData)
    .then(function (response) {
      loading.value = false
      if (response.data.status !== 'error') {
        userStore.updateLoginData(loginData)
        router.push({
          name: 'signin_email_confirm'
        })
      } else {
        incorrectData.value = true
        setTimeout(() => {
          incorrectData.value = false
        }, 2000)
      }
    })
    .catch((error) => {
      loading.value = false
      console.error(error)
      incorrectData.value = true
      setTimeout(() => {
        incorrectData.value = false
      }, 2000)
    })
}

const submitFormResetPass = (values) => {
  loading.value = true
  isRequesting.value = true
  userNotFound.value = false
  tooManyRequest.value = false
  waitPreloaderTitle.value = 'Sending email...'

  values.website = import.meta.env.VITE_PROJECT_URL

  axios
    .post('/reset/password', values)
    .then((response) => {
      if (response.data.status == 'success') {
        loading.value = false
        successSendPasswordReset.value = true
      }
    })
    .catch((error) => {
      if (error.response.status == 404 && error.response?.data?.status == 'error') {
        loading.value = false
        userNotFound.value = true
      }
      if (error.response.status == 429) {
        loading.value = false
        tooManyRequest.value = true
      }
    })
    .finally(() => {
      loading.value = false
      isRequesting.value = false
      waitPreloaderTitle.value = false
      resetPasswordModal.value = false
    })
}

const resetPassSchema = yup.object({
  email: yup
    .string()
    .required('Email is a required field')
    .email('Email must be a valid email')
    .max(230)
})

const loginSchema = yup.object({
  email: yup.string().required().email().max(230),
  password: yup.string().required().max(230)
})
</script>
<style scoped>
.error-input {
  border: 1px solid #fa4141 !important;
}
</style>
