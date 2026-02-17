<template>
  <div class="relative">
    <div class="input_wrapper">
      <input
        class="!pr-[50px]"
        v-model="inputValue"
        @input="handleInput"
        @focus="handleFocus"
        type="text"
        :placeholder="placeholder"
        :class="classname"
      />
      <button
        class="clear_button bg-main"
        v-if="clearable && inputValue?.length"
        @click.prevent="clearInput"
      >
        X
      </button>
    </div>
    <AutocompleteList
      @selectSuggestion="selectSuggestion"
      :suggestions="suggestions"
      :showSuggestions="showSuggestions"
      :fieldType="fieldType"
    />
  </div>
</template>

<script setup lang="ts">
import { nextTick, watch, onMounted, onBeforeUnmount, ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useTrustyStore } from '@/stores/data/trustyComplete'
import AutocompleteList from '@/components/ui/autocomplete/AutocompleteList.vue'

type FieldType = 'pickup' | 'dropoff'

type PlaceCategory = 'airport' | 'port' | 'transit_station' | 'train_station' | 'other'

interface AutocompleteSuggestion {
  description?: string
  place_id?: string
  selected?: boolean
  types?: string[]
  [key: string]: unknown
}

interface TrustyCompleteProps {
  suggestions: AutocompleteSuggestion[]
  classname?: string
  minChars?: number
  placeholder?: string
  fieldType?: FieldType
  autoCompleteString?: string | null
  clearable?: boolean
}

type SuggestionWithGeometry = AutocompleteSuggestion & {
  geometry?: {
    location?: {
      lat: number
      lng: number
    }
  }
}

const trustyStore = useTrustyStore()
const {
  updatePlaceChoised,
  updateLastChoisePlace,
  findPlace,
  updatePathStartFinish,
  updateMainTypes
} = trustyStore
const { showSuggestions } = storeToRefs(trustyStore)

const inputValue = defineModel<string | null>({ default: null })

const props = withDefaults(defineProps<TrustyCompleteProps>(), {
  classname: '',
  minChars: 1,
  placeholder: '',
  fieldType: 'pickup',
  autoCompleteString: '',
  clearable: false
})

const fieldType = computed<FieldType>(() => props.fieldType)
const minChars = computed(() => props.minChars)
const suggestions = ref<AutocompleteSuggestion[]>([...props.suggestions])

const emit = defineEmits<{
  (event: 'get:suggestions', value: string, fieldType: FieldType): void
  (event: 'update:suggestions', value: AutocompleteSuggestion[]): void
  (event: 'clear:input'): void
  (event: 'select:suggestions', fieldType: FieldType, placeId: string): void
}>()

watch(
  () => props.suggestions,
  (value) => {
    suggestions.value = [...value]
  }
)

const clearInput = () => {
  inputValue.value = ''
  emit('clear:input')
}

const handleInput = () => {
  nextTick(() => {
    updatePlaceChoised(false, fieldType.value)
    const value = inputValue.value ?? ''
    if (value.length >= minChars.value) {
      emit('get:suggestions', value, fieldType.value)
    } else {
      showSuggestions.value[fieldType.value] = false
    }
  })
}

const selectSuggestion = (suggestion: AutocompleteSuggestion) => {
  const description = suggestion.description ?? ''
  const placeId = suggestion.place_id ?? ''

  inputValue.value = description
  showSuggestions.value[fieldType.value] = false
  emit('select:suggestions', fieldType.value, placeId)
  updateLastChoisePlace(
    {
      formatted_address: description,
      place_id: placeId
    },
    fieldType.value
  )
  updatePlaceChoised(true, fieldType.value)
}

const closeDropdown = (event: MouseEvent) => {
  const target = event.target as HTMLElement | null
  if (
    target &&
    !target.closest('#autocomplete-list') &&
    !target.closest('#duplicate_ride') &&
    !target.closest('#book_return_ride')
  ) {
    showSuggestions.value[fieldType.value] = false

    if (!inputValue.value && props.autoCompleteString) {
      inputValue.value = props.autoCompleteString
    }

    suggestions.value = []
    emit('update:suggestions', [])
  }
}

const handleFocus = () => {
  const closeModal: FieldType = fieldType.value === 'pickup' ? 'dropoff' : 'pickup'
  showSuggestions.value[closeModal] = false
  emit('update:suggestions', [])

  handleInput()
}

const autoComplete = () => {
  if (!props.autoCompleteString) {
    return
  }

  inputValue.value = props.autoCompleteString
  updateLastChoisePlace(
    { formatted_address: props.autoCompleteString, place_id: '' },
    fieldType.value
  )
  updatePlaceChoised(true, fieldType.value)

  findPlace(props.autoCompleteString, (data) => {
    const candidate = data.candidates?.[0] as SuggestionWithGeometry | undefined
    const location = candidate?.geometry?.location
    if (
      data.status === 'OK' &&
      candidate &&
      location &&
      typeof location.lat === 'number' &&
      typeof location.lng === 'number' &&
      !isNaN(location.lat) &&
      !isNaN(location.lng)
    ) {
      updatePathStartFinish(location, fieldType.value)
      const candidateType = (candidate.types?.[0] as PlaceCategory | undefined) ?? 'other'
      updateMainTypes(candidateType, fieldType.value)
    }
  })
}

watch(inputValue, (newVal) => {
  const value = newVal ?? ''
  if (value.length < minChars.value) {
    suggestions.value = []
    emit('update:suggestions', [])
    showSuggestions.value[fieldType.value] = false
  }
})

onMounted(() => {
  if (props.autoCompleteString) {
    autoComplete()
  }
  document.addEventListener('click', closeDropdown)
})

onBeforeUnmount(() => {
  showSuggestions.value[fieldType.value] = false
  document.removeEventListener('click', closeDropdown)
})
</script>

<style>
.input_wrapper {
  position: relative;
}

.clear_button {
  position: absolute;
  color: black;
  font-size: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  right: 20px;
  top: 37%;
}
</style>
