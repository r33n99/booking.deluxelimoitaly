<template>
  <div
    v-if="checkField('pickup') && isEditable"
    class="summary_item_wrapper mb-0 h-max w-max max-w-full pb-0"
    :class="{ error: errors.pickup }"
  >
    <span class="summary_item_title">Pick Up Location:</span>

    <Field name="pickup" v-model="orderData.pickup" v-slot="{ field }">
      <TrustyComplete
        clearable
        @clear:input="trustyStore.clearInput('pickup')"
        v-model="pickupRef"
        classname="!truncate summary-edit_item_input summary_item_input searchAutocomplete"
        @get:suggestions="fetchSuggestions"
        @update:suggestions="updateSuggestions"
        @select:suggestions="selectSuggestions"
        :autoCompleteString="orderData.pickup"
        :suggestions="data"
        v-bind="field"
        placeholder="Pick Up Location*"
      />
    </Field>
  </div>
  <div
    class="summary_item_wrapper mb-0 h-max w-max max-w-full pb-0"
    v-else-if="checkField('pickup') && !isEditable"
  >
    <span class="summary_item_title">Pick Up Location:</span>
    <p
      class="summary_item_input w-full !truncate break-all !rounded-none !border-0 !p-0 !pb-2 text-background dark:!text-white"
    >
      {{ orderData.pickup }}
    </p>
  </div>
  <div
    v-if="checkField('dropoff') && isEditable"
    class="summary_item_wrapper mb-0 h-max w-max max-w-full pb-0"
    :class="{ error: errors.dropoff }"
  >
    <span class="summary_item_title">Drop Off Location:</span>

    <Field name="dropoff" v-model="orderData.dropoff" :value="orderData.dropoff" v-slot="{ field }">
      <TrustyComplete
        clearable
        @clear:input="trustyStore.clearInput('dropoff')"
        v-model="dropoffRef"
        classname="!truncate summary-edit_item_input summary_item_input searchAutocomplete"
        @get:suggestions="fetchSuggestions"
        @update:suggestions="updateSuggestions"
        @select:suggestions="selectSuggestions"
        :autoCompleteString="orderData.dropoff"
        :suggestions="data"
        fieldType="dropoff"
        v-bind="field"
        placeholder="Drop Off Location*"
      />
    </Field>
  </div>
  <div
    class="summary_item_wrapper mb-0 h-max w-max max-w-full pb-0"
    v-else-if="checkField('dropoff') && !isEditable"
  >
    <span class="summary_item_title">Drop Off Location:</span>
    <p
      class="summary_item_input w-full !truncate break-all !rounded-none !border-0 !p-0 !pb-2 text-background dark:!text-white"
    >
      {{ orderData.dropoff }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { Field } from 'vee-validate'
import { computed, toRef } from 'vue'
import TrustyComplete from '@/components/ui/autocomplete/TrustyComplete.vue'
import { useOrderStore } from '@/stores/ride/order'
import { useTrustyStore } from '@/stores/data/trustyComplete'
import type { OrderData } from '@/types/stores/ride/order'

interface LocationFieldsProps {
  isEditable?: boolean
  errors?: Partial<Record<'pickup' | 'dropoff', string>>
  checkField: (field: keyof OrderData) => boolean
}

const props = withDefaults(defineProps<LocationFieldsProps>(), {
  isEditable: false,
  errors: () => ({}) as Partial<Record<'pickup' | 'dropoff', string>>
})

const orderStore = useOrderStore()
const trustyStore = useTrustyStore()

const { orderData } = storeToRefs(orderStore)
const { pickupRef, dropoffRef, data } = storeToRefs(trustyStore)

const fetchSuggestions = trustyStore.fetchSuggestions
const selectSuggestions = trustyStore.selectSuggestions
const updateSuggestions = trustyStore.updateSuggestions

const isEditable = toRef(props, 'isEditable')
const errors = computed(() => props.errors ?? {})
const checkField = (field: keyof OrderData) => props.checkField(field)
</script>
