<template>
  <div
    v-if="checkField('reqs') && isEditable && orderData.reqs"
    class="summary_item_wrapper mb-0 h-max w-max max-w-full pb-0"
  >
    <span class="summary_item_title">Destinations & Requirements:</span>

    <Field
      type="text"
      v-model="orderData.reqs"
      class="summary-edit_item_input summary_item_input max-w-[300px] !truncate sm:max-w-[500px] md:max-w-[650px] lg:max-w-[200px]"
      name="requirments"
      placeholder="Destinations & Requirements"
      :disabled="!isEditable"
    />
  </div>
  <div
    class="summary_item_wrapper mb-0 h-max w-max max-w-full pb-0"
    v-else-if="checkField('reqs') && !isEditable && orderData.reqs"
  >
    <span class="summary_item_title">Destinations & Requirements:</span>
    <p
      class="summary_item_input w-full !truncate break-all !rounded-none !border-0 !p-0 !pb-2 text-background dark:!text-white"
    >
      {{ orderData.reqs }}
    </p>
  </div>
  <div
    v-if="checkField('hours') && isEditable"
    class="summary_item_wrapper mb-0 h-max w-max max-w-full pb-0"
    :class="errors.hours ? 'error' : ''"
  >
    <span class="summary_item_title">Duration:</span>
    <div class="flex flex-row items-center justify-start gap-x-2">
      <Field
        type="text"
        v-model="orderData.hours"
        v-on:beforeinput="utils?.isNumber($event)"
        class="summary-edit_item_input summary_item_input max-w-20 !truncate"
        name="hours"
        placeholder="Duration"
        :disabled="!isEditable"
      />
      <span class="summary_item_input_sibling ml-[2px]">hours</span>
    </div>
  </div>
  <div
    class="summary_item_wrapper mb-0 h-max w-max max-w-full pb-0"
    v-else-if="checkField('hours') && !isEditable"
  >
    <span class="summary_item_title">Duration:</span>
    <div class="flex flex-row items-center justify-start gap-x-2">
      <p
        class="summary_item_input_sibling max-w-20 break-all !rounded-none !border-0 !p-0 text-background dark:!text-white"
      >
        {{ orderData.hours }}
      </p>
      <span class="summary_item_input_sibling ml-[2px]">hours</span>
    </div>
  </div>
  <div v-if="checkField('date_start') && isEditable" class="summary_item_wrapper mb-0 w-40 pb-0">
    <span class="summary_item_title">Date:</span>
    <VueDatePicker
      ref="datePickerRef"
      placeholder="Date / Time"
      :preview-format="dateFormat"
      :disabled="!isEditable"
      :clearable="false"
      :format="dateFormat"
      :dark="mode === 'dark'"
      :light="mode === 'light'"
      name="date_start"
      v-model="inputDate"
      @internal-model-change="handleInternal"
      :min-date="minDate"
      :min-time="minTime"
      input-class-name="!w-40"
    >
      <template #right-sidebar>
        <div class="overflow-y-scroll px-3 py-2" style="max-height: 300px">
          <div
            v-for="time in timeOptions"
            :key="time"
            @click="setTime(time)"
            :class="['time-option cursor-pointer', time === selectedTime ? 'time-selected' : '']"
          >
            {{ time }}
          </div>
        </div>
      </template>
    </VueDatePicker>
  </div>
  <div
    v-if="checkField('date_start') && !isEditable"
    class="summary_item_wrapper mb-0 h-max w-40 shrink-0 pb-0"
  >
    <span class="summary_item_title">Date:</span>
    <p
      class="summary_item_input max-w-[300px] break-all !rounded-none !border-0 !p-0 text-background dark:!text-white sm:max-w-[500px] md:max-w-[650px] lg:max-w-[200px]"
    >
      {{ inputDate }}
    </p>
  </div>
  <div v-if="checkField('distance')" class="summary_item_wrapper mb-0 h-max w-max max-w-full pb-0">
    <span class="summary_item_title">Distance:</span>
    <div class="flex flex-row items-center justify-start">
      <span class="summary_item_input_sibling">{{ orderData.distance }} KMS </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { Field } from 'vee-validate'
import { computed, inject, ref, toRef } from 'vue'
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import dayjs from 'dayjs'
import { useMainStore } from '@/stores/ui/main'
import { useOrderStore } from '@/stores/ride/order'
import { useDatePicker } from '@/compose/datePicker'
import type { OrderData } from '@/types/stores/ride/order'

interface Utils {
  isNumber: (event: InputEvent) => void
}

interface RideDetailsFieldsProps {
  isEditable?: boolean
  errors?: Partial<Record<'hours', string>>
  checkField: (field: keyof OrderData) => boolean
}

const props = withDefaults(defineProps<RideDetailsFieldsProps>(), {
  isEditable: false,
  errors: () => ({}) as Partial<Record<'hours', string>>
})

const utils = inject<Utils | null>('utils', null)
const orderStore = useOrderStore()
const mainStore = useMainStore()
const { orderData } = storeToRefs(orderStore)
const { mode } = storeToRefs(mainStore)

const {
  datePickerRef,
  timeOptions,
  minDate,
  minTime,
  datePicker,
  handleInternal,
  dateFormat,
  initialDate
} = useDatePicker()

const selectedTime = ref<string>('')

const inputDate = computed<string>({
  get: () => {
    return orderData.value.date_start
      ? dayjs(orderData.value.date_start).format('YYYY-MM-DD HH:mm')
      : ''
  },
  set: (value) => {
    const formatted = value ? dayjs(value).format('YYYY-MM-DD HH:mm') : null
    orderStore.update({ date_start: formatted })
  }
})

const setTime = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number)
  if (initialDate.value) {
    const updatedDate = new Date(initialDate.value)
    updatedDate.setHours(hours, minutes)
    const formatted = dayjs(updatedDate).format('YYYY-MM-DD HH:mm')
    datePicker.value = formatted
    orderData.value.date_start = formatted
  }
  selectedTime.value = time
  datePickerRef.value?.closeMenu?.()
}

const isEditable = toRef(props, 'isEditable')
const errors = computed(() => props.errors ?? {})
const checkField = props.checkField
</script>
