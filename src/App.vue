<template>
  <PagePreloader />
  <teleport to="body">
    <PleaseWaitPreloader v-if="isRequesting" :title="waitPreloaderTitle || undefined" />
  </teleport>
  <StayWithUs v-if="flow !== 'mainsite'" />
  <HeaderBlock v-if="flow !== 'mainsite'" />
  <ReloadPrompt />
  <main>
    <router-view :key="$route.path" />
  </main>
  <ProjectVersion v-if="flow !== 'mainsite'" />
  <WhatsAppWidget />
</template>
<script setup>
import { onBeforeMount, onMounted, defineAsyncComponent } from 'vue'
import { storeToRefs } from 'pinia'

import { useCentrifugoStore, useMainStore, useRidesHistoryStore } from '@/stores'
import { useUserStore } from '@/stores'

import PagePreloader from '@/components/ui/loaders/PagePreloader.vue'
import PleaseWaitPreloader from '@/components/ui/loaders/PleaseWaitPreloader.vue'

const HeaderBlock = defineAsyncComponent(() => import('@/blocks/HeaderBlock.vue'))
const ProjectVersion = defineAsyncComponent(
  () => import('@/components/ui/utils/ProjectVersion.vue')
)
const ReloadPrompt = defineAsyncComponent(() => import('@/components/ui/utils/ReloadPromptPWA.vue'))
const StayWithUs = defineAsyncComponent(
  () => import('@/components/layout/marketing/StayWithUs.vue')
)
const WhatsAppWidget = defineAsyncComponent(() => import('@/components/layout/WhatsAppWidget.vue'))

const centrifugoStore = useCentrifugoStore()
const mainStore = useMainStore()
const ridesHistoryStore = useRidesHistoryStore()
const userStore = useUserStore()
const { flow, ssid, isRequesting, waitPreloaderTitle } = storeToRefs(mainStore)
const { isLoggedIn } = storeToRefs(userStore)
const { isRequestSuccessful, isRequestPending, isRequestRefused } = storeToRefs(ridesHistoryStore)

onBeforeMount(async () => {
  let channels = []

  if (isLoggedIn.value) {
    const userId = userStore.user.id
    channels.push({
      event: 'as.orders.request.status',
      name: `Orders.History.Request.Status.Change.${userId}`,
      action: (data) => {
        if (data.status === 'succeed') {
          ridesHistoryStore.updateRequestStatus('succeed')
          isRequestSuccessful.value = true
        } else {
          ridesHistoryStore.updateRequestStatus('refused')
          isRequestRefused.value = true
        }
        isRequestPending.value = false
      }
    })
    channels.push({
      event: 'as.orders',
      name: `Orders.History.Ready.${userId}`,
      action: (data) => {
        ridesHistoryStore.updateRides({ data: data.orders })
        if (data.orders.length === 0) {
          ridesHistoryStore.updateRequestStatus('empty')
          isRequestRefused.value = false
          isRequestSuccessful.value = false
          isRequestPending.value = false
        }
      }
    })
  }

  if (flow.value === 'mainsite') {
    channels.push({
      event: 'fill_form',
      name: `dli-` + ssid.value,
      action: () => {}
    })
  }

  if (channels.length > 0) {
    centrifugoStore.connect(channels)
  }
})

onMounted(() => {})
</script>
