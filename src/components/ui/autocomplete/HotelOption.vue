<template>
  <div class="relative flex justify-between gap-3">
    <div class="absolute z-10 h-full min-w-[20px] pr-1 duration-300">
      <HotelIcon class="fill-[#B3B3B3] duration-300 dark:group-hover:fill-white" />
    </div>
    <p
      id="autocomplete-place-text"
      class="pl-8"
      :class="!props.selected && 'overflow-hidden text-ellipsis'"
    >
      {{ props.place.description }}
    </p>
  </div>
</template>

<script setup lang="ts">
import HotelIcon from '@/components/ui/icons/HotelIcon.vue'

interface AutocompletePlace {
  description?: string
  place_id?: string
  [key: string]: unknown
}

interface HotelOptionProps {
  place: AutocompletePlace
  selected?: boolean
}

const props = withDefaults(defineProps<HotelOptionProps>(), {
  selected: false
})
</script>
