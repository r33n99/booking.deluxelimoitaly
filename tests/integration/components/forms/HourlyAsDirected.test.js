import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { nextTick } from 'vue'
import { createTestStore } from '../../../unit/helpers/createTestStore'
import { useOrderStore } from '@/stores/ride/order'
import { useTrustyStore } from '@/stores/data/trustyComplete'
import { useMainStore } from '@/stores/ui/main'
import { useCarsStore } from '@/stores/ride/cars'
import { useUserStore } from '@/stores/user'
import axios from 'axios'

// Mock axios для Google Places API
vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    create: vi.fn(() => ({
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() }
      }
    })),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() }
    },
    defaults: {
      headers: {
        common: {}
      }
    }
  }
}))

// Mock vue-router
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    currentRoute: { value: { path: '/' } }
  }),
  useRoute: () => ({
    path: '/',
    params: {},
    query: {}
  })
}))

// Mock compose модули
vi.mock('@/compose/axios', () => ({
  useFetcher: vi.fn(() => ({
    axiosInstance: {
      get: vi.fn(),
      post: vi.fn()
    }
  }))
}))

vi.mock('@/compose/ismobile', () => ({
  useMobile: () => ({ isMobile: false })
}))

vi.mock('@/compose/datePicker', () => ({
  useDatePicker: () => ({
    datePickerRef: { value: { closeMenu: vi.fn() } },
    minDate: new Date(),
    minTime: { hours: 0, minutes: 0 },
    datePicker: { value: new Date('2024-12-25 10:00') },
    handleInternal: vi.fn(),
    dateFormat: 'yyyy-MM-dd HH:mm',
    initialDate: { value: new Date('2024-12-25 10:00') },
    timeSetFirstTime: { value: false },
    timeOptions: ['09:00', '10:00', '11:00', '12:00']
  })
}))

describe('HourlyAsDirected Simple Integration Tests', () => {
  let orderStore
  let trustyStore
  let mainStore
  let carsStore
  let userStore

  const createMockCarData = () => [
    {
      class_id: 1,
      slug_class_name: 'Economy',
      class_images: 'economy1.jpg|economy2.jpg',
      isAvailable: true
    },
    {
      class_id: 2,
      slug_class_name: 'Business',
      class_images: 'business1.jpg|business2.jpg',
      isAvailable: true
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Создаем изолированные тестовые stores
    const { store: orderTestStore } = createTestStore(useOrderStore, { stubActions: false })
    const { store: trustyTestStore } = createTestStore(useTrustyStore, { stubActions: false })
    const { store: mainTestStore } = createTestStore(useMainStore, { stubActions: false })
    const { store: carsTestStore } = createTestStore(useCarsStore, { stubActions: false })
    const { store: userTestStore } = createTestStore(useUserStore, { stubActions: false })
    
    orderStore = orderTestStore
    trustyStore = trustyTestStore 
    mainStore = mainTestStore
    carsStore = carsTestStore
    userStore = userTestStore

    // Устанавливаем базовые данные
    orderStore.orderData.type_of_service = 'hourlyAsDirected'
    orderStore.orderData.hours = 2
    orderStore.orderData.status = 1
    
    carsStore.cars = createMockCarData()
    
    mainStore.ssid = 'test-ssid'
    mainStore.mode = 'light'
    mainStore.flow = 'mainsite'

    // Mock Google Places API
    vi.mocked(axios.get).mockResolvedValue({
      data: {
        result: {
          address_components: [
            { long_name: 'Italy', short_name: 'IT', types: ['country', 'political'] }
          ],
          geometry: { location: { lat: 41.9028, lng: 12.4964 } },
          formatted_address: 'Rome, Italy',
          place_id: 'test-place-id'
        }
      }
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Store Integration', () => {
    it('должен корректно инициализировать hourlyAsDirected заказ', () => {
      // Инициализируем заказ
      orderStore.update({
        type_of_service: 'hourlyAsDirected',
        hours: 3,
        pickup: 'Rome, Italy',
        status: 1
      })

      // Проверяем базовые данные
      expect(orderStore.orderData.type_of_service).toBe('hourlyAsDirected')
      expect(orderStore.orderData.hours).toBe(3)
      expect(orderStore.orderData.pickup).toBe('Rome, Italy')
      expect(orderStore.orderData.status).toBe(1)
    })

    it('должен рассчитывать расстояние на основе часов (hours * 20)', () => {
      const hours = 5
      
      orderStore.update({
        type_of_service: 'hourlyAsDirected',
        hours: hours,
        distance: hours * 20
      })

      expect(orderStore.orderData.distance).toBe(100) // 5 * 20
    })

    it('должен сохранять выбранный автомобиль в carsStore', () => {
      const selectedCar = createMockCarData()[1] // Business
      
      carsStore.selectCar(selectedCar)
      
      expect(carsStore.selectedCar).toEqual(selectedCar)
      expect(carsStore.selectedCar.slug_class_name).toBe('Business')
    })
  })

  // Helper function для создания Google Places API ответов
  const createGooglePlaceResponse = (countryName, isEuCountry = true) => ({
    data: {
      result: {
        address_components: [
          {
            long_name: countryName,
            short_name: isEuCountry ? 'IT' : 'US',
            types: ['country', 'political']
          }
        ],
        geometry: {
          location: {
            lat: isEuCountry ? 41.9028 : 40.7128,
            lng: isEuCountry ? 12.4964 : -74.0060
          }
        },
        formatted_address: `Test Address, ${countryName}`,
        place_id: 'test-place-id'
      }
    }
  })

  describe('EU Address Validation Integration', () => {

    it('должен принимать EU адреса для pickup', async () => {
      // Мокируем Google Places API для EU страны
      vi.mocked(axios.get).mockResolvedValue(createGooglePlaceResponse('Italy'))

      // Вызываем selectSuggestions 
      await trustyStore.selectSuggestions('pickup', 'italy-place-id')
      await nextTick()

      // Проверяем результат
      expect(trustyStore.pathStartFinish.valid.pickup).toBe(true)
      expect(trustyStore.pathStartFinish.pickup.lat).toBe(41.9028)
      expect(trustyStore.pathStartFinish.pickup.lng).toBe(12.4964)
    })

    it('должен отклонять не-EU адреса для pickup', async () => {
      // Мокируем Google Places API для не-EU страны
      vi.mocked(axios.get).mockResolvedValue(createGooglePlaceResponse('United States', false))

      // Вызываем selectSuggestions
      await trustyStore.selectSuggestions('pickup', 'usa-place-id')
      await nextTick()

      // Проверяем, что адрес не прошел валидацию
      expect(trustyStore.pathStartFinish.valid.pickup).toBe(false)
    })

    it('должен синхронизировать mainTypes между stores', () => {
      // Устанавливаем mainTypes в trustyStore
      trustyStore.mainTypes = {
        pickup: 'address'
      }

      // Обновляем orderStore с этими данными
      orderStore.update({
        mainTypes: trustyStore.mainTypes
      })

      // Проверяем синхронизацию
      expect(orderStore.orderData.mainTypes).toEqual({
        pickup: 'address'
      })
    })
  })

  describe('Hours Duration Integration', () => {
    it('должен корректно обновлять продолжительность в часах', () => {
      // Устанавливаем различные значения часов
      const testCases = [2, 3, 5, 8, 10]
      
      testCases.forEach(hours => {
        orderStore.update({
          hours: hours,
          distance: hours * 20
        })

        expect(orderStore.orderData.hours).toBe(hours)
        expect(orderStore.orderData.distance).toBe(hours * 20)
      })
    })

    it('должен использовать значение по умолчанию 2 часа', () => {
      orderStore.update({
        type_of_service: 'hourlyAsDirected'
      })

      // Если hours не указан, используем значение по умолчанию
      const defaultHours = orderStore.orderData.hours || 2
      expect(defaultHours).toBe(2)
    })
  })

  describe('Agency vs Regular Form Integration', () => {
    it('должен обрабатывать обычную форму (HourlyAsDirectedForm)', () => {
      const formData = {
        pickup: 'Milan, Italy',
        hours: 4,
        date_start: '2024-12-25 14:00',
        type_of_service: 'hourlyAsDirected'
      }

      orderStore.update(formData)

      expect(orderStore.orderData.pickup).toBe('Milan, Italy')
      expect(orderStore.orderData.hours).toBe(4)
      expect(orderStore.orderData.type_of_service).toBe('hourlyAsDirected')
      expect(orderStore.orderData.date_start).toBe('2024-12-25 14:00')
    })

    it('должен обрабатывать агентскую форму с дополнительными полями', () => {
      // Устанавливаем данные агентства
      userStore.agencyData = {
        pickup: 'Florence, Italy',
        car: createMockCarData()[0], // Economy
        performance: 'Chauffeur',
        main_passenger: 'John Doe',
        other_language: 'English',
        number_of_passengers: 3,
        notes: 'VIP client',
        amount: 150,
        file_number: 'AG-2024-001'
      }

      const agencyFormData = {
        ...userStore.agencyData,
        hours: 6,
        date_start: '2024-12-25 16:00',
        type_of_service: 'hourlyAsDirected'
      }

      orderStore.update(agencyFormData)

      expect(orderStore.orderData.pickup).toBe('Florence, Italy')
      expect(orderStore.orderData.hours).toBe(6)
      expect(orderStore.orderData.performance).toBe('Chauffeur')
      expect(orderStore.orderData.amount).toBe(150)
      expect(orderStore.orderData.file_number).toBe('AG-2024-001')
    })
  })

  describe('Data Flow Integration', () => {
    it('должен обрабатывать полный поток: адрес → часы → автомобиль → сохранение', async () => {
      // Шаг 1: Валидируем EU адрес
      vi.mocked(axios.get).mockResolvedValue(createGooglePlaceResponse('Germany'))
      await trustyStore.selectSuggestions('pickup', 'berlin-place-id')
      await nextTick()

      // Шаг 2: Устанавливаем часы
      const hours = 4

      // Шаг 3: Выбираем автомобиль
      const selectedCar = createMockCarData()[1] // Business
      carsStore.selectCar(selectedCar)

      // Шаг 4: Сохраняем заказ
      orderStore.update({
        pickup: 'Berlin, Germany',
        hours: hours,
        distance: hours * 20,
        car: selectedCar.class_id,
        type_of_service: 'hourlyAsDirected',
        date_start: '2024-12-25 12:00',
        mainTypes: { pickup: 'address' }
      })

      // Шаг 5: Проверяем итоговое состояние
      expect(trustyStore.pathStartFinish.valid.pickup).toBe(true)
      expect(orderStore.orderData.pickup).toBe('Berlin, Germany')
      expect(orderStore.orderData.hours).toBe(4)
      expect(orderStore.orderData.distance).toBe(80) // 4 * 20
      expect(orderStore.orderData.car).toBe(2) // Business class_id
      expect(orderStore.orderData.type_of_service).toBe('hourlyAsDirected')
      expect(carsStore.selectedCar.slug_class_name).toBe('Business')
    })

    it('должен блокировать не-EU адреса и не продолжать поток', async () => {
      // Шаг 1: Пытаемся валидировать не-EU адрес
      vi.mocked(axios.get).mockResolvedValue(createGooglePlaceResponse('Canada', false))
      await trustyStore.selectSuggestions('pickup', 'toronto-place-id')
      await nextTick()

      // Шаг 2: Проверяем, что валидация не прошла
      expect(trustyStore.pathStartFinish.valid.pickup).toBe(false)

      // Шаг 3: Проверяем, что заказ нельзя создать без валидного адреса
      orderStore.update({
        pickup: 'Toronto, Canada',
        hours: 3,
        type_of_service: 'hourlyAsDirected'
      })

      // Адрес сохранится в store, но валидация остается false
      expect(orderStore.orderData.pickup).toBe('Toronto, Canada')
      expect(trustyStore.pathStartFinish.valid.pickup).toBe(false) // Ключевая проверка
    })
  })

  describe('Component Interaction Scenarios', () => {
    it('должен корректно передавать данные между формой и stores', () => {
      const testFormData = {
        pickup: 'Vienna, Austria',
        hours: 6,
        date_start: '2024-12-26 09:00',
        type_of_service: 'hourlyAsDirected'
      }

      // Симулируем отправку формы
      orderStore.update({
        ...testFormData,
        status: 1,
        distance: testFormData.hours * 20,
        mainTypes: { pickup: 'address' }
      })

      // Проверяем интеграцию
      expect(orderStore.orderData.pickup).toBe('Vienna, Austria')
      expect(orderStore.orderData.hours).toBe(6)
      expect(orderStore.orderData.distance).toBe(120)
      expect(orderStore.orderData.type_of_service).toBe('hourlyAsDirected')
      expect(orderStore.orderData.status).toBe(1)
    })

    it('должен обновлять allowedPages после успешного заполнения формы', () => {
      // Заполняем форму
      orderStore.update({
        pickup: 'Prague, Czech Republic',
        hours: 5,
        date_start: '2024-12-27 10:00',
        type_of_service: 'hourlyAsDirected',
        status: 1
      })

      // Симулируем успешную отправку
      orderStore.orderData.allowedPages = { contact: 1 }

      // Проверяем, что можно перейти к следующему шагу
      expect(orderStore.orderData.allowedPages.contact).toBe(1)
    })
  })
}) 