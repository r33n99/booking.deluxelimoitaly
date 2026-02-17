<template>
  <div class="vehicle vehicle_popup mb-0 mt-[43px] flex-col !bg-white md:mt-0 md:w-[450px]">
    <div class="popup__summary_wrapper">
      <div
        v-if="props.distance != null"
        class="summary_item_wrapper popup_summary_item_wrapper border-b-[1px] border-placeholder"
      >
        <span class="summary_item_title popup_summary_title">Distance:</span>
        <p class="popup_summary_text">{{ props.distance }} KMS</p>
      </div>
      <div
        v-if="carName !== ''"
        class="summary_item_wrapper popup_summary_item_wrapper border-b-[1px] border-placeholder"
      >
        <span class="summary_item_title popup_summary_title">Car Type</span>
        <p class="popup_summary_text">{{ carName }}</p>
      </div>
      <div
        v-if="props.reqs != null"
        class="summary_item_wrapper popup_summary_item_wrapper mb-0 pb-0"
      >
        <span class="summary_item_title popup_summary_title">Destinations & Requirements</span>
        <p class="popup_summary_text">{{ props.reqs }}</p>
      </div>
      <div
        v-if="props.consulting != null"
        class="summary_item_wrapper popup_summary_item_wrapper mb-0 pb-0"
      >
        <span class="summary_item_title popup_summary_title">Consulting message</span>
        <p class="popup_summary_text">{{ props.consulting }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface TransportInfo {
  class_full_name?: string | null
  [key: string]: unknown
}

type TransportProp = TransportInfo | string | null

interface HistoryPopupContentProps {
  firstName?: string | null
  lastName?: string | null
  email?: string | null
  phone?: string | null
  notes?: string | null
  distance?: number | string | null
  transport?: TransportProp
  reqs?: string | null
  consulting?: string | null
}

const props = defineProps<HistoryPopupContentProps>()

const carName = computed<string>(() => {
  const transport = props.transport
  if (typeof transport === 'string') {
    return transport
  }

  if (!transport || typeof transport !== 'object') {
    return ''
  }

  const className = transport.class_full_name
  return typeof className === 'string' ? className : ''
})
</script>
