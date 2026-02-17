<template>
  <div
    v-if="openList"
    class="absolute left-0 top-[calc(100%+8px)] z-[21] w-full rounded-2xl border-[#878787] bg-white p-4 text-base/[17.6px] font-bold dark:border-[#3D4043] dark:bg-background md:w-[calc(100%+200px)] md:text-lg/[23.8px]"
    id="autocomplete-list"
  >
    <component
      v-for="(item, index) in suggestions"
      :key="index"
      :is="componentsOrder[index]"
      @click="emit('selectSuggestion', item)"
      @mouseenter="
        () => {
          mouseEnter(index)
          adjustScroll()
        }
      "
      class="relative flex cursor-pointer overflow-x-auto rounded-full bg-transparent p-5 text-[#878787] duration-300"
      :class="[
        lastChoisePlace.place_id === item.place_id && 'pointer-events-none',
        item.selected &&
          'autocomplete_item-selected bg-[#CCF2C8] text-black dark:bg-[#333639] dark:text-white',
        lastChoisePlace[props.fieldType].place_id === item.place_id
          ? 'border border-main'
          : 'border-none'
      ]"
    >
      <component
        :is="parsePlaceType(item)"
        :selected="item.selected"
        :place="item"
        class="group truncate py-1"
      >
      </component>
    </component>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onBeforeMount, onBeforeUnmount, computed, nextTick, type Component } from 'vue'
import { storeToRefs } from 'pinia'
import { useTrustyStore } from '@/stores/data/trustyComplete'
import FirstComponent from '@/components/ui/autocomplete/order/FirstComponent.vue'
import SecondComponent from '@/components/ui/autocomplete/order/SecondComponent.vue'
import ThirdComponent from '@/components/ui/autocomplete/order/ThirdComponent.vue'
import FourthComponent from '@/components/ui/autocomplete/order/FourthComponent.vue'
import FifthComponent from '@/components/ui/autocomplete/order/FifthComponent.vue'
import AirportOption from '@/components/ui/autocomplete/AirportOption.vue'
import HotelOption from '@/components/ui/autocomplete/HotelOption.vue'
import PlaceOption from '@/components/ui/autocomplete/PlaceOption.vue'
import TrainOption from '@/components/ui/autocomplete/TrainOption.vue'

type FieldType = 'pickup' | 'dropoff'

interface SuggestionVisibility {
  pickup: boolean
  dropoff: boolean
}

interface AutocompleteSuggestion {
  description?: string
  place_id?: string
  selected?: boolean
  types?: string[]
  [key: string]: unknown
}

interface AutocompleteListProps {
  suggestions: AutocompleteSuggestion[]
  showSuggestions: SuggestionVisibility
  fieldType: FieldType
}

interface PlaceSummary {
  place_id?: string
  [key: string]: unknown
}

type LastChoisePlaceState = PlaceSummary & Record<FieldType, PlaceSummary>

const trustyStore = useTrustyStore()
const { lastChoisePlace: lastChoisePlaceSource } = storeToRefs(trustyStore)

const lastChoisePlace = computed<LastChoisePlaceState>(
  () =>
    (lastChoisePlaceSource.value as unknown as LastChoisePlaceState | undefined) ?? {
      place_id: undefined,
      pickup: {},
      dropoff: {}
    }
)

const props = defineProps<AutocompleteListProps>()
const emit = defineEmits<{
  (event: 'selectSuggestion', suggestion: AutocompleteSuggestion): void
}>()

const fieldType = ref<FieldType>(props.fieldType)
const suggestions = ref<AutocompleteSuggestion[]>(props.suggestions)
const showSuggestions = ref<SuggestionVisibility>(props.showSuggestions)

watch(
  () => props.fieldType,
  (value) => {
    fieldType.value = value
  }
)

const openList = computed(
  () => showSuggestions.value[fieldType.value] && suggestions.value.length > 0
)

const componentsOrder: Component[] = [
  FirstComponent,
  SecondComponent,
  ThirdComponent,
  FourthComponent,
  FifthComponent
]

const typeComponentMap: Record<string, Component> = {
  airport: AirportOption,
  other: PlaceOption,
  lodging: HotelOption,
  train_station: TrainOption,
  transit_station: TrainOption
}

const parsePlaceType = (item: AutocompleteSuggestion): Component => {
  const itemTypes = Array.isArray(item.types) ? item.types : []
  const matchedType = itemTypes.find((type) => typeComponentMap[type]) ?? 'other'
  return typeComponentMap[matchedType] ?? PlaceOption
}

watch(
  () => [props.suggestions, props.showSuggestions] as const,
  ([newSuggestions, newShowSuggestions]) => {
    suggestions.value = newSuggestions
    showSuggestions.value = newShowSuggestions

    if (suggestions.value.length) {
      suggestions.value[0].selected = true
    }
  }
)

watch(openList, () => {
  adjustScroll()
})

const adjustScroll = () => {
  nextTick(() => {
    const selectedDom = document.querySelector<HTMLElement>(
      '.autocomplete_item-selected #autocomplete-place-text'
    )
    if (!selectedDom) {
      return
    }

    const selectedContainerDom = document.querySelector<HTMLElement>('.autocomplete_item-selected')
    if (!selectedContainerDom) {
      return
    }

    if (selectedDom.offsetWidth + 50 > selectedContainerDom.offsetWidth) {
      const distance = selectedDom.offsetWidth - selectedContainerDom.offsetWidth
      const animDuration = distance / 50 < 2.5 ? 2.5 : distance / 50
      selectedDom.style.animation = `scrollText ${animDuration}s linear infinite`

      const scrollText = `@keyframes scrollText {
        0% { transform: translateX(0); }
        10% { transform: translateX(0); }
        90% { transform: translateX(-${distance + 50}px); }
        100% { transform: translateX(-${distance + 50}px); }
      }`

      const styleSheet = document.createElement('style')
      styleSheet.classList.add('scrollTextStyle')
      styleSheet.type = 'text/css'
      styleSheet.innerHTML = scrollText
      document.head.appendChild(styleSheet)
    } else {
      selectedDom.style.transform = 'translateX(0)'
    }
  })
}

const mouseEnter = (index: number) => {
  clearSelected()
  const suggestion = suggestions.value[index]
  if (suggestion) {
    suggestion.selected = true
  }
}

const clearSelected = () => {
  suggestions.value.forEach((item) => {
    item.selected = false
  })

  const existingStyle = document.querySelector<HTMLStyleElement>('.scrollTextStyle')
  existingStyle?.remove()

  document.querySelectorAll<HTMLElement>('#autocomplete-place-text').forEach((element) => {
    element.style.animation = ''
  })
}

const handlePressButtons = (event: KeyboardEvent) => {
  if (!openList.value) {
    return
  }

  const arrowDown = 40
  const arrowUp = 38
  const enterButton = 13

  if (![arrowDown, arrowUp, enterButton].includes(event.keyCode)) {
    return
  }

  event.preventDefault()

  const suggestionCount = suggestions.value.length
  if (suggestionCount === 0) {
    return
  }

  let index = suggestions.value.findIndex((suggestion) => suggestion.selected === true)
  if (index === -1) {
    index = 0
  }

  if (event.keyCode === arrowDown || event.keyCode === arrowUp) {
    clearSelected()
    if (event.keyCode === arrowDown) {
      const nextIndex = index < suggestionCount - 1 ? index + 1 : 0
      suggestions.value[nextIndex].selected = true
    }
    if (event.keyCode === arrowUp) {
      const prevIndex = index > 0 ? index - 1 : suggestionCount - 1
      suggestions.value[prevIndex].selected = true
    }
    adjustScroll()
  }

  if (event.keyCode === enterButton) {
    const item = suggestions.value.find((suggestion) => suggestion.selected === true)
    if (item) {
      emit('selectSuggestion', item)
    }
  }
}

const keydownListener = (event: Event) => {
  handlePressButtons(event as KeyboardEvent)
}

onBeforeMount(() => {
  document.addEventListener('keydown', keydownListener)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', keydownListener)
})
</script>
