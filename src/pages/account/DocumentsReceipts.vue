<template>
  <h1 v-if="isLoggedIn" class="title mr-[15px] mt-8 pb-6 md:mt-[45px] md:pb-[64px]">
    Documents/Receipts
  </h1>
  <div v-if="isLoggedIn" class="flex flex-col max-lg:justify-between md:flex-row">
    <div
      class="left_side-wrapper scrollbar-hidden flex-nowrap overflow-x-scroll md:mr-[19.18%] md:overflow-x-visible"
    >
      <button
        @click="newRide"
        type="button"
        class="summary_edit_button m-0 text-nowrap px-[22px] py-[8px] font-bold md:px-[22px] md:py-[8px]"
      >
        Book a New Ride <span class="account__button__disc"></span>
      </button>
      <router-link to="/account/accountinformation" class="account__button text-nowrap"
        >Account Information <span class="account__button__disc"></span
      ></router-link>
      <router-link
        v-if="isAgency"
        to="/account/agencyinformation"
        class="account__button text-nowrap"
        >Agency information <span class="account__button__disc"></span
      ></router-link>
      <router-link to="/account/ridehistory" class="account__button text-nowrap"
        >Ride History <span class="account__button__disc"></span
      ></router-link>
      <button type="button" class="account__button active text-nowrap">
        Documents/Receipts<span class="account__button__disc"></span>
      </button>
      <router-link to="/account/termsofservice" class="account__button text-nowrap"
        >Terms of Service <span class="account__button__disc"></span
      ></router-link>
      <button v-if="!isMobile" @click="logOut" type="button" class="account__button text-[#878787]">
        Log Out
      </button>
    </div>
    <div v-if="isMobile" class="mt-[6px]">
      <button @click="logOut" type="button" class="account__button text-[#878787]">Log Out</button>
    </div>
    <div class="mt-[25px] w-full">
      <div class="flex w-full items-center border-b-[1px] border-[#E5E7EB] dark:border-background">
        <p
          class="hidden cursor-pointer rounded-t-[12px] px-6 py-2 text-center text-[18px] text-main"
          :class="activeTab === 'documents' ? 'bg-white dark:bg-background' : ''"
          @click.stop="activeTab = 'documents'"
        >
          Documents
        </p>
        <p
          class="cursor-pointer rounded-t-[12px] px-6 py-2 text-center text-[18px] text-main"
          :class="activeTab === 'receipts' ? 'bg-white dark:bg-background' : ''"
          @click.stop="activeTab = 'receipts'"
        >
          Receipts
        </p>
      </div>
      <div v-if="activeTab === 'documents'" class="mt-[33px] hidden flex-col gap-y-10">
        <div
          v-for="(doc, idx) in documents"
          :key="doc.id"
          class="rounded-[40px] border border-[#E5E7EB] bg-white px-6 py-8 dark:border-[#3D4043] dark:bg-dark_wind"
          :ref="(el: any) => (docPdfRefs[idx] = el)"
        >
          <div class="flex items-center justify-between pb-4">
            <p class="text-[24px] font-medium text-background dark:text-white">{{ doc.name }}</p>
            <p class="text-[18px] text-background dark:text-white">{{ doc.created_at }}</p>
          </div>
          <div
            class="grid grid-cols-12 gap-y-8 border-y-[1px] border-[#E5E7EB] py-4 dark:border-[#3D4043]"
          >
            <div class="col-span-full flex flex-col gap-y-2 lg:col-span-3">
              <span class="text-[18px] text-[#878787]">Location:</span>
              <p class="text-[18px] text-background dark:text-white">{{ doc.location }}</p>
            </div>
            <div class="col-span-full flex flex-col gap-y-2 lg:col-span-3">
              <span class="text-[18px] text-[#878787]">Name of Establishment:</span>
              <p class="text-[18px] text-background dark:text-white">{{ doc.establishment }}</p>
            </div>
            <div class="col-span-full flex flex-col gap-y-2 lg:col-span-3">
              <span class="text-[18px] text-[#878787]">Date and Time:</span>
              <p class="text-[18px] text-background dark:text-white">{{ doc.date }}</p>
            </div>
            <div class="col-span-full flex flex-col gap-y-2 lg:col-span-3">
              <span class="text-[18px] text-[#878787]">Number of People:</span>
              <p class="text-[18px] text-background dark:text-white">{{ doc.people }}</p>
            </div>
          </div>
          <div class="mt-4 flex justify-end">
            <button
              class="w-full rounded-full bg-main px-12 py-3 text-[18px] font-semibold text-background transition-all duration-[0.3s] ease-in hover:!bg-[#CCF2C8] dark:border dark:border-main dark:bg-background dark:text-main dark:hover:!bg-main dark:hover:text-[#2B2D38] lg:w-max lg:py-3"
              @click="generatePdf(idx, 'doc')"
            >
              Download
            </button>
          </div>
        </div>
      </div>
      <div v-if="activeTab === 'receipts'" class="mt-[33px] flex flex-col gap-y-10">
        <div v-if="receipts.length === 0" class="py-8 text-center text-[18px] text-[#878787]">
          No receipts found.
        </div>
        <div
          v-for="(rec, idx) in receipts"
          :key="rec.id"
          class="rounded-[40px] border border-[#E5E7EB] bg-white px-6 py-8 dark:border-[#3D4043] dark:bg-dark_wind"
          :ref="(el: any) => (recPdfRefs[idx] = el)"
        >
          <div class="flex items-center justify-between pb-4">
            <p class="text-[24px] font-medium text-background dark:text-white">{{ rec.name }}</p>
          </div>
          <div
            class="grid grid-cols-12 gap-y-8 border-y-[1px] border-[#E5E7EB] py-4 dark:border-[#3D4043]"
          >
            <div class="col-span-full flex flex-col gap-y-2 lg:col-span-3">
              <span class="text-[18px] text-[#878787]">Service type:</span>
              <p class="text-[18px] text-background dark:text-white">
                {{ formatCamelCase(rec.type_of_service) }}
              </p>
            </div>
            <div class="col-span-full flex flex-col gap-y-2 lg:col-span-3">
              <span class="text-[18px] text-[#878787]">Pick Up Location:</span>
              <p class="text-[18px] text-background dark:text-white">{{ rec.pickup }}</p>
            </div>
            <div v-if="rec.dropoff" class="col-span-full flex flex-col gap-y-2 lg:col-span-3">
              <span class="text-[18px] text-[#878787]">Drop-Off Location:</span>
              <p class="text-[18px] text-background dark:text-white">{{ rec.dropoff }}</p>
            </div>
            <div class="col-span-full flex flex-col gap-y-2 lg:col-span-3">
              <span class="text-[18px] text-[#878787]">Date and Time:</span>
              <p class="text-[18px] text-background dark:text-white">{{ rec.date_start }}</p>
            </div>
          </div>
          <div class="mt-4 flex justify-end">
            <div
              class="flex w-full items-center justify-between gap-x-4 lg:w-auto lg:justify-center"
            >
              <p
                v-if="rec.total || rec.amount"
                class="w-full text-[18px] font-semibold text-background dark:text-white"
              >
                {{ rec.total || rec.amount }} EUR
              </p>
              <button
                class="w-full rounded-full bg-main px-12 py-3 text-[18px] font-semibold text-background transition-all duration-[0.3s] ease-in hover:!bg-[#CCF2C8] dark:border dark:border-main dark:bg-background dark:text-main dark:hover:!bg-main dark:hover:text-[#2B2D38] lg:w-max lg:py-3"
                @click="generatePdf(idx, 'rec')"
              >
                Download
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <h1 v-if="!isLoggedIn" class="title mr-[15px] mt-[5rem]">
    Please login to view account information
  </h1>
  <router-link v-if="!isLoggedIn" to="/account/signin" class="button mt-[15px] w-fit"
    >Sign in
  </router-link>
  <swipe-modal
    v-model="isModal"
    v-if="isMobile"
    contents-height="60vh"
    border-top-radius="16px"
    background-color="ffffff"
    tip-color="#CDCFD0"
  >
    <car-popup-content />
  </swipe-modal>
  <div ref="documentPdfBlock" class="pdf-block">
    <h3 style="text-align: center; font-size: 18px; margin-bottom: 10px; color: black">Document</h3>
    <div style="border-bottom: 1px dashed #333; margin-bottom: 10px; color: black"></div>
    <div style="font-size: 14px; color: black; padding-bottom: 20px">
      <div><b>Name:</b> {{ pdfDocument?.name || '' }}</div>
      <div><b>Created At:</b> {{ pdfDocument?.created_at || '' }}</div>
      <div><b>Location:</b> {{ pdfDocument?.location || '' }}</div>
      <div><b>Name of Establishment:</b> {{ pdfDocument?.establishment || '' }}</div>
      <div><b>Date and Time:</b> {{ pdfDocument?.date || '' }}</div>
      <div><b>Number of People:</b> {{ pdfDocument?.people || '' }}</div>
    </div>
  </div>

  <!-- Скрытый чек для PDF (всегда в DOM) -->
  <div ref="receiptPdfBlock" class="pdf-block">
    <h3 style="text-align: center; font-size: 18px; margin-bottom: 5px; color: black">Receipt</h3>
    <div style="border-bottom: 1px dashed #333; color: black"></div>
    <div style="font-size: 14px; color: black">
      <div><b>transaction ID:</b> {{ pdfReceipt?.payment_code || '' }}</div>
      <div><b>order ID:</b> {{ pdfReceipt?.id || '' }}</div>
      <div><b>Total:</b> {{ pdfReceipt?.total || pdfReceipt?.amount || '' }} EUR</div>
      <div><b>Date:</b> {{ pdfReceipt?.date_start || '' }}</div>
      <div><b>Order:</b></div>
      <div><b>-Service type:</b> {{ formatCamelCase(pdfReceipt?.type_of_service) }}</div>
      <div><b>-Pick Up:</b> {{ pdfReceipt?.pickup || '' }}</div>
      <div v-if="pdfReceipt?.dropoff"><b>-Drop-Off:</b> {{ pdfReceipt?.dropoff || '' }}</div>
      <div v-if="pdfReceipt?.number_of_passengers">
        <b>-Car:</b> {{ pdfReceipt?.number_of_passengers || '' }}
      </div>
      <div v-if="pdfReceipt?.car"><b>-Car:</b> {{ pdfReceiptCar?.class_name || '' }}</div>
    </div>
    <div
      style="border-top: 1px dashed #333; margin-top: 10px; margin-bottom: 50px; color: black"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import swipeModal from '@takuma-ru/vue-swipe-modal'
import { useRouter } from 'vue-router'
import { useMobile } from '@/compose/ismobile'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
import CarPopupContent from '@/components/features/car/CarPopupContent.vue'
import { useOrderStore } from '@/stores/ride/order'
import { useRidesHistoryStore } from '@/stores/ride/history'
import { useTrustyStore } from '@/stores/data/trustyComplete'
import { useFetcher } from '@/compose/axios'
import type {
  ApiResponse,
  CarItem,
  DocumentItem,
  ElementRefs,
  PdfFormat,
  PdfTab,
  PdfType,
  ReceiptItem
} from '@/types/pages/account/DocumentsReceipts'
import { generatePdfFromElement } from '@/utils/html2pdfLoader'

const { axiosInstance } = useFetcher({ baseUrl: import.meta.env.VITE_APP_API_URL })
const trustyStore = useTrustyStore()
const router = useRouter()
const ridesStore = useRidesHistoryStore()
const userStore = useUserStore()
const orderStore = useOrderStore()
const { isLoggedIn, user } = storeToRefs(userStore)
const isModal = ref<boolean>(false)
const activeTab = ref<PdfTab>('receipts')
const documents = ref<DocumentItem[]>([])
const receipts = ref<ReceiptItem[]>([])

const { isMobile } = useMobile()

const isAgency = computed<boolean>(() => {
  return user.value?.type === 'agency' || user.value?.type === 'request for Agency'
})

const docPdfRefs: ElementRefs = ref<(HTMLElement | null)[]>([])
const recPdfRefs: ElementRefs = ref<(HTMLElement | null)[]>([])
const documentPdfBlock = ref<HTMLElement | null>(null)
const receiptPdfBlock = ref<HTMLElement | null>(null)
const pdfDocument = ref<DocumentItem | null>(null)
const pdfReceipt = ref<ReceiptItem | null>(null)
const cars = ref<CarItem[]>([])

const pdfReceiptCar = computed<CarItem | undefined>(() => {
  const carId = pdfReceipt.value?.car
  if (carId === undefined || carId === null) {
    return undefined
  }

  return cars.value.find((car) => String(car.class_id) === String(carId))
})

const newRide = (): void => {
  userStore.clearAgencyData()
  trustyStore.clearInput('pickup')
  trustyStore.clearInput('dropoff')
  orderStore.$reset()
  orderStore.changeTypeOrder('NEW')
  router.push({ name: 'home' })
}

const logOut = (): void => {
  ridesStore.$reset()
  userStore.preventLogout()
  axiosInstance.get(`/spy/logout`)
  setTimeout(() => router.push('/account/signin'), 100)
}

const formatCamelCase = (str: string | undefined): string => {
  if (!str) return ''
  return str.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (s) => s.toUpperCase())
}

const generatePdf = async (idx: number, type: PdfType): Promise<void> => {
  let element: HTMLElement | null = null
  let filename = ''

  if (type === 'doc') {
    const documentItem = documents.value[idx]
    if (!documentItem) {
      return
    }

    pdfDocument.value = documentItem
    await nextTick()
    element = documentPdfBlock.value
    filename = `document_${idx + 1}.pdf`
  } else if (type === 'rec') {
    const receiptItem = receipts.value[idx]
    if (!receiptItem) {
      return
    }

    pdfReceipt.value = receiptItem
    await nextTick()
    element = receiptPdfBlock.value
    filename = `receipt_${idx + 1}.pdf`
  }

  if (!element) {
    return
  }

  try {
    const format: PdfFormat = type === 'doc' ? 'a4' : 'a6'

    await generatePdfFromElement(element, {
      margin: 10,
      filename,
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format, orientation: 'portrait' }
    })
  } catch (error) {
    console.error('Ошибка при генерации PDF:', error)
  }
}

const getReceipts = async (): Promise<void> => {
  try {
    const { data } = await axiosInstance.get<ApiResponse<ReceiptItem[]>>('/payments')
    receipts.value = Array.isArray(data.data) ? data.data : []
  } catch (error) {
    console.error('Failed to fetch receipts:', error)
  }
}

const getCars = async (): Promise<void> => {
  try {
    const { data } = await axiosInstance.get<ApiResponse<CarItem[]>>('/cars')
    cars.value = Array.isArray(data.data) ? data.data : []
  } catch (error) {
    console.error('Failed to fetch cars:', error)
  }
}

onMounted(() => {
  void getReceipts()
  void getCars()
})
</script>

<style scoped>
.scrollbar-hidden::-webkit-scrollbar {
  display: none;
}

.scrollbar-hidden {
  scrollbar-width: none;
}

.scrollbar-hidden::-webkit-scrollbar {
  display: none;
}

.scrollbar-hidden {
  scrollbar-width: none;
}

.pdf-block {
  position: absolute;
  left: -9999px;
  top: auto;
  width: 280px;
  background: #fff;
  color: #000;
  font-family: monospace;
  padding: 1px;
  z-index: -1;
}
</style>
