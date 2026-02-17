<template>
  <div class="mt-5 flex w-full flex-col items-center">
    <h1 class="title">Password Reset</h1>
    <Form
      @submit="onSubmit"
      :validation-schema="validationSchema"
      v-slot="{ errors }"
      class="mt-5 flex w-full flex-col gap-2 md:w-[500px]"
    >
      <p class="text-lg text-green-500" v-if="successChange">Password successfully changed</p>
      <p class="text-lg text-red-500" v-if="userNotFound">User not found</p>
      <p class="text-lg text-red-500" v-if="tooManyRequest">Too many request. Try again later</p>
      <div class="flex flex-col gap-2">
        <ErrorMessage name="password" />
        <Field
          name="password"
          type="password"
          @focus="userNotFound = false"
          placeholder="Password"
          class="input w-full"
          :class="errors.password && 'error'"
        />
      </div>
      <div class="flex flex-col gap-2">
        <ErrorMessage name="passwordConfirmation" />
        <Field
          name="passwordConfirmation"
          type="password"
          placeholder="Password Confirmation"
          @focus="userNotFound = false"
          class="input w-full"
          :class="errors.passwordConfirmation && 'error'"
        />
      </div>
      <button type="submit" class="button">Change</button>
    </Form>
  </div>
</template>

<script setup lang="ts">
import { inject, ref } from 'vue'
import { Field, Form, ErrorMessage, type SubmissionHandler } from 'vee-validate'
import { useRoute } from 'vue-router'
import * as yup from 'yup'
import { isAxiosError } from 'axios'
import type { AxiosInstance, AxiosError } from 'axios'
import { useMainStore } from '@/stores/ui/main'
import { storeToRefs } from 'pinia'

const mainStore = useMainStore()
const { isRequesting, waitPreloaderTitle } = storeToRefs(mainStore)

const userNotFound = ref(false)
const successChange = ref(false)
const tooManyRequest = ref(false)

const route = useRoute()

const axios = inject<AxiosInstance>('axios')
if (!axios) {
  throw new Error('Axios instance is not provided')
}

interface PasswordResetFormValues {
  password: string
  passwordConfirmation: string
}

interface PasswordResetPayload extends PasswordResetFormValues {
  hash: string
}

interface PasswordResetResponse {
  status: 'success' | 'error'
}

const validationSchema: yup.ObjectSchema<PasswordResetFormValues> = yup
  .object({
    password: yup
      .string()
      .required('Password is required')
      .min(8, 'Password must be at least 8 characters'),
    passwordConfirmation: yup
      .string()
      .required('Password Confirmation is required')
      .oneOf([yup.ref('password')], 'Passwords must match')
  })
  .required()

const onSubmit: SubmissionHandler = async (values) => {
  const rawHash = route.params.hash
  const hashParam = Array.isArray(rawHash) ? (rawHash[0] ?? '') : (rawHash ?? '')
  const payload = {
    ...values,
    hash: hashParam
  }

  isRequesting.value = true
  tooManyRequest.value = false
  userNotFound.value = false
  waitPreloaderTitle.value = 'Changing password...'

  try {
    const response = await axios.post<PasswordResetResponse>('/reset/password/complete', payload)
    successChange.value = response.data.status === 'success'
  } catch (error) {
    if (isAxiosError<PasswordResetResponse>(error) && error.response) {
      const { status, data } = error.response
      if (status === 404 && data?.status === 'error') {
        userNotFound.value = true
        successChange.value = false
      }
      if (status === 429 && data?.status === 'error') {
        tooManyRequest.value = true
      }
    } else {
      throw error as AxiosError
    }
  } finally {
    isRequesting.value = false
    waitPreloaderTitle.value = ''
  }
}
//
</script>
