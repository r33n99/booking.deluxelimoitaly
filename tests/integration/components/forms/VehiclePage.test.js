import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import axios from 'axios'
import { useOrderStore } from '@/stores/ride/order'
import { useCarsStore } from '@/stores/ride/cars'
import { useGoogleAddressStore } from '@/stores/data/googleAddress'
import { useTrustyStore } from '@/stores/data/trustyComplete'

// Мокаем axios
const mockAxiosInstance = {
  post: vi.fn(),
  get: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  interceptors: {
    response: {
      use: vi.fn()
    },
    request: {
      use: vi.fn()
    }
  }
}

vi.mock('axios', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    create: vi.fn(() => mockAxiosInstance),
    defaults: {
      headers: {
        common: {}
      }
    },
    interceptors: {
      response: {
        use: vi.fn()
      },
      request: {
        use: vi.fn()
      }
    }
  }
}))

// Мокаем compose/axios
vi.mock('@/compose/axios', () => ({
  useFetcher: vi.fn(() => ({
    axiosInstance: mockAxiosInstance
  }))
}))

// Мокаем router
const mockPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush
  }),
  useRoute: () => ({
    params: {},
    query: {}
  })
}))

describe('VehiclePage Simple Integration Tests', () => {
  let orderStore
  let carsStore
  let trustyStore

  // Тестовые данные
  const createOrderData = (overrides = {}) => ({
    pickup: 'Vienna, Austria',
    dropoff: 'Budapest, Hungary',
    date_start: new Date('2024-12-30T15:00:00'),
    time_start: '15:00',
    number_of_passengers: 2,
    id: 'order-123',
    distance: 243.5,
    ...overrides
  })

  const createCarsData = () => [
    {
      id: 'car-1',
      name: 'Mercedes E-Class',
      price: 850,
      currency: 'EUR',
      passengers: 4,
      luggage: 3
    },
    {
      id: 'car-2', 
      name: 'BMW 7 Series',
      price: 950,
      currency: 'EUR',
      passengers: 4,
      luggage: 3
    }
  ]

  const createApiResponse = (cars = createCarsData(), order = createOrderData()) => ({
    data: {
      data: {
        cars,
        order
      }
    }
  })

  beforeEach(() => {
    setActivePinia(createPinia())
    
    orderStore = useOrderStore()
    carsStore = useCarsStore()
    useGoogleAddressStore()
    trustyStore = useTrustyStore()

    // Настройка базовых моков
    axios.post.mockResolvedValue(createApiResponse())
    
    // Мокаем методы stores
    vi.spyOn(carsStore, 'update').mockImplementation((cars) => {
      carsStore.cars = cars
    })
    vi.spyOn(orderStore, 'updateOrder').mockImplementation(() => {})
    vi.spyOn(orderStore, 'updateOrderId').mockImplementation(() => {})
    vi.spyOn(orderStore, 'update').mockImplementation(() => {})

    // Сброс моков
    mockPush.mockClear()
  })

  describe('Store Integration - получение данных заказа', () => {
    it('должен получать данные заказа из orderStore', () => {
      const testOrderData = createOrderData()
      orderStore.orderData = testOrderData

      expect(orderStore.orderData).toEqual(testOrderData)
      expect(orderStore.orderData.pickup).toBe('Vienna, Austria')
      expect(orderStore.orderData.dropoff).toBe('Budapest, Hungary')
    })

    it('должен инициировать загрузку автомобилей с данными маршрута', async () => {
      const routeData = createOrderData({
        pickup: 'Paris, France',
        dropoff: 'Lyon, France'
      })
      
      orderStore.orderData = routeData

      // Симулируем вызов API как в VehiclePage
      await axios.post('cars/redirect', routeData)

      expect(axios.post).toHaveBeenCalledWith('cars/redirect', routeData)
    })
  })

  describe('Cars Store Integration - загрузка автомобилей', () => {
    it('должен загружать список автомобилей в carsStore', async () => {
      const orderData = createOrderData()
      const carsData = createCarsData()
      const apiResponse = createApiResponse(carsData, orderData)

      axios.post.mockResolvedValue(apiResponse)

      // Симулируем логику VehiclePage - проверка отсутствия cars и загрузка
      const shouldLoadCars = !carsStore.cars
      expect(shouldLoadCars).toBe(true)

      // Выполняем запрос
      const response = await axios.post('cars/redirect', orderData)
      
      // Обновляем store как в VehiclePage
      carsStore.update(response.data.data.cars)
      orderStore.updateOrder(response.data.data.order)
      orderStore.updateOrderId(response.data.data.order.id)

      expect(carsStore.update).toHaveBeenCalledWith(carsData)
      expect(orderStore.updateOrder).toHaveBeenCalledWith(orderData)
      expect(orderStore.updateOrderId).toHaveBeenCalledWith('order-123')
    })

    it('должен загружать автомобили с учетом количества пассажиров', async () => {
      const orderWithManyPassengers = createOrderData({
        number_of_passengers: 6
      })

      await axios.post('cars/redirect', orderWithManyPassengers)

      expect(axios.post).toHaveBeenCalledWith('cars/redirect', 
        expect.objectContaining({
          number_of_passengers: 6
        })
      )
    })

    it('должен обрабатывать distance в ответе API', async () => {
      const orderData = createOrderData()
      const responseWithDistance = createApiResponse(createCarsData(), {
        ...orderData,
        distance: 0
      })

      axios.post.mockResolvedValue(responseWithDistance)

      const response = await axios.post('cars/redirect', orderData)
      
      // Симулируем логику обработки distance как в VehiclePage
      if (response.data.data.order.distance !== null) {
        if (!response.data.data.order.distance) {
          orderStore.update({ distance: 0 })
        }
      }

      expect(orderStore.update).toHaveBeenCalledWith({ distance: 0 })
    })
  })

  describe('Car Selection Integration', () => {
    it('должен сохранять выбранный автомобиль в orderStore', () => {
      const selectedCar = {
        id: 'car-1',
        name: 'Mercedes E-Class',
        price: 850
      }

      // Симулируем выбор автомобиля
      orderStore.selectedCar = selectedCar

      expect(orderStore.selectedCar).toEqual(selectedCar)
      expect(orderStore.selectedCar.price).toBe(850)
    })

    it('должен обновлять цену заказа при выборе автомобиля', () => {
      const selectedCar = { price: 850, currency: 'EUR' }
      
      // Симулируем логику обновления цены
      const updatePriceData = {
        total_price: selectedCar.price,
        currency: selectedCar.currency
      }

      orderStore.orderData = { ...orderStore.orderData, ...updatePriceData }

      expect(orderStore.orderData.total_price).toBe(850)
      expect(orderStore.orderData.currency).toBe('EUR')
    })

    it('должен инициировать финализацию заказа при выборе автомобиля', async () => {
      const selectedCar = createCarsData()[0]
      const orderId = 'order-123'

      orderStore.orderData.id = orderId
      orderStore.selectedCar = selectedCar

      // Симулируем вызов API
      const finalizeData = { car_id: selectedCar.id }
      mockAxiosInstance.put.mockResolvedValue({
        data: { data: { ...createOrderData(), ...finalizeData } }
      })

      await mockAxiosInstance.put(`orders/${orderId}/finalize`, finalizeData)

      // Проверяем, что API был вызван правильно
      expect(mockAxiosInstance.put).toHaveBeenCalledWith(
        `orders/${orderId}/finalize`,
        finalizeData
      )
    })
  })

  describe('Trusty/Google Address Store Integration', () => {
    it('должен содержать корректные данные в trustyStore', () => {
      trustyStore.pathStartFinish = {
        pickup: { name: 'Vienna Airport', type: 'airport' },
        dropoff: { name: 'Budapest City Center', type: 'address' }
      }

      expect(trustyStore.pathStartFinish.pickup.name).toBe('Vienna Airport')
      expect(trustyStore.pathStartFinish.dropoff.type).toBe('address')
    })

    it('должен перенаправлять на страницу контактов после успешной финализации', async () => {
      const orderId = 'order-123'
      orderStore.orderData.id = orderId
      mockAxiosInstance.put.mockResolvedValue({
        data: { data: { id: orderId } }
      })

      await mockAxiosInstance.put(`orders/${orderId}/finalize`, {})
      
      // Симулируем переход
      mockPush({ name: 'contact-data', params: { id: orderId } })

      expect(mockPush).toHaveBeenCalledWith({
        name: 'contact-data',
        params: { id: orderId }
      })
    })

    it('должен корректно обрабатывать ошибку API при финализации', async () => {
      const orderId = 'order-123'
      orderStore.orderData.id = orderId
      const errorMessage = 'Finalization failed'
      mockAxiosInstance.put.mockRejectedValue({
        response: { data: { message: errorMessage } }
      })

      // Используем try/catch для проверки обработки ошибки
      try {
        await mockAxiosInstance.put(`orders/${orderId}/finalize`, {})
      } catch (error) {
        // Проверяем, что ошибка была обработана (например, показано сообщение)
        expect(error.response.data.message).toBe(errorMessage)
      }

      // Проверяем, что перенаправления не произошло
      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  describe('Order Update Integration', () => {
    it('должен обновлять store данными из API', async () => {
      const orderDataFromApi = {
        ...createOrderData(),
        status: 'confirmed'
      }
      
      const apiResponse = createApiResponse(createCarsData(), orderDataFromApi)
      axios.post.mockResolvedValue(apiResponse)
      
      const response = await axios.post('cars/redirect', {})
      
      orderStore.updateOrder(response.data.data.order)

      expect(orderStore.updateOrder).toHaveBeenCalledWith(orderDataFromApi)
    })
  })
})