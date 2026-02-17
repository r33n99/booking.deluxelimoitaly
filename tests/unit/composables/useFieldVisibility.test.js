import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { useFieldVisibility } from '@/components/features/summary/composables/useFieldVisibility'
import { useOrderStore } from '@/stores/ride/order'

// Мокаем зависимости
vi.mock('vue-router')
vi.mock('@/stores/ride/order')

describe('useFieldVisibility', () => {
  let mockRoute
  let mockOrderStore
  let mockOrderData

  beforeEach(async () => {
    setActivePinia(createPinia())
    
    mockOrderData = ref({
      pickup: 'Test pickup',
      dropoff: 'Test dropoff',
      date_start: '2024-01-01',
      hours: 2,
      reqs: 'Test requirements',
      distance: '10km',
      duration: '30min',
      car: 'Test car',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      phone: '+1234567890'
    })

    mockRoute = {
      name: 'serviceData'
    }

    mockOrderStore = {
      orderData: mockOrderData
    }

    // Мокаем vue-router
    vi.mocked(await import('vue-router')).useRoute = vi.fn(() => mockRoute)
    
    // Мокаем store
    vi.mocked(useOrderStore).mockReturnValue(mockOrderStore)
  })

  it('должен правильно инициализироваться', () => {
    const { checkField, preparedFields, sourceFields } = useFieldVisibility()

    expect(preparedFields).toBeDefined()
    expect(sourceFields).toBeDefined()
    expect(checkField).toBeInstanceOf(Function)
  })

  it('должен возвращать правильные поля для каждой страницы', () => {
    const { preparedFields } = useFieldVisibility()

    expect(preparedFields.serviceData).toEqual([
      'pickup', 'dropoff', 'date_start', 'hours', 'reqs', 'distance', 'duration', 'car'
    ])
    expect(preparedFields.contactData).toEqual([
      'first_name', 'last_name', 'email', 'phone'
    ])
    expect(preparedFields.contact).toEqual([
      'pickup', 'dropoff', 'date_start', 'hours', 'reqs', 'car'
    ])
    expect(preparedFields.vehicle).toEqual([
      'pickup', 'dropoff', 'date_start', 'hours', 'reqs', 'distance', 'duration'
    ])
    expect(preparedFields.payment).toEqual([
      'pickup', 'dropoff', 'date_start', 'hours', 'reqs', 'distance', 'duration', 'car'
    ])
  })

  it('должен использовать имя маршрута как источник полей по умолчанию', () => {
    mockRoute.name = 'contactData'
    const { sourceFields } = useFieldVisibility()

    expect(sourceFields.value).toBe('contactData')
  })

  it('должен использовать переданный prepare параметр', () => {
    const prepareParam = ref('vehicle')
    const { sourceFields } = useFieldVisibility(prepareParam)

    expect(sourceFields.value).toBe('vehicle')
  })

  describe('checkField', () => {
    it('должен возвращать true для существующих полей с данными', () => {
      mockRoute.name = 'serviceData'
      const { checkField } = useFieldVisibility()

      expect(checkField('pickup')).toBe(true)
      expect(checkField('dropoff')).toBe(true)
      expect(checkField('hours')).toBe(true)
      expect(checkField('car')).toBe(true)
    })

    it('должен возвращать false для полей не в списке страницы', () => {
      mockRoute.name = 'contactData'
      const { checkField } = useFieldVisibility()

      expect(checkField('pickup')).toBe(false)
      expect(checkField('car')).toBe(false)
    })

    it('должен возвращать false для полей с null значениями', () => {
      mockOrderData.value.pickup = null
      mockRoute.name = 'serviceData'
      const { checkField } = useFieldVisibility()

      expect(checkField('pickup')).toBe(false)
    })

    it('должен возвращать false для пустого поля reqs', () => {
      mockOrderData.value.reqs = ''
      mockRoute.name = 'serviceData'
      const { checkField } = useFieldVisibility()

      expect(checkField('reqs')).toBe(false)
    })

    it('должен возвращать true для непустого поля reqs', () => {
      mockOrderData.value.reqs = 'Some requirements'
      mockRoute.name = 'serviceData'
      const { checkField } = useFieldVisibility()

      expect(checkField('reqs')).toBe(true)
    })

    it('должен правильно работать с разными типами полей', () => {
      mockRoute.name = 'contactData'
      const { checkField } = useFieldVisibility()

      expect(checkField('first_name')).toBe(true)
      expect(checkField('last_name')).toBe(true)
      expect(checkField('email')).toBe(true)
      expect(checkField('phone')).toBe(true)
    })

    it('должен обрабатывать числовые значения', () => {
      mockOrderData.value.hours = 0
      mockRoute.name = 'serviceData'
      const { checkField } = useFieldVisibility()

      expect(checkField('hours')).toBe(true) // 0 не считается null
    })

    it('должен работать с переданным prepare параметром', () => {
      const prepareParam = ref('payment')
      mockOrderData.value.distance = '15km'
      const { checkField } = useFieldVisibility(prepareParam)

      expect(checkField('distance')).toBe(true)
      expect(checkField('first_name')).toBe(false) // не в списке payment
    })
  })

  describe('edge cases', () => {
    it('должен обрабатывать undefined orderData', () => {
      mockOrderData.value = {}
      mockRoute.name = 'serviceData'
      const { checkField } = useFieldVisibility()

      expect(checkField('pickup')).toBe(false)
    })

    it('должен обрабатывать несуществующую страницу', () => {
      mockRoute.name = 'nonexistentPage'
      const { checkField } = useFieldVisibility()

      expect(checkField('pickup')).toBe(false)
    })

    it('должен обрабатывать пустой prepare параметр', () => {
      const prepareParam = ref(null)
      mockRoute.name = 'serviceData'
      const { sourceFields } = useFieldVisibility(prepareParam)

      expect(sourceFields.value).toBe('serviceData') // fallback к route.name
    })
  })
}) 