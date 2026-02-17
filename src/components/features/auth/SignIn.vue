<template>
  <div v-if="props.isOpen" class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="fixed inset-0 bg-black opacity-50" @click="closePopUp"></div>
    <div
      class="relative z-10 w-full max-w-xl rounded-[35px] bg-white p-8 text-white shadow-lg dark:bg-[#272729]"
    >
      <h1 class="title mb-4 text-6xl font-bold dark:text-white">Sign In</h1>
      <p class="mb-6 text-black dark:text-white">
        To manage your rides more efficiently and quickly, please log in. It only takes a moment and
        will improve your experience on our site.
      </p>
      <form @submit.prevent="submitForm">
        <div class="mb-4 flex gap-4">
          <label class="w-full text-gray-600 dark:text-[#878787]" for="">
            E-mail Address
            <input
              type="email"
              class="input ym-record-keys w-full"
              placeholder="E-mail Address"
              v-model="email"
              required
            />
          </label>
        </div>
        <div class="mb-4">
          <label for="" class="w-full text-gray-600 dark:text-[#878787]">
            Password
            <input
              type="password"
              class="input ym-record-keys w-full"
              placeholder="Password"
              v-model="password"
              required
            />
          </label>
        </div>
        <button type="submit" class="button w-full">Sign In</button>
      </form>
      <p class="mt-4 text-center text-black dark:text-white">
        If you don't have an account, please
        <button @click="handleSignUpClick" type="button" class="text-green-400">
          sign up here
        </button>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, type Ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import type { AxiosInstance } from 'axios'
import { LoginResponse } from '@/types/responses'
import { User } from '@/types/stores/user/profile'

const axios = inject('axios') as AxiosInstance
const router = useRouter()
const userStore = useUserStore()

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'open-signup'): void
}>()

const email: Ref<string> = ref('')
const password: Ref<string> = ref('')
const isLoading: Ref<boolean> = ref(false)
const errorMessage: Ref<string> = ref('')

const projectLink: string = import.meta.env.VITE_PROJECT_URL as string

const closePopUp = (): void => {
  emit('close')
}

const submitForm = async (): Promise<void> => {
  if (!email.value || !password.value) {
    errorMessage.value = 'Please fill in all fields'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  const data = {
    email: email.value,
    password: password.value,
    website: projectLink,
    check: true
  }

  try {
    const response = await axios.post<LoginResponse>('/auth/login', data)

    if (response.data?.status === 'success') {
      // Ensure we're passing the correct data structure to fill
      userStore.fill(response?.data?.data)
      await router.push({ name: 'ridehistory' })
      closePopUp()
    } else {
      errorMessage.value = 'Invalid email or password'
    }
  } catch (error) {
    console.log('Login error caught:', error)
    console.error('Login error:', error)
    errorMessage.value = 'An error occurred during login. Please try again.'
  } finally {
    isLoading.value = false
  }
}

const handleSignUpClick = (): void => {
  closePopUp()
  emit('open-signup')
}
</script>

<style scoped>
/* Scoped styles if necessary */
</style>
