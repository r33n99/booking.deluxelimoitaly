<template>
  <button
    class="languagesTrigger flex h-max w-max items-center justify-between gap-x-1.5 rounded-sm px-2 py-1.5 text-sm font-normal capitalize text-[#2B2D32] dark:text-white sm:text-xl md:py-2"
    type="button"
    translate="no"
    @click="onLanguageSwitcherClick"
  >
    <GlobeIcon />
    <span class="currentLanguage">{{ currentLanguage }}</span>
    <ArrowDownIcon />
  </button>
  <div
    class="languages z-10 hidden w-14 flex-col rounded-xl bg-[#D4DFD4] text-sm/normal font-normal text-[#2B2D32] *:py-1 *:capitalize dark:bg-[#292A2D] dark:text-[#878787]"
    translate="no"
  >
    <button
      v-for="lang in languages"
      :key="lang"
      :class="{
        'cursor-default text-[#A3B4A3] dark:text-main': lang === currentLanguage
      }"
      @click="handleLanguageChange(lang)"
    >
      {{ lang }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

import GlobeIcon from '@/components/ui/icons/GlobeIcon.vue'
import ArrowDownIcon from '@/components/ui/icons/ArrowDownIcon.vue'

const SUPPORTED_LANGUAGES = ['it', 'en'] as const
type Language = (typeof SUPPORTED_LANGUAGES)[number]

const languages = SUPPORTED_LANGUAGES
const currentLanguage = ref<Language>('en')

const highlightClasses = ['text-[#A3B4A3]', 'dark:text-main', 'cursor-default'] as const

interface FlowbiteDropdownInstance {
  hide: () => void
}

interface FlowbiteRegistry {
  getInstances: (type: 'Dropdown') => Record<string, FlowbiteDropdownInstance> | undefined
}

interface GoogleTranslateNamespace {
  TranslateElement?: new (
    options: Record<string, unknown>,
    container: string | HTMLElement
  ) => unknown
}

declare global {
  interface Window {
    FlowbiteInstances?: FlowbiteRegistry
    loadGoogleTranslate?: () => void
    google?: {
      translate?: GoogleTranslateNamespace
    }
  }
}

const isSupportedLanguage = (value: string | undefined): value is Language => {
  return Boolean(value && SUPPORTED_LANGUAGES.includes(value as Language))
}

const getLastSelectedLanguage = (): Language => {
  const cookieEntry = document.cookie
    .split(';')
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith('googtrans='))

  if (cookieEntry) {
    const match = cookieEntry.match(/[a-z]{2}$/i)
    const candidate = match?.[0]?.toLowerCase()
    if (isSupportedLanguage(candidate)) {
      return candidate
    }
  }

  return 'en'
}

const applyLanguageToDom = (lang: Language) => {
  const currentLanguageElements = document.querySelectorAll<HTMLElement>('.currentLanguage')
  currentLanguageElements.forEach((element) => {
    element.textContent = lang
  })

  const languageButtons = document.querySelectorAll<HTMLButtonElement>('.languages button')
  languageButtons.forEach((button) => {
    if (button.textContent === lang) {
      button.classList.add(...highlightClasses)
    } else {
      button.classList.remove(...highlightClasses)
    }
  })
}

const updateCurrentLanguage = () => {
  const lang = getLastSelectedLanguage()
  if (lang !== currentLanguage.value) {
    currentLanguage.value = lang
  }
  applyLanguageToDom(lang)
}

const handleLanguageChange = (lang: Language) => {
  if (lang === currentLanguage.value) return

  currentLanguage.value = lang

  if (window.google?.translate) {
    const googTeComboSelect = document.querySelector<HTMLSelectElement>('.goog-te-combo')
    if (googTeComboSelect) {
      googTeComboSelect.value = lang
      googTeComboSelect.dispatchEvent(new Event('change'))
    }
  } else {
    document.cookie = `googtrans=/auto/${lang}; path=/; max-age=31536000`
  }

  applyLanguageToDom(lang)
  closeDropdown()
}

const closeDropdown = () => {
  const dropdownInstances = window.FlowbiteInstances?.getInstances('Dropdown')
  if (dropdownInstances) {
    Object.values(dropdownInstances).forEach((instance) => {
      instance.hide()
    })
  }

  const languagesElements = document.querySelectorAll<HTMLElement>('.languages')
  languagesElements.forEach((element) => {
    element.classList.add('hidden')
  })
}

// Загрузка Google Translate только при первом клике на переключатель
const onLanguageSwitcherClick = () => {
  window.loadGoogleTranslate?.()
}

let languageCheckIntervalId: number | null = null
let languageCheckTimeoutId: number | null = null

onMounted(() => {
  updateCurrentLanguage()

  languageCheckIntervalId = window.setInterval(() => {
    const lang = getLastSelectedLanguage()
    if (lang !== currentLanguage.value) {
      updateCurrentLanguage()
    }
  }, 500)

  languageCheckTimeoutId = window.setTimeout(() => {
    if (languageCheckIntervalId !== null) {
      clearInterval(languageCheckIntervalId)
      languageCheckIntervalId = null
    }
  }, 10000)
})

onBeforeUnmount(() => {
  if (languageCheckIntervalId !== null) {
    clearInterval(languageCheckIntervalId)
    languageCheckIntervalId = null
  }

  if (languageCheckTimeoutId !== null) {
    clearTimeout(languageCheckTimeoutId)
    languageCheckTimeoutId = null
  }
})
</script>

<style scoped>
.languages:not(.hidden) {
  display: flex;
}
</style>
