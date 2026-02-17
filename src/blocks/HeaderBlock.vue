<template>
  <div :class="{ hidden: !menuShow }" class="menu">
    <div
      class="mx-auto flex w-full max-w-[1440px] flex-row items-center justify-between py-4 sm:p-0"
    >
      <router-link to="/" v-if="not_allowed !== 'true'" aria-label="Go to homepage">
        <picture>
          <source :srcset="logosWebP[mode]" type="image/webp" />
          <img
            :src="logos[mode]"
            class="logo"
            alt="Company Logo"
            loading="eager"
            fetchpriority="high"
          />
        </picture>
      </router-link>
      <a :href="projectLink" v-if="not_allowed === 'true'" aria-label="Go to main site">
        <picture>
          <source :srcset="logosWebP[mode]" type="image/webp" />
          <img
            :src="logos[mode]"
            class="logo"
            alt="Company Logo"
            loading="eager"
            fetchpriority="high"
          />
        </picture>
      </a>
      <div class="burger_wrapper ml-auto mr-[1px] gap-x-3">
        <div
          v-if="mode === 'dark'"
          @click="mainStore.update('light')"
          class="mode_toggler max-sm:hidden"
        >
          <ModeLightIcon />
          <span class="text-[14px] leading-[142%] text-white sm:text-[20px] sm:leading-[22px]"
            >Light</span
          >
        </div>
        <div
          v-if="mode === 'light'"
          @click="mainStore.update('dark')"
          class="mode_toggler max-sm:hidden"
        >
          <ModeDarkIcon />
          <span class="text-[14px] leading-[142%] text-background sm:text-[20px] sm:leading-[22px]"
            >Dark</span
          >
        </div>
        <LanguageSwitcher />
        <router-link
          v-if="isLoggedIn"
          to="/account/ridehistory"
          class="button [word-break:_break-word]"
        >
          My Account
        </router-link>
        <template v-if="isMobile">
          <router-link
            v-if="!isLoggedIn && !isRegistrationPage"
            to="/registration/details"
            class="button !bg-[#3D4043] text-[#FFFFFF] [word-break:_break-word]"
            >Sign up</router-link
          >
          <router-link
            v-if="!isLoggedIn && isRegistrationPage"
            to="/account/signin"
            class="button [word-break:_break-word]"
            >Sign in</router-link
          >
        </template>
      </div>
      <div class="menu_close" @click="toggleAccordion">
        <TimesMobileIcon v-if="isMobile" />
        <TimesIcon v-if="!isMobile" />
      </div>
    </div>
    <div
      class="mx-auto mt-[110px] flex w-full max-w-[1440px] flex-col items-center justify-between md:flex-row xl:mt-[98px]"
    >
      <div
        class="menu_hover mb-[64px] flex w-full flex-col items-start justify-between gap-y-6 xl:mb-0 xl:w-[65%] xl:gap-y-12"
      >
        <a
          v-for="(item, index) in links"
          :key="index"
          :href="item.url"
          class="menu_title hover:text-main xl:hidden"
        >
          {{ item.text }}
        </a>
        <a
          v-for="(item, index) in menuItems"
          :key="index"
          :href="item.url"
          class="menu_title hover:text-main"
        >
          {{ item.text }}
        </a>
      </div>
      <ContactInfo />
    </div>
    <div
      v-if="mode === 'dark'"
      @click="mainStore.update('light')"
      class="flex cursor-pointer justify-center gap-x-1.5 rounded-full bg-background p-3.5 sm:hidden"
    >
      <ModeLightIcon class="size-5" />
      <span class="text-[14px] leading-[142%] text-white">Light</span>
    </div>
    <div
      v-if="mode === 'light'"
      @click="mainStore.update('dark')"
      class="flex cursor-pointer justify-center gap-x-1.5 rounded-full bg-[#E8EDE8] p-3.5 sm:hidden"
    >
      <ModeDarkIcon class="size-5" />
      <span class="text-[14px] leading-[142%] text-background">Dark</span>
    </div>
  </div>
  <div class="flex w-full flex-row items-center justify-between py-4 sm:p-0">
    <router-link to="/" v-if="not_allowed != 'true'" class="shrink-0" aria-label="Go to homepage">
      <picture>
        <source :srcset="logosWebP[mode]" type="image/webp" />
        <img
          :src="logos[mode]"
          class="logo"
          alt="Company Logo"
          loading="eager"
          fetchpriority="high"
        />
      </picture>
    </router-link>
    <a
      :href="projectLink"
      v-if="not_allowed == 'true'"
      class="shrink-0"
      aria-label="Go to main site"
    >
      <picture>
        <source :srcset="logosWebP[mode]" type="image/webp" />
        <img
          :src="logos[mode]"
          class="logo"
          alt="Company Logo"
          loading="eager"
          fetchpriority="high"
        />
      </picture>
    </a>
    <nav class="hidden flex-row items-center justify-between xl:flex">
      <a
        :key="index"
        v-for="(link, index) in links"
        target="_blank"
        :href="link.url"
        class="menu__item mr-[48px]"
        >{{ link.text }}</a
      >
    </nav>

    <div class="burger_wrapper gap-x-3">
      <div
        v-if="mode === 'dark'"
        @click="mainStore.update('light')"
        class="mode_toggler max-sm:hidden"
      >
        <ModeLightIcon />
        <span class="text-[14px] leading-[142%] text-white sm:text-[20px] sm:leading-[22px]"
          >Light</span
        >
      </div>
      <div
        v-if="mode === 'light'"
        @click="mainStore.update('dark')"
        class="mode_toggler max-sm:hidden"
      >
        <ModeDarkIcon />
        <span class="text-[14px] leading-[142%] text-background sm:text-[20px] sm:leading-[22px]"
          >Dark</span
        >
      </div>
      <LanguageSwitcher />
      <router-link
        v-if="isLoggedIn"
        to="/account/ridehistory"
        class="button [word-break:_break-word]"
      >
        My Account
      </router-link>
      <template v-if="isMobile">
        <router-link
          v-if="!isLoggedIn && !isRegistrationPage"
          to="/registration/details"
          class="button [word-break:_break-word] md:!bg-[#3D4043] md:text-[#FFFFFF]"
          >Sign up</router-link
        >
        <router-link
          v-if="!isLoggedIn && isRegistrationPage"
          to="/account/signin"
          class="button [word-break:_break-word]"
          >Sign in</router-link
        >
      </template>
      <template v-else>
        <router-link
          v-if="!isLoggedIn"
          to="/registration/details"
          class="button !bg-[#3D4043] text-[#FFFFFF] [word-break:_break-word]"
          >Sign up</router-link
        >
        <router-link v-if="!isLoggedIn" to="/account/signin" class="button [word-break:_break-word]"
          >Sign in</router-link
        >
      </template>
      <BurgerIcon @click="toggleAccordion" />
    </div>
  </div>
</template>
<script setup lang="ts">
import darklogo from '~project_assets/images/logo.png'
import lightlogo from '~project_assets/images/logo-light.png'
import darklogoWebP from '~project_assets/images/logo.webp'
import lightlogoWebP from '~project_assets/images/logo-light.webp'
import { ref, reactive, inject, onBeforeMount, onMounted, computed } from 'vue'
import { useMainStore } from '@/stores/ui/main'
import { storeToRefs } from 'pinia'
import { useMobile } from '@/compose/ismobile'
import ModeLightIcon from '@/components/ui/icons/ModeLightIcon.vue'
import ModeDarkIcon from '@/components/ui/icons/ModeDarkIcon.vue'
import ContactInfo from '@/blocks/ContactInfo.vue'
import BurgerIcon from '@/components/ui/icons/BurgerIcon.vue'
import TimesMobileIcon from '@/components/ui/icons/TimesMobileIcon.vue'
import TimesIcon from '@/components/ui/icons/TimesIcon.vue'
import { useUserStore } from '@/stores/user'
import { Dropdown } from 'flowbite'
import { useRoute, useRouter } from 'vue-router'
import LanguageSwitcher from '@/components/ui/utils/LanguageSwitcher.vue'
import type { Ref } from 'vue'

interface MenuItem {
  text: string
  url: string
}

interface LinkItem {
  text: string
  url: string
}

type ColorMode = 'light' | 'dark'

const mainStore = useMainStore()
const userStore = useUserStore()
const { isLoggedIn } = storeToRefs(userStore)
const storage = inject<Storage>('storage')

const projectLink: Ref<string> = ref(import.meta.env.VITE_PROJECT_URL)

const { mode } = storeToRefs(mainStore) as { mode: Ref<ColorMode> }

const not_allowed: string | null = storage?.getItem('not_allowed') || null

const menuShow: Ref<boolean> = ref(false)
const logos: Record<ColorMode, string> = {
  light: lightlogo,
  dark: darklogo
}

const logosWebP: Record<ColorMode, string> = {
  light: lightlogoWebP,
  dark: darklogoWebP
}

const route = useRoute()
const { isMobile } = useMobile()
const isRegistrationPage = computed(() => route.path === '/registration/details')

const toggleAccordion = (): void => {
  if (menuShow.value === true) {
    document.body.classList.remove('overflow-hidden')
    document.body.classList.add('overflow-auto')
  } else {
    document.body.classList.remove('overflow-auto')
    document.body.classList.add('overflow-hidden')
  }
  menuShow.value = !menuShow.value
}

const activeIndex: Ref<number | null> = ref(null)

const links: LinkItem[] = []
const menuItems: MenuItem[] = []

onBeforeMount(() => {
  type NavigationConfig = {
    [key: string]: {
      links: Array<{ text: string; url: string }>
      menuItems: Array<{ text: string; url: string }>
    }
  }

  const navigationConfig: NavigationConfig = {
    dli: {
      links: [
        { text: 'About Us', url: 'about-us/' },
        { text: 'Limo Service', url: 'services/limo-service/' },
        { text: 'Italy Tours', url: 'italy-tours/' },
        { text: 'B2B', url: 'b2b/' }
      ],
      menuItems: [
        { text: 'Fleet', url: 'fleet/' },
        { text: 'Airport Transfers', url: 'services/airport-transfers/' },
        { text: 'Gems of Italy', url: 'blog/' },
        { text: 'Contact Us', url: 'contact/' }
      ]
    },
    rlt: {
      links: [
        { text: 'About Us', url: 'about-us/' },
        { text: 'Limo Service', url: 'rome-limousine-service/' },
        { text: 'Chauffeur Service', url: 'rome-chauffeur-service/' },
        { text: 'Private Driver', url: 'rome-private-driver/' }
      ],
      menuItems: [
        { text: 'Fleet', url: 'fleet/' },
        { text: 'Rome Car Service', url: 'rome-car-service/' },
        { text: 'B2B', url: 'b2b/' },
        { text: 'Contact Us', url: 'contact/' }
      ]
    },
    dgt: {
      links: [
        { text: 'About Us', url: 'about-us/' },
        { text: 'Private tours', url: 'tuscany-private-tours/' },
        { text: 'Chauffeur Service', url: 'tuscany-chauffeur-service/' },
        { text: 'B2B', url: 'b2b/' }
      ],
      menuItems: [
        { text: 'Fleet', url: 'our-fleet/' },
        { text: 'Airport Transfers', url: 'transfers/' },
        { text: 'Contact Us', url: 'contacts/' }
      ]
    }
  }

  const projectAlias = import.meta.env.VITE_PROJECT_ALIAS
  const config = navigationConfig[projectAlias]

  if (config) {
    config.links.forEach((link: LinkItem) => {
      links.push({
        text: link.text,
        url: projectLink.value + link.url
      })
    })

    config.menuItems.forEach((item: MenuItem) => {
      menuItems.push({
        text: item.text,
        url: projectLink.value + item.url
      })
    })
  }
})

const router = useRouter()

onMounted(() => {
  router.beforeEach((to, from, next) => {
    if (menuShow.value) {
      toggleAccordion()
    }
    next()
  })

  const languagesTriggers: NodeListOf<HTMLElement> = document.querySelectorAll('.languagesTrigger')
  const languagesElements: NodeListOf<HTMLElement> = document.querySelectorAll('.languages')
  const dropdownInstances: Dropdown[] = []

  const getLastSelectedLanguage = (): string | undefined => {
    return document.cookie
      .split(';')
      .find((elem) => {
        return elem.includes('googtrans')
      })
      ?.slice(-2)
  }

  window.languageSwitcherElementInit = () => {
    const pageLanguage = getLastSelectedLanguage() || 'en'

    const translateApi = window.google?.translate
    if (!translateApi?.TranslateElement) {
      return
    }

    new translateApi.TranslateElement(
      { pageLanguage: null, includedLanguages: 'it,en' },
      'languageSwitcherElement'
    )

    const googTeComboSelect = document.querySelector('.goog-te-combo') as HTMLSelectElement | null
    const currentLanguageElements = document.querySelectorAll('.currentLanguage')
    const languagesButtons: NodeListOf<HTMLButtonElement> =
      document.querySelectorAll('.languages button')
    const highlightColor = ['text-[#A3B4A3]', 'dark:text-main', 'cursor-default']

    if (languagesButtons.length > 0 && googTeComboSelect) {
      if (pageLanguage) {
        googTeComboSelect.value = pageLanguage
      }

      languagesButtons.forEach((button) => {
        const buttonText = button.textContent.trim()
        if (buttonText === pageLanguage) {
          button.classList.add(...highlightColor)
        }
      })
    }

    if (googTeComboSelect) {
      googTeComboSelect.addEventListener('change', () => {
        const selectedLang = googTeComboSelect.value

        currentLanguageElements.forEach((element) => {
          element.textContent = selectedLang
        })

        document.cookie = `googtrans=/auto/${selectedLang}; path=/; max-age=31536000`
      })
    }
  }

  if (languagesElements.length >= 2 && languagesTriggers.length >= 2) {
    dropdownInstances.push(
      new Dropdown(languagesElements[0], languagesTriggers[0]),
      new Dropdown(languagesElements[1], languagesTriggers[1])
    )
  }

  // Функция загрузки Google Translate доступна глобально для LanguageSwitcher
  const loadGoogleTranslate = () => {
    if (window.google?.translate || window.isGoogleTranslateLoading) return

    window.isGoogleTranslateLoading = true
    const script = document.createElement('script')
    script.src =
      'https://translate.google.com/translate_a/element.js?cb=languageSwitcherElementInit'
    script.async = true
    script.defer = true
    script.onload = () => {
      window.isGoogleTranslateLoading = false
    }
    script.onerror = () => {
      window.isGoogleTranslateLoading = false
    }
    document.head.appendChild(script)
  }

  window.loadGoogleTranslate = loadGoogleTranslate

  const savedLanguage = getLastSelectedLanguage()

  if (savedLanguage && savedLanguage !== 'en') {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(loadGoogleTranslate, { timeout: 2000 })
    } else {
      setTimeout(loadGoogleTranslate, 1000)
    }
  }
})
</script>
