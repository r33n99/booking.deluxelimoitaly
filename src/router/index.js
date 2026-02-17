import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { collect } from 'collect.js'
import { captureException } from '@sentry/vue'
import { createRouter, createWebHistory } from 'vue-router'
import {
  useCarsStore,
  useContactsStore,
  useMainStore,
  useOrderStore,
  useProfileCompletionStore,
  useUserStore
} from '@/stores'
import { useTrustyStore } from '@/stores/data/trustyComplete'
import { useFetcher } from '@/compose/axios'

import dayjs from 'dayjs'

const HomePage = () => import('@/pages/HomePage.vue')
const ContactPage = () => import('@/pages/ContactPage.vue')
const VehiclePage = () => import('@/pages/VehiclePage.vue')
const SuccessPage = () => import('@/pages/SuccessPage.vue')
const PaymentPage = () => import('@/pages/PaymentPage.vue')
const ContactDataPage = () => import('@/pages/ContactDataPage.vue')
const ServiceDataPage = () => import('@/pages/ServiceDataPage.vue')
const PasswordResetPage = () => import('@/pages/PasswordResetPage.vue')

// Tours
const TourPage = () => import('@/pages/tours/TourPage.vue')
const TourPayment = () => import('@/pages/tours/TourPayment.vue')
const TourSuccessPayment = () => import('@/pages/tours/TourSuccessPayment.vue')

// Templates
const NotAllowed = () => import('@/templates/NotAllowed.vue')
const AlreadyPaid = () => import('@/templates/AlreadyPaid.vue')
const PageNotFound = () => import('@/templates/PageNotFound.vue')

// Account pages
const AccountInformationPage = () => import('@/pages/account/AccountInformationPage.vue')
const SignInPage = () => import('@/pages/account/SignInPage.vue')
const RideHistoryPage = () => import('@/pages/account/RideHistoryPage.vue')
const TermsOfService = () => import('@/pages/account/TermsOfService.vue')
const DocumentsReceipts = () => import('@/pages/account/DocumentsReceipts.vue')
const AgencyInformation = () => import('@/pages/account/AgencyInformation.vue')

// Registration
const DetailsRegistration = () => import('@/pages/registration/DetailsRegistration.vue')
const EmailConfirm = () => import('@/pages/registration/EmailConfirm.vue')
const FinalRegistration = () => import('@/pages/registration/FinalRegistration.vue')

// Other
const MailCarTemplatePage = () => import('@/pages/MailCarTemplatePage.vue')
const SpySignIn = () => import('@/components/features/auth/SpySignIn.vue')

const routes = [
  {
    path: '/',
    name: 'home',
    props: true,
    component: HomePage,
    meta: { title: 'Home - ' + import.meta.env.VITE_PROJECT_TITLE }
  },
  {
    path: '/contact',
    name: 'contact',
    props: true,
    component: ContactPage,
    meta: { title: 'Contact - ' + import.meta.env.VITE_PROJECT_TITLE }
  },
  {
    path: '/vehicle',
    props: true,
    name: 'vehicle',
    component: VehiclePage,
    meta: { title: 'Vehicle - ' + import.meta.env.VITE_PROJECT_TITLE }
  },
  {
    path: '/payment',
    name: 'mail_car',
    component: MailCarTemplatePage,
    meta: { title: 'Mail Link - ' + import.meta.env.VITE_PROJECT_TITLE }
  },
  {
    path: '/payment/:transaction_id',
    name: 'payment',
    component: PaymentPage,
    meta: { title: 'Payment - ' + import.meta.env.VITE_PROJECT_TITLE }
  },
  {
    path: '/success/:order_id/:payment_link/:payment_session',
    name: 'success_payment',
    component: SuccessPage,
    meta: { title: 'Success - ' + import.meta.env.VITE_PROJECT_TITLE }
  },
  {
    path: '/success/payment_intent/:order_id',
    name: 'success_payment_intent',
    component: SuccessPage,
    meta: { title: 'Success - ' + import.meta.env.VITE_PROJECT_TITLE }
  },
  {
    path: '/success',
    name: 'success',
    component: SuccessPage,
    meta: { title: 'Success - ' + import.meta.env.VITE_PROJECT_TITLE }
  },
  {
    path: '/contactData',
    name: 'contactData',
    component: ContactDataPage,
    meta: { title: 'Contact Data - ' + import.meta.env.VITE_PROJECT_TITLE }
  },
  {
    path: '/serviceData',
    name: 'serviceData',
    component: ServiceDataPage,
    meta: { title: 'Service Data - ' + import.meta.env.VITE_PROJECT_TITLE }
  },
  {
    path: '/forbidden',
    name: 'forbidden',
    component: NotAllowed,
    meta: { title: 'Page is restricted - ' + import.meta.env.VITE_PROJECT_TITLE }
  },
  {
    path: '/alreadyPaid',
    name: 'alreadyPaid',
    component: AlreadyPaid,
    meta: { title: 'Request Already Paid - ' + import.meta.env.VITE_PROJECT_TITLE }
  },
  {
    path: '/account/accountinformation',
    name: 'accountinformation',
    component: AccountInformationPage,
    meta: { title: 'Account Information - ' + import.meta.env.VITE_PROJECT_TITLE }
  },
  {
    path: '/account/signin',
    name: 'signin',
    component: SignInPage,
    meta: { title: 'Sign in - ' + import.meta.env.VITE_PROJECT_TITLE }
  },
  {
    path: '/account/email-confirm',
    name: 'signin_email_confirm',
    component: EmailConfirm,
    meta: { title: 'Confirm Email - ' + import.meta.env.VITE_PROJECT_TITLE }
  },
  {
    path: '/spy/login/:token',
    name: 'spySignIn',
    component: SpySignIn,
    meta: { title: 'Loading - ' + import.meta.env.VITE_PROJECT_TITLE }
  },
  {
    path: '/account/ridehistory',
    name: 'ridehistory',
    component: RideHistoryPage,
    meta: { title: 'Ride History - ' + import.meta.env.VITE_PROJECT_TITLE }
  },
  {
    path: '/account/termsofservice',
    name: 'termsofservice',
    component: TermsOfService,
    meta: { title: 'Terms of Service - ' + import.meta.env.VITE_PROJECT_TITLE }
  },
  {
    path: '/account/documentsreceipts',
    name: 'documents/receipts',
    component: DocumentsReceipts,
    meta: { title: 'Documents and Invoices - ' + import.meta.env.VITE_PROJECT_TITLE }
  },
  {
    path: '/account/agencyinformation',
    name: 'agencyinformation',
    component: AgencyInformation,
    meta: { title: 'Agency Information - ' + import.meta.env.VITE_PROJECT_TITLE }
  },
  {
    path: '/password/reset/:hash',
    name: 'passwordReset',
    component: PasswordResetPage,
    meta: { title: 'Password Reset - ' + import.meta.env.VITE_PROJECT_TITLE }
  },
  {
    path: '/:pathMatch(.*)*',
    component: PageNotFound,
    meta: { title: 'Page Not Found - ' + import.meta.env.VITE_PROJECT_TITLE }
  },
  {
    path: '/registration/details',
    name: 'Step1',
    component: DetailsRegistration,
    meta: { title: 'Registration - ' + import.meta.env.VITE_PROJECT_TITLE, step: 1 }
  },
  {
    path: '/registration/emailconfirmation',
    name: 'Step2',
    component: EmailConfirm,
    meta: { title: 'Registration - ' + import.meta.env.VITE_PROJECT_TITLE, step: 2 }
  },
  {
    path: '/registration/finalize',
    name: 'Step3',
    component: FinalRegistration,
    meta: { title: 'Registration - ' + import.meta.env.VITE_PROJECT_TITLE, step: 3 }
  },
  {
    path: '/tour/:id',
    name: 'tour-page',
    component: TourPage,
    meta: { title: 'Tour' },
    beforeEnter: (to, from, next) => {
      if (from.name && from.name !== 'success') {
        next({ name: 'home' })
      } else {
        next()
      }
    }
  },
  {
    path: '/tour/payment',
    name: 'tour-payment',
    component: TourPayment,
    meta: { title: 'Payment page' }
  },
  {
    path: '/tour/payment/:params',
    name: 'tour-payment-page',
    component: TourSuccessPayment,
    meta: { title: 'Payment page' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

let isStripeLoading = false
let isStripeLoaded = false
const loadStripeIfNeeded = () => {
  if (isStripeLoaded || isStripeLoading) return
  isStripeLoading = true
  const script = document.createElement('script')
  script.src = 'https://js.stripe.com/v3/'
  script.async = true
  script.defer = true
  script.onload = () => {
    isStripeLoaded = true
    isStripeLoading = false
  }
  script.onerror = () => {
    isStripeLoading = false
  }
  document.head.appendChild(script)
}

router.onError((error) => {
  const message = error.message || ''
  if (
    message.includes('Importing a module script failed') ||
    message.includes('Failed to fetch dynamically imported module') ||
    (error.name === 'TypeError' && message === '')
  ) {
    const lastReload = sessionStorage.getItem('last-chunk-error-reload')
    const now = Date.now()
    if (!lastReload || now - parseInt(lastReload) > 10000) {
      sessionStorage.setItem('last-chunk-error-reload', now.toString())
      window.location.reload()
      return
    }
  }
  captureException(error)
})

router.afterEach(() => {
  sessionStorage.removeItem('last-chunk-error-reload')
})

router.beforeEach(async (to, from) => {
  window.scrollTo(0, 0)
  document.title = to.meta.title

  const formRoutes = new Set([
    'contact',
    'vehicle',
    'contactData',
    'serviceData',
    'Step1',
    'Step2',
    'Step3',
    'home',
    'success',
    'success_payment',
    'success_payment_intent',
    'passwordReset',
    'signin'
  ])

  const isAccountRoute = to.path.startsWith('/account/')

  // Загружаем vue-tel-input и vee-validate для formRoutes и account маршрутов
  if (formRoutes.has(to.name) || isAccountRoute) {
    try {
      await Promise.allSettled([
        import('vue-tel-input').then((module) => {
          if (window.__loadVueTelInput) {
            return window.__loadVueTelInput()
          }
        }),
        import('vue-tel-input/vue-tel-input.css'),
        import('@vuepic/vue-datepicker/dist/main.css')
      ])
      await Promise.allSettled([import('vee-validate'), import('yup')])
    } catch (e) {
      console.log(e)
    }
  }

  const contactsStore = useContactsStore()
  const orderStore = useOrderStore()
  const mainStore = useMainStore()
  const userStore = useUserStore()
  const trustyStore = useTrustyStore()
  const profileCompletionStore = useProfileCompletionStore()

  const { user, isLoggedIn } = storeToRefs(userStore)
  const { orderData, orderType, orderId, fleet } = storeToRefs(orderStore)

  if (to.name === 'passwordReset' && isLoggedIn.value) {
    return router.push({ name: 'home' })
  }

  if (to.name === 'success' && from.name === 'tour-page') {
    orderData.value.allowedPages['success'] = 1
    return true
  } else if (
    !['success_payment_intent', 'success'].includes(to.name) &&
    orderData.value.allowedPages['success']
  ) {
    delete orderData.value.allowedPages['success']
  }

  if (
    (to.name === 'home' && user?.value?.type === 'agency') ||
    user?.value?.show_information === 3 ||
    (user?.value?.type === 'request for Agency' && user?.value?.show_information === null)
  ) {
    await userStore.getUserInfo()
  }

  const { ssid, flow, paymentCode, paymentLink, paymentSession, isRequesting } =
    storeToRefs(mainStore)

  const carsStore = useCarsStore()
  const { cars } = storeToRefs(carsStore)
  const { axiosInstance } = useFetcher({ baseUrl: import.meta.env.VITE_APP_API_URL })
  const projectLink = ref(import.meta.env.VITE_PROJECT_URL)
  const formattedToday = dayjs().format('D.MM.Y')

  const updateOrder = async () => {
    const isAgency = user?.value?.type === 'agency'

    let fetchedContactId = null
    if (!orderData.value.contact_id && orderId.value) {
      try {
        const response = await axiosInstance.get('/orders/' + orderId.value)

        if (response.data?.data?.contact_id) {
          fetchedContactId = response.data.data.contact_id
          orderStore.update({ contact_id: fetchedContactId })
        }
        if (response.data?.data) {
          const orderDataKeys = collect(orderData.value).keys()
          const responseData = collect(response.data.data).only(orderDataKeys.toArray())
          orderStore.update(responseData.all())
        }
      } catch {
        // Ошибка получения заказа игнорируется
      }
    }

    const patchOrderData = {
      amount: orderData.value.amount ?? orderData.value.total,
      payment_code: paymentCode.value,
      payment_date: formattedToday,
      user_add: sessionStorage.getItem('user_add') === '1',
      notes: orderData.value.notes,
      transaction_id: orderData.value.transaction_id,
      status: 5
    }

    if (orderData.value.deal_id) {
      patchOrderData.deal_id = orderData.value.deal_id
    }
    if (orderData.value.lead_id) {
      patchOrderData.lead_id = orderData.value.lead_id
    }
    const contactId = orderData.value.contact_id || fetchedContactId || user?.value?.contact_id
    if (!contactId) {
      if (orderData.value.email) {
        patchOrderData.email = orderData.value.email
      }
      if (orderData.value.phone) {
        patchOrderData.phone = orderData.value.phone
      }
      if (orderData.value.first_name) {
        patchOrderData.first_name = orderData.value.first_name
      }
      if (orderData.value.last_name) {
        patchOrderData.last_name = orderData.value.last_name
      }
      if (orderData.value.country_prefix) {
        patchOrderData.country_prefix = orderData.value.country_prefix
      }
      if (orderData.value.code) {
        patchOrderData.code = orderData.value.code
      }
    } else {
      patchOrderData.contact_id = contactId
    }

    if (orderData.value.lead_id && !orderData.value.deal_id) {
      patchOrderData.step = 2
      if (orderData.value.distance !== null && orderData.value.distance !== undefined) {
        patchOrderData.distance = orderData.value.distance
      }
      if (orderData.value.total !== null && orderData.value.total !== undefined) {
        patchOrderData.total = orderData.value.total
      }
    }

    if (orderId.value) {
      await axiosInstance
        .patch('/orders/' + orderId.value, patchOrderData)
        .then(function () {
          mainStore.$reset()
          contactsStore.add(orderData.value)
          const actualRoute = isAgency ? '/success' : '/contactData'
          if (actualRoute === '/contactData') {
            orderData.value.allowedPages['contactData'] = 1
          }
          router.push(actualRoute)
        })
        .catch(function (error) {
          console.log(error)
        })
    }
  }
  const getOrder = async () => {
    await axiosInstance
      .get('/orders/' + orderId.value)
      .then(function (response) {
        const orderDataKeys = collect(orderData.value).keys()
        const responseData = collect(response.data.data).only(orderDataKeys.toArray())
        orderStore.update(responseData.all())
      })
      .catch(function (error) {
        console.log(error)
      })
  }
  const getSession = async () => {
    const getSessionParams = {
      session_id: paymentSession.value,
      payment_link: paymentLink.value,
      website: projectLink.value
    }

    await axiosInstance
      .post('/payment/session', getSessionParams)
      .then(function (response) {
        let paymentIntent = response?.data?.session?.payment_intent
        if (paymentIntent) {
          paymentCode.value = paymentIntent + '_aut'
          orderStore.update({ total: response?.data?.session?.amount_total / 100 })
        }
      })
      .catch(function (error) {
        console.log(error)
      })
  }

  // Загрузка Stripe для платежных страниц
  if (
    [
      'payment',
      'success_payment',
      'success_payment_intent',
      'tour-payment',
      'tour-payment-page'
    ].includes(to.name)
  ) {
    loadStripeIfNeeded()
  }

  const query = collect(to.query)

  if (to.name === 'success_payment_intent') {
    let { payment_session, payment_link, order_id } = { ...to.params }
    let { payment_intent } = { ...to.query }

    if (payment_session) {
      orderId.value = order_id
      await getOrder().then(() => {
        paymentLink.value = payment_link
        paymentSession.value = payment_session
        getSession().then(() => {
          updateOrder()
        })
      })
    }

    if (payment_intent) {
      paymentCode.value = payment_intent + '_aut'
      await updateOrder()
    }

    // Clear Timer in Payment
    orderData.value.countdown = 'stop'
  }

  if (query.has('ssid')) {
    flow.value = 'mainsite'
    ssid.value = query.get('ssid')
  }

  if (query.has('ssid_cache')) {
    isRequesting.value = true
    const getData = await axiosInstance

      .get('/orders/cache/fetch/' + query.get('ssid_cache'))
      .then((response) => {
        isRequesting.value = false
        return response.data.data
      })
      .catch(function (error) {
        isRequesting.value = false
        console.log(error)
      })
    let orderItems = collect(getData).except('ssid').items
    orderStore.update(orderItems)

    collect(orderItems.allowedPages).each((e, k) => {
      if (e === 1) {
        router.push('/' + k)
      }
    })
  }

  if (!query.has('mail_car')) {
    const mutateDate = (date) => {
      let firstStep = date.split(' ')
      let secondStep = firstStep[0].split('/')
      let threeStep = [secondStep[1], secondStep[0], secondStep[2]].join('/')

      return [threeStep, firstStep[1]].join(' ')
    }

    if (!query.has('payment_intent')) {
      var data = query

      if (query.has('id')) {
        const getData = await axiosInstance

          .get('/orders/cache/fetch/' + query.get('id'))
          .then((response) => {
            return response.data.data
          })
          .catch(function (error) {
            console.log(error)
          })

        data = getData ? collect(getData) : collect(data)
      }

      // Сохранить UTM-метки независимо от других параметров
      const utmData = {
        utm_source: data.get('utm_source'),
        utm_medium: data.get('utm_medium'),
        utm_campaign: data.get('utm_campaign'),
        utm_content: data.get('utm_content'),
        utm_term: data.get('utm_term')
      }

      if (data.has(['pickup', 'dropoff', 'date'])) {
        orderStore.$reset()
        carsStore.$reset()
        mainStore.$reset()
        orderStore.update({
          pickup: data.get('pickup'),
          dropoff: data.get('dropoff'),
          date_start: mutateDate(data.get('date')),
          entrypoint: data.get('tab_url'),
          sent_from: data.get('current_url'),
          type_of_service: 'oneWayTransfer',
          ...utmData,
          redis_id: query.get('id'),
          full_url: data.get('full_url')
        })
      }

      if (data.has(['pickup', 'duration', 'date'])) {
        orderStore.$reset()
        carsStore.$reset()
        mainStore.$reset()
        orderStore.update({
          pickup: data.get('pickup'),
          date_start: mutateDate(data.get('date')),
          distance: parseInt(data.get('duration')) * 20,
          entrypoint: data.get('tab_url'),
          sent_from: data.get('current_url'),
          hours: parseInt(data.get('duration')),
          type_of_service: 'hourlyAsDirected',
          ...utmData,
          redis_id: query.get('id'),
          full_url: data.get('full_url')
        })
      }

      if (data.get('tour', false) !== 'false' && data.get('tour', false)) {
        orderStore.$reset()
        carsStore.$reset()
        mainStore.$reset()
        orderStore.update({
          pickup: data.get('pickup'),
          reqs: data.get('requirments'),
          date_start: mutateDate(data.get('date')),
          entrypoint: data.get('tab_url'),
          sent_from: data.get('current_url'),
          hours: data.get('duration'),
          type_of_service: 'toursRoadshows',
          ...utmData,
          redis_id: query.get('id'),
          full_url: data.get('full_url')
        })

        axiosInstance.post('/orders', orderData.value).then(function (response) {
          orderStore.updateOrderId(response.data.data.id)
        })
      }
      if (data.get('fleet', false) !== 'false' && data.get('fleet', false)) {
        orderStore.update({
          car: data.get('car_index')
        })
        orderStore.updateFleet(true)

        //todo make request to localstorage
        axiosInstance
          .get('/cars')
          .then(function (response) {
            if (response.data.data && !cars.value) {
              carsStore.update(response.data.data)
            }
            const car = response.data.data.filter((e) => {
              return e.class_id === parseInt(data.get('car_index'))
            })
            carsStore.selectCar(car[0])
          })
          .catch(function (error) {
            console.log(error)
          })
      }

      // Сохранить UTM-метки даже если нет других параметров заказа
      if (Object.values(utmData).some((value) => value !== null && value !== undefined)) {
        orderStore.update(utmData)
      }

      if (data.get('tour', false) !== 'false' && data.get('tour', false)) {
        orderStore.updateTour(true)
      }
    }
  }

  if (query.has('mail_car')) {
    orderStore.updateMailCar(true)
    orderStore.updateOrderId(query.get('orderID'))
    isRequesting.value = true

    const cleanPrice = (p) => {
      if (!p) return null
      return p.replace(/[^\d.,]/g, '').replace(',', '.')
    }

    await axiosInstance

      .post('transaction/fetch/' + query.get('orderID'))

      .then(function (response) {
        const patchData = {
          car: query.get('car_index'),
          mail_car: 1,
          step: 2
        }

        if (query.has('DateTime')) {
          patchData.date_start = query.get('DateTime')
        }

        // SECURITY NOTE: Ideally, backend should calculate these prices.
        // Sending them from frontend is a vulnerability.
        // Cleaning prices from " EUR" suffix to avoid backend validation errors.
        patchData.total = cleanPrice(query.get('old_price'))
        patchData.amount = cleanPrice(query.get('price'))

        axiosInstance
          .patch('/orders/' + query.get('orderID'), patchData)
          .then(function (responseMega) {
            const orderDataKeys = collect(orderData.value).keys()
            const responseData = collect(responseMega.data.data).only(orderDataKeys.toArray())

            let dataStore = { ...responseData.except(['date_start']).items }
            orderStore.update(dataStore)

            if (responseMega.data.data.priceChanged) {
              mainStore.updatePriceChanged(true)
            }
            router.push('payment/' + response.data.data.transaction_id)
          })
          .catch(function (error) {
            isRequesting.value = false
            console.log(error)
          })
      })
      .catch(function (error) {
        isRequesting.value = false
        console.log(error)
      })
  }

  // Set allowed status pages for show "forbidden"
  if (
    to.name === 'contact' ||
    to.name === 'vehicle' ||
    to.name === 'success_payment_intent' ||
    to.name === 'contactData' ||
    to.name === 'serviceData' ||
    to.name === 'success'
  ) {
    if (
      user?.value?.type === 'agency' &&
      to.name !== 'success' &&
      to.name !== 'success_payment_intent'
    ) {
      return router.push({ name: 'success' })
    }

    // Проверка на тип заказа
    if (orderType.value === 'DUPLICATE') {
      orderData.value.allowedPages['vehicle'] = 1
    } else if (orderData.value.pickup) {
      if (orderData.value.type_of_service === 'toursRoadshows') {
        if (fleet.value) {
          orderData.value.allowedPages['contact'] = 1
        } else {
          orderData.value.allowedPages['vehicle'] = 1
        }
      } else {
        orderData.value.allowedPages['contact'] = 1
      }
    }

    if (!orderData.value.allowedPages[to.name]) {
      if (
        to.name === 'success_payment_intent' &&
        Object.prototype.hasOwnProperty.call(to.query, 'payment_intent') &&
        orderData.value.email != null
      ) {
        orderData.value.allowedPages[to.name] = 1
      } else {
        await router.push({ name: 'forbidden' })
      }
    }
  }

  // Reset data after contactData, ServiceData, Success pages
  if (to.name === 'contactData' || to.name === 'serviceData' || to.name === 'success') {
    orderStore.update({ paymentSuccess: true })
  } else {
    if (orderData.value.paymentSuccess) {
      orderStore.$reset()
      trustyStore.$reset()
      profileCompletionStore.$reset()
    }
  }

  if (orderData.value.timer_expires) {
    router.push({ name: 'home' })
    orderStore.$reset()
    trustyStore.$reset()
  }
})
export default router
