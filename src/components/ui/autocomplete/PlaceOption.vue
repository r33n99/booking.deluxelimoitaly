<template>
  <div class="relative flex gap-3">
    <div class="absolute z-10 min-h-[20px] min-w-[20px] pr-1 duration-300">
      <PlaceIcon class="fill-[#B3B3B3] duration-300 dark:group-hover:fill-white" />
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
import PlaceIcon from '@/components/ui/icons/PlaceIcon.vue'

interface AutocompletePlace {
  description?: string
  place_id?: string
  [key: string]: unknown
}

interface PlaceOptionProps {
  place: AutocompletePlace
  selected?: boolean
}

const props = withDefaults(defineProps<PlaceOptionProps>(), {
  selected: false
})
</script>
