<template>
  <section
    class="gap-x-15 relative mt-[6px] flex overflow-hidden rounded-[18px] bg-white p-3 dark:bg-dark_wind max-xl:flex-col lg:p-12 xl:mt-12"
  >
    <tour-text-modal
      v-if="activeModalId === data.id"
      :title="data.name"
      :text="data.description"
      :modal-id="data.id"
      @close="handleModalClose"
    />
    <div class="mb-6 flex w-full flex-col xl:mb-0 xl:max-w-[293px]">
      <p class="mb-2.5 text-[16px]/[22px] font-light text-[#8D8D8D]">Step {{ step }}</p>
      <p class="text-[22px]/110% mb-6 font-bold text-black dark:text-white lg:text-[32px]/[110%]">
        {{ data.name }}
      </p>
      <p class="text-[14px]/[130%] text-[#8D8D8D] xl:text-[18px]/[130%]">
        <tour-clamped-text :showButton="false" :text="data.description" />
      </p>
      <button
        v-if="data.description.length > 300"
        @click="openModal(data.id)"
        class="button mt-6 w-full lg:w-max"
      >
        More information
      </button>
    </div>
    <div class="flex w-full flex-col gap-y-6">
      <div
        v-for="(addon, index) in addonsWithAvailability"
        :key="addon.id"
        class="flex cursor-pointer place-items-center gap-4 rounded-[18px] bg-[#F2F2F2] p-[18px] dark:bg-[#1E1E20] max-xl:flex-col"
        @click="addon.unavailable ? null : setActiveCard(addon.id)"
        :class="[
          addon.id === activeAddonId ? '!bg-grey-dark !border-coral' : '',
          addon.unavailable && '!border-[#A23535]'
        ]"
      >
        <div
          :class="{ 'opacity-50': addon.unavailable }"
          class="flex h-full w-full flex-col gap-x-4 gap-y-4 xl:flex-row"
        >
          <div
            v-if="addon.mediaPreview.image || addon.mediaPreview.video"
            class="relative flex h-[160px] w-full items-center justify-center rounded-[10px] bg-[#00000033] py-4 xl:h-full xl:max-w-[218px] xl:py-0"
          >
            <div
              v-if="!imageLoadedMap[index]"
              class="absolute inset-0 flex items-center justify-center"
            >
              <div class="aspect-[185/104] h-auto w-full xl:h-[121px] xl:w-[185px]">
                <tour-skeleton class="h-[121px] w-[185px] rounded-xl" />
              </div>
            </div>
            <div class="flex h-[121px] w-[185px] items-center justify-center">
              <tour-video-player
                v-if="addon.mediaPreview.video"
                only-view
                skeleton
                :src="addon.mediaPreview.video"
                class="h-[121px] w-[185px] rounded-xl object-cover"
                @loaded="markMediaReady(index)"
                @loading="markMediaLoading(index)"
                @error="markMediaReady(index)"
              >
                <template #skeleton>
                  <tour-skeleton class="h-[121px] w-[185px] rounded-xl" />
                </template>
              </tour-video-player>
              <img
                v-else
                class="h-[121px] w-[185px] rounded-xl object-cover"
                :src="addon.mediaPreview.image"
                alt="addon"
                @load="markMediaReady(index)"
                @error="markMediaReady(index)"
              />
            </div>
          </div>
          <div
            v-else
            class="flex h-[160px] w-full items-center justify-center rounded-[10px] bg-[#00000033] py-4 xl:h-full xl:max-w-[218px] xl:py-0"
          ></div>
          <div class="flex w-full flex-col">
            <div>
              <p class="text-[12px]/[138%] lg:font-medium xl:text-[24px]/[138%]">
                {{ addon.name }}
              </p>
              <p class="text-12 leading-17 mt-1 text-[#8D8D8D] dark:text-[#A9A9A9]">
                <tour-clamped-text :limit="550" :text="addon.description" />
              </p>
            </div>
            <template v-if="variant(addon) === 'icons'">
              <div v-if="addon?.highlights" class="mt-4 flex flex-wrap gap-2">
                <tour-chip
                  v-for="chip in addon?.highlights"
                  :key="chip.id"
                  variant="outlined"
                  class="flex items-center gap-2 !text-nowrap !border-main/40 text-black/70 dark:text-white/70"
                >
                  <img :src="chip.icon" alt="icon" class="h-4 w-4" />
                  {{ chip.title }}
                </tour-chip>
              </div>
            </template>
            <div class="border-t-1 my-5 border-[#1F1F1F]"></div>
            <div class="relative w-full xl:mt-0">
              <button
                class="text-[20p]/[110%] w-full cursor-pointer rounded-[40px] border border-transparent bg-[#1E1E20] p-5 font-medium text-white/50 dark:border-[#1F1F1F] dark:bg-[#151515] lg:text-[24px]/[110%]"
                :class="[addon.id === activeAddonId ? '!bg-main !text-background' : '']"
                @click="isMobile ? toggleTooltip() : null"
              >
                <template v-if="addon.unavailable"> unavailable</template>
                <template v-else>
                  <template v-if="mandatory">
                    <template v-if="addon.id === activeAddonId">
                      <div class="flex w-full flex-row justify-center gap-x-2">
                        <span class="w-full text-center text-[20px] lg:text-[24px]">
                          {{ getPriceText(addon) }}
                        </span>
                      </div>
                    </template>
                    <template v-else>
                      <span class="block w-full text-center">
                        {{ getPriceText(addon) }}
                      </span>
                    </template>
                  </template>
                  <template v-else>
                    <span class="block w-full text-center">
                      {{ getPriceText(addon) }}
                    </span>
                  </template>
                </template>
              </button>
              <span
                v-if="addon.unavailable"
                class="absolute bottom-[-8%] right-[20%] text-[#A13535]"
                >max {{ addon.max_participants }} participants</span
              >
            </div>
          </div>
        </div>
      </div>
      <div
        v-if="!mandatory && !hasBaseService"
        class="flex cursor-pointer justify-end gap-x-4 gap-y-4 rounded-[40px] border-2 bg-[#F2F2F2] p-[18px] dark:border-transparent dark:bg-[#1E1E20]"
        :class="{ '!bg-grey-dark border-main dark:border-main/30': activeAddonId === null }"
        @click="setActiveCard(null)"
      >
        <button
          class="border-grey-dark leading-22 w-full rounded-[99px] bg-[#2B2D32]/10 p-5 text-[16px]/[110%] font-medium text-white dark:bg-[#2B2D32] lg:text-[24px]/[110%]"
          :class="{ '!text-main': activeAddonId === null }"
        >
          Skip this
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, toRefs, defineEmits, onMounted, watch } from 'vue'
import { PriceCalculationService } from '@/utils/priceCalculationService'
import TourTextModal from '@/components/ui/tours/TourTextModal.vue'
import TourClampedText from '@/components/ui/tours/TourClampedText.vue'
import TourSkeleton from '@/components/ui/tours/TourSkeleton.vue'
import TourChip from '@/components/ui/tours/TourChip.vue'
import TourVideoPlayer from '@/components/ui/tours/TourVideoPlayer.vue'
import { useMedia } from '@/compose/useMedia'

const props = defineProps({
  data: Object,
  participants: Number,
  driverHourRate: Number,
  category: Object,
  step: Number,
  getPriceWithSign: Function
})
const emit = defineEmits(['addon-selected', 'addon-removed', 'addon-unavailable'])

const { data } = toRefs(props)

const activeAddonId = ref(null)
const imageLoadedMap = ref({})
const activeModalId = ref(null)
const showTooltip = ref(false)
const priceService = PriceCalculationService
const { getMediaUrl, getVideoPreviewUrl, isVideoItem, isImageItem, IMAGE_SIZES } = useMedia()

const VIDEO_FORMATS = new Set(['mp4', 'webm', 'ogg'])
const IMAGE_FORMATS = new Set(['webp', 'jpg', 'jpeg', 'png'])

const getExtension = (url = '') => url.split('?')[0].split('.').pop()?.toLowerCase() || ''

const isMobile = computed(() => window?.innerWidth <= 767)

const mandatory = computed(() => {
  return props.category?.mandatory === true || props.data?.type?.mandatory === 1
})

const isNewMediaItem = (item) => {
  if (!item || typeof item !== 'object') return false
  return (
    typeof item.id === 'number' &&
    typeof item.type === 'string' &&
    typeof item.filename === 'string' &&
    typeof item.extension === 'string'
  )
}

const isVideo = (item) => {
  if (!item) return false
  const mime = item.mime?.toLowerCase?.() || ''
  if (mime.startsWith('video/')) return true
  const format = item.format?.toLowerCase?.() || ''
  if (VIDEO_FORMATS.has(format)) return true
  return VIDEO_FORMATS.has(getExtension(item.url))
}

const isImage = (item) => {
  if (!item) return false
  if (isVideo(item)) return false
  const mime = item.mime?.toLowerCase?.() || ''
  if (mime.startsWith('image/')) return true
  const format = item.format?.toLowerCase?.() || ''
  if (IMAGE_FORMATS.has(format)) return true
  return IMAGE_FORMATS.has(getExtension(item.url))
}

const isMediaItem = (item) =>
  item &&
  typeof item === 'object' &&
  typeof item.url === 'string' &&
  (typeof item.format === 'string' || typeof item.mime === 'string')

const collectMedia = (value) => {
  if (!value) return []

  if (Array.isArray(value)) {
    return value.flatMap(collectMedia)
  }

  if (isMediaItem(value)) {
    return [value]
  }

  if (typeof value === 'object') {
    return Object.values(value).flatMap(collectMedia)
  }

  return []
}

const pickVideo = (items) => {
  if (!items.length) return ''
  const preferred = items.find((item) => item.width === '768')
  return preferred?.url || items[0]?.url || ''
}

const findBestImage = (items) => {
  if (!items.length) return ''
  const sizes = isMobile.value ? ['320', '768'] : ['1440', '1024', '768', '320']
  const formats = ['webp', 'jpg']
  for (const size of sizes) {
    for (const format of formats) {
      const match = items.find((item) => {
        const mime = item.mime?.toLowerCase?.() || ''
        const currentFormat = item.format?.toLowerCase?.() || ''
        return item.width === size && (currentFormat === format || mime.includes(format))
      })
      if (match?.url) return match.url
    }
  }
  const fallback = items.find((item) => item.url)
  return fallback?.url || ''
}

const getAddonPreview = (addon) => {
  if (!addon?.media || !Array.isArray(addon.media)) {
    return { image: '', video: '' }
  }

  // Новый формат MediaItem
  if (addon.media.length > 0 && isNewMediaItem(addon.media[0])) {
    const videoItem = addon.media.find((item) => isVideoItem(item))
    const imageItem = addon.media.find((item) => isImageItem(item))

    return {
      // Для видео: video - это оригинальный URL видеофайла, image - это превью (poster)
      video: videoItem ? getMediaUrl(videoItem, IMAGE_SIZES.ORIGINAL) : '',
      image: imageItem
        ? getMediaUrl(imageItem, isMobile.value ? IMAGE_SIZES.MEDIUM : IMAGE_SIZES.LARGE)
        : videoItem && videoItem.has_preview
          ? getVideoPreviewUrl(videoItem, IMAGE_SIZES.LARGE)
          : ''
    }
  }

  // Старый формат
  const mediaItems = collectMedia(addon.media)
  if (!mediaItems.length) {
    return { image: '', video: '' }
  }

  const videoItems = mediaItems.filter(isVideo)
  const imageItems = mediaItems.filter(isImage)

  return {
    video: pickVideo(videoItems),
    image: findBestImage(imageItems.length ? imageItems : mediaItems)
  }
}

const allowedCodesMap = {
  1: ['MBE', 'MBS', 'MBGLS'],
  2: ['MBE', 'MBS', 'MBGLS'],
  3: ['MBE', 'MBV', 'MBGLS'],
  4: ['MBV', 'MBSPC', 'MBGLS'],
  5: ['MBV', 'MBSPC', 'MBGLS'],
  6: ['MBV', 'MBSPC', 'MBGLS'],
  7: ['MBV', 'MBSPC', 'MBSPL'],
  8: ['MBSPC', 'MBSPL']
}

const updateAllowedCodesMap = (participants) => {
  const baseAddonId = getBaseAddonId(participants)
  if (!baseAddonId) return

  const baseAddon = data.value.addons.find((a) => a.id === baseAddonId)
  if (!baseAddon || !baseAddon.code) return

  const participantsKey = Math.min(participants, 8)
  const currentAllowedCodes = allowedCodesMap[participantsKey] || []

  if (currentAllowedCodes.includes(baseAddon.code)) return

  allowedCodesMap[participantsKey] = [...currentAllowedCodes, baseAddon.code]
}

const getBaseAddonId = (participants) => {
  // 1. New prioritized logic from configs
  if (props.category?.configs?.length) {
    let config = props.category.configs.find(
      (c) => Number(c.participants_count) === Number(participants)
    )
    if (!config) config = props.category.configs[0]

    if (config?.base_service_id) return config.base_service_id
  }

  // 2. Fallback to participant_base_services
  if (data.value.participant_base_services?.length > 0) {
    const baseService = data.value.participant_base_services.find(
      (service) => Number(service.participants) === Number(participants)
    )
    if (baseService) return baseService.addon_id
  }

  // 3. Fallback to uniform_base_service
  if (data.value.has_uniform_base_service) {
    return data.value.base_service_id
  }

  return null
}

// Проверяем, есть ли базовый сервис в категории
const hasBaseService = computed(() => {
  const baseAddonId = getBaseAddonId(props.participants)
  return baseAddonId !== null
})

const isBaseAddon = (addon) => {
  const baseAddonId = getBaseAddonId(props.participants)
  if (addon.id !== baseAddonId) return false

  if (!isUnlimited(addon.max_participants)) {
    return props.participants <= addon.max_participants
  }

  return true
}

const openModal = (segmentId) => {
  activeModalId.value = segmentId
}

const toggleTooltip = () => {
  showTooltip.value = true
  setTimeout(() => {
    showTooltip.value = false
  }, 2000)
}

const variant = (addon) => {
  return addon.highlights ? 'icons' : 'text'
}

const handleModalClose = (closedId) => {
  if (closedId === undefined || closedId === activeModalId.value) {
    activeModalId.value = null
  }
}
const markMediaLoading = (index) => {
  imageLoadedMap.value[index] = false
}

const markMediaReady = (index) => {
  imageLoadedMap.value[index] = true
}

const addonsWithAvailability = computed(() => {
  const currentParticipants = props.participants
  const isTransportation = data.value.type.name === 'Transportation'

  const participantsKey = isTransportation ? Math.min(currentParticipants, 8) : 0
  const allowedCodes = isTransportation ? allowedCodesMap[participantsKey] || [] : null

  const sourceAddons = Array.isArray(data.value.addons) ? data.value.addons : []

  const availableAddons = sourceAddons
    .map((addon) => {
      const mediaPreview = getAddonPreview(addon)
      return {
        ...addon,
        mediaPreview,
        is_base: isBaseAddon(addon),
        unavailable:
          !isUnlimited(addon.max_participants) && currentParticipants > addon.max_participants
      }
    })
    .filter((addon) => {
      if (addon.unavailable) return false

      if (isTransportation && addon.code && allowedCodes && !allowedCodes.includes(addon.code)) {
        return false
      }

      return true
    })

  const baseAddon = availableAddons.find((addon) => addon.is_base)
  const otherAddons = availableAddons.filter((addon) => !addon.is_base)

  return baseAddon ? [baseAddon, ...otherAddons] : [...otherAddons]
})

const isUnlimited = (maxParticipants) => {
  const max = Number(maxParticipants)
  return Number.isNaN(max) || max === 0
}

const setActiveCard = (addonId) => {
  activeAddonId.value = addonId

  if (addonId !== null) {
    const addon = data.value.addons.find((a) => a.id === addonId)
    if (addon) {
      emit('addon-selected', addon, data.value.id, data.value)
    }
  } else {
    emit('addon-removed', data.value.id)
  }
}

// calculatePrice logic moved to PriceCalculationService

const getPriceText = (addon) => {
  return props.getPriceWithSign(addon)
}

const autoSelectAddon = () => {
  const available = addonsWithAvailability.value.filter((a) => !a.unavailable)

  // Выбор самого дешевого или базового аддона теперь делегирован логике в TourPage
  // Здесь мы просто выбираем базовый если он есть
  const baseAddonId = getBaseAddonId(props.participants)
  if (baseAddonId) {
    const baseAddon = available.find((a) => a.id === baseAddonId)
    if (baseAddon) {
      setActiveCard(baseAddon.id)
      return
    }
  }

  if (!mandatory.value) {
    setActiveCard(null)
    return
  }

  if (available.length > 0) {
    setActiveCard(available[0].id)
  }
}

watch(
  () => props.participants,
  (newParticipants) => {
    updateAllowedCodesMap(newParticipants)
    addonsWithAvailability.value.forEach((addon) => {
      if (addon.unavailable) {
        emit('addon-unavailable', data.value.id, addon.id)
      }
    })

    if (!mandatory.value) {
      const selected = addonsWithAvailability.value.find((a) => a.id === activeAddonId.value)
      if (!selected || selected.unavailable) {
        setActiveCard(null)
      }
      return
    }

    const available = addonsWithAvailability.value.filter((a) => !a.unavailable)
    if (available.length === 0) {
      setActiveCard(null)
      return
    }

    const baseAddonId = getBaseAddonId(props.participants)
    const baseAddon = available.find((a) => a.id === baseAddonId)

    if (baseAddon) {
      setActiveCard(baseAddon.id)
    } else if (available.length > 0) {
      setActiveCard(available[0].id)
    }
  },
  { deep: true }
)

watch(
  () => data.value.addons,
  () => {
    imageLoadedMap.value = {}
    data.value.addons.forEach((_, index) => {
      markMediaLoading(index)
    })
  },
  { immediate: true }
)

onMounted(() => {
  updateAllowedCodesMap(props.participants)
  autoSelectAddon()
  data.value.addons.forEach((_, index) => {
    markMediaLoading(index)
  })
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease-in;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}
</style>
