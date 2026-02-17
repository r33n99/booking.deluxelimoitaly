<template>
  <div @click.stop class="fixed bottom-[10px] right-[10px] z-40">
    <div
      class="relative flex cursor-pointer flex-col items-start justify-start gap-0.5 self-stretch"
      @trigger="hideOnClickOutside"
    >
      <a
        class="group absolute bottom-[110%] right-0 mt-[37px] inline-flex w-full min-w-max flex-col items-start justify-start gap-4 rounded-bl-xl rounded-tl-xl rounded-tr-xl bg-[#22c55e] px-4 py-6 duration-300"
        :class="{ '!hidden': !isVisible }"
        :href="whatsAppLink"
        target="_blank"
        rel="nofollow noopener noreferrer"
        @click="closeWidget"
      >
        <img :src="whatsappLogo" alt="" width="124" height="29" loading="lazy" />
        <div class="flex flex-col items-start justify-start gap-0.5 self-stretch">
          <p class="text-lg font-bold leading-[27px] text-white">Get a quick consultation</p>
          <p class="text-sm font-normal leading-[21px] text-white">
            Our managers respond instantly.
          </p>
        </div>
        <div
          class="flex w-full shrink grow basis-0 items-center justify-center gap-2 rounded-lg border border-transparent bg-black px-[31px] py-[13px] duration-300 group-hover:border-white group-hover:bg-transparent"
        >
          <span class="text-center text-sm font-bold leading-tight text-white duration-300"
            >Write to WhatsApp</span
          >
        </div>
      </a>
      <img
        :src="whatsAppIcon"
        @click="toggleVisibility"
        alt="WhatsApp"
        class="cursor-pointer"
        width="56"
        height="56"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import whatsappLogoImg from '~project_assets/images/whatsapp-logo.png'
import whatsAppIconImg from '@/assets/images/WhatsAppIcon.svg?url'

type ProjectAlias = 'dli' | 'rlt' | 'dgt'

const whatsappLogo = whatsappLogoImg as string
const whatsAppIcon = whatsAppIconImg as string

const createWhatsAppLink = (alias: ProjectAlias | undefined) => {
  const baseUrl = 'https://wa.me/'
  const dictionary: Record<ProjectAlias, string> = {
    dli: '390553950449',
    rlt: '390553950489',
    dgt: '390553950429'
  }

  if (!alias || !(alias in dictionary)) {
    return `${baseUrl}+`
  }

  return `${baseUrl}+${dictionary[alias]}`
}

const whatsAppLink = ref<string>(
  createWhatsAppLink(import.meta.env.VITE_PROJECT_ALIAS as ProjectAlias)
)

const isMobile = ref<boolean>(typeof window !== 'undefined' ? window.innerWidth <= 767 : false)
const isVisible = ref<boolean>(false)

const hideOnClickOutside = () => {
  isVisible.value = false
}

const closeWidget = () => {
  isVisible.value = false
}

const toggleVisibility = () => {
  isVisible.value = !isVisible.value
}

onMounted(() => {
  document.addEventListener('click', closeWidget)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', closeWidget)
})
</script>
