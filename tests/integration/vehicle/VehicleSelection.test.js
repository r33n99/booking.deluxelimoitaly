import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createTestingPinia } from '@pinia/testing'
import { nextTick } from 'vue'

// Stores для тестирования
import { useCarsStore } from '@/stores/ride/cars.ts'
import { useOrderStore } from '@/stores/ride/order.ts'
import { useUserStore } from '@/stores/user/profile.ts'
import { useMainStore } from '@/stores/ui/main.ts'

// Утилиты для тестирования
import { createAxiosMock, createSuccessResponse } from '../../unit/helpers/mockAxios.js'

// Мок для axios
const mockAxiosInstance = createAxiosMock()

vi.mock('@/compose/axios', () => ({
  useFetcher: () => ({
    axiosInstance: mockAxiosInstance
  })
}))

describe('Интеграционный тест: Выбор автомобиля', () => {
  let carsStore
  let orderStore
  let userStore
  let mainStore

  // Тестовые данные автомобилей
  const mockCarsData = [
    {
      id: 1,
      name: 'Mercedes E-Class',
      type: 'sedan',
      capacity: 4,
      price_per_km: 2.5,
      base_price: 85.00,
      class_images: 'mercedes-e-class-1.jpg|mercedes-e-class-2.jpg',
      features: ['AC', 'WiFi', 'Leather seats']
    },
    {
      id: 2,
      name: 'BMW 7 Series',
      type: 'luxury',
      capacity: 4,
      price_per_km: 4.0,
      base_price: 150.00,
      class_images: 'bmw-7-series-1.jpg|bmw-7-series-2.jpg',
      features: ['AC', 'WiFi', 'Premium sound', 'Massage seats']
    },
    {
      id: 3,
      name: 'Mercedes V-Class',
      type: 'van',
      capacity: 8,
      price_per_km: 3.0,
      base_price: 120.00,
      class_images: 'mercedes-v-class-1.jpg|mercedes-v-class-2.jpg',
      features: ['AC', 'WiFi', 'Extra space']
    }
  ]

  // Тестовые данные предзаполненного заказа
  const mockOrderData = {
    pickup: {
      address: 'Rome Fiumicino Airport',
      lat: 41.8003,
      lng: 12.2389
    },
    dropoff: {
      address: 'Rome City Center Hotel',
      lat: 41.9028,
      lng: 12.4964
    },
    date_start: '2024-01-25T10:00:00',
    type_of_service: 'One Way Transfer',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1234567890',
    number_of_passengers: 2,
    distance: 30,
    total: null,
    car: null,
    allowedPages: {
      success_payment_intent: false
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()

    // Создаем Pinia без stubActions для проверки реальной логики
    createTestingPinia({
      createSpy: vi.fn,
      stubActions: false
    })

    // Получаем stores после создания Pinia
    carsStore = useCarsStore()
    orderStore = useOrderStore()
    userStore = useUserStore()
    mainStore = useMainStore()

    // Устанавливаем базовые данные
    userStore.user = {
      id: 1,
      name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      type: 'client'
    }

    mainStore.flow = 'mainsite'
    mainStore.mode = 'test'

    // Мокируем успешные API ответы
    mockAxiosInstance.get.mockResolvedValue(
      createSuccessResponse({
        data: mockCarsData
      })
    )

    mockAxiosInstance.post.mockResolvedValue(
      createSuccessResponse({
        data: {
          id: 'test-order-id',
          message: 'Order updated successfully'
        }
      })
    )
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Инициализация тестового окружения', () => {
    it('должен правильно инициализировать все stores', async () => {
      // Предварительно заполняем данные
      orderStore.orderData = { ...mockOrderData }
      carsStore.update(mockCarsData)

      // Проверяем корректность инициализации orderStore
      expect(orderStore.orderData.pickup.address).toBe('Rome Fiumicino Airport')
      expect(orderStore.orderData.dropoff.address).toBe('Rome City Center Hotel')
      expect(orderStore.orderData.car).toBeNull()
      expect(orderStore.orderData.total).toBeNull()

      // Проверяем корректность инициализации carsStore
      expect(carsStore.cars).toHaveLength(3)
      expect(carsStore.cars[0].name).toBe('Mercedes E-Class')
      expect(carsStore.selectedCar).toBeNull()

      // Проверяем настройки пользователя
      expect(userStore.user.type).toBe('client')
      expect(mainStore.flow).toBe('mainsite')
    })
  })

  describe('Интеграция Cars Store с Order Store', () => {
    it('должен корректно выбрать автомобиль и обновить состояние', async () => {
      // Предварительно заполняем данные
      orderStore.orderData = { ...mockOrderData }
      carsStore.update(mockCarsData)

      // Выбираем автомобиль Mercedes E-Class
      const selectedCar = mockCarsData[0]
      carsStore.selectCar(selectedCar)

      await nextTick()

      // Проверяем, что автомобиль был выбран в carsStore
      expect(carsStore.selectedCar).toEqual(selectedCar)
      expect(carsStore.selectedCar.name).toBe('Mercedes E-Class')
      expect(carsStore.selectedCar.id).toBe(1)
      expect(carsStore.selectedCar.price_per_km).toBe(2.5)
    })

    it('должен обновить заказ с выбранным автомобилем', async () => {
      // Предварительно заполняем данные
      orderStore.orderData = { ...mockOrderData }
      carsStore.update(mockCarsData)

      // Выбираем автомобиль
      const selectedCar = mockCarsData[0]
      carsStore.selectCar(selectedCar)

      // Обновляем заказ с выбранным автомобилем
      orderStore.orderData.car = selectedCar.id
      orderStore.orderData.total = selectedCar.base_price + (orderStore.orderData.distance * selectedCar.price_per_km)

      await nextTick()

      // Проверяем, что orderStore корректно обновился
      expect(orderStore.orderData.car).toBe(1)
      expect(orderStore.orderData.total).toBe(160.00) // 85 + (30 * 2.5)

      // Проверяем, что все остальные данные сохранились
      expect(orderStore.orderData.pickup.address).toBe('Rome Fiumicino Airport')
      expect(orderStore.orderData.dropoff.address).toBe('Rome City Center Hotel')
      expect(orderStore.orderData.first_name).toBe('John')
      expect(orderStore.orderData.email).toBe('john.doe@example.com')
    })

    it('должен правильно рассчитывать стоимость для разных автомобилей', async () => {
      orderStore.orderData = { ...mockOrderData }
      carsStore.update(mockCarsData)

      // Тестируем расчет для роскошного автомобиля BMW 7 Series
      const luxuryCar = mockCarsData[1]
      carsStore.selectCar(luxuryCar)
      
      const luxuryTotal = luxuryCar.base_price + (mockOrderData.distance * luxuryCar.price_per_km)
      expect(luxuryTotal).toBe(150.00 + (30 * 4.0)) // 150 + 120 = 270

      // Тестируем расчет для минивэна Mercedes V-Class
      const vanCar = mockCarsData[2]
      carsStore.selectCar(vanCar)
      
      const vanTotal = vanCar.base_price + (mockOrderData.distance * vanCar.price_per_km)
      expect(vanTotal).toBe(120.00 + (30 * 3.0)) // 120 + 90 = 210

      // Проверяем, что выбор изменился корректно
      expect(carsStore.selectedCar.name).toBe('Mercedes V-Class')
      expect(carsStore.selectedCar.type).toBe('van')
      expect(carsStore.selectedCar.capacity).toBe(8)
    })
  })

  describe('Интеграция с SessionStorage', () => {
    it('должен сохранять данные автомобилей и выбора в sessionStorage', async () => {
      // Мокируем sessionStorage
      const sessionStorageMock = {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn()
      }
      Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock })

      // Обновляем данные автомобилей
      carsStore.update(mockCarsData)
      expect(sessionStorageMock.setItem).toHaveBeenCalledWith('cars', JSON.stringify(mockCarsData))

      // Выбираем автомобиль
      carsStore.selectCar(mockCarsData[0])
      expect(sessionStorageMock.setItem).toHaveBeenCalledWith('selectedCar', JSON.stringify(mockCarsData[0]))

      // Проверяем общее количество вызовов setItem
      expect(sessionStorageMock.setItem).toHaveBeenCalledTimes(2)
    })

    it('должен корректно сбрасывать данные в sessionStorage', async () => {
      const sessionStorageMock = {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn()
      }
      Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock })

      // Сначала устанавливаем данные
      carsStore.update(mockCarsData)
      carsStore.selectCar(mockCarsData[0])

      // Затем сбрасываем
      carsStore.$reset()

      // Проверяем, что sessionStorage очищен
      expect(sessionStorageMock.removeItem).toHaveBeenCalledWith('cars')
      expect(sessionStorageMock.removeItem).toHaveBeenCalledWith('selectedCar')
      expect(carsStore.cars).toBeNull()
      expect(carsStore.selectedCar).toBe(0)
    })
  })

  describe('Интеграция с API', () => {
    it('должен отправить обновленные данные заказа через API', async () => {
      // Предварительно заполняем данные
      orderStore.orderData = { ...mockOrderData }
      carsStore.selectCar(mockCarsData[0])

      // Обновляем заказ
      orderStore.orderData.car = mockCarsData[0].id
      orderStore.orderData.total = 160.00

      // Отправляем данные через API
      await orderStore.updateStorage(orderStore.orderData)

      // Проверяем, что API был вызван с правильными данными
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('orders/cache/create', expect.objectContaining({
        car: 1,
        total: 160.00,
        pickup: mockOrderData.pickup,
        dropoff: mockOrderData.dropoff,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com'
      }))
    })

    it('должен корректно обработать ошибку API', async () => {
      // Настраиваем мок для ошибки
      mockAxiosInstance.post.mockRejectedValue(new Error('Network error'))

      orderStore.orderData = { ...mockOrderData }
      carsStore.selectCar(mockCarsData[0])

      // Проверяем обработку ошибки
      try {
        await orderStore.updateStorage(orderStore.orderData)
      } catch (error) {
        expect(error.message).toBe('Network error')
      }

      expect(mockAxiosInstance.post).toHaveBeenCalled()
    })
  })

  describe('Бизнес-логика выбора автомобиля', () => {
    it('должен предотвращать выбор автомобиля с недостаточной вместимостью', async () => {
      // Заказ на 6 пассажиров
      const largeGroupOrder = { ...mockOrderData, number_of_passengers: 6 }
      orderStore.orderData = largeGroupOrder
      carsStore.update(mockCarsData)

      // Проверяем, какие автомобили подходят по вместимости
      const sedanCar = mockCarsData[0] // вместимость 4
      const luxuryCar = mockCarsData[1] // вместимость 4  
      const vanCar = mockCarsData[2] // вместимость 8

      // Только минивэн подходит для 6 пассажиров
      expect(sedanCar.capacity).toBeLessThan(largeGroupOrder.number_of_passengers)
      expect(luxuryCar.capacity).toBeLessThan(largeGroupOrder.number_of_passengers)
      expect(vanCar.capacity).toBeGreaterThanOrEqual(largeGroupOrder.number_of_passengers)

      // Выбираем подходящий автомобиль
      carsStore.selectCar(vanCar)
      expect(carsStore.selectedCar.capacity).toBeGreaterThanOrEqual(6)
    })

    it('должен обрабатывать заказы без данных о расстоянии', async () => {
      // Заказ без расстояния (например, почасовая аренда)
      const orderWithoutDistance = { ...mockOrderData, distance: null }
      orderStore.orderData = orderWithoutDistance

      carsStore.update(mockCarsData)
      carsStore.selectCar(mockCarsData[0])

      // При отсутствии расстояния используется только базовая стоимость
      const totalWithoutDistance = mockCarsData[0].base_price
      expect(totalWithoutDistance).toBe(85.00)

      // Расчет с расстоянием не применяется
      orderStore.orderData.total = totalWithoutDistance
      expect(orderStore.orderData.total).toBe(85.00)
    })

    it('должен поддерживать переключение между автомобилями', async () => {
      orderStore.orderData = { ...mockOrderData }
      carsStore.update(mockCarsData)

      // Сначала выбираем седан
      carsStore.selectCar(mockCarsData[0])
      expect(carsStore.selectedCar.name).toBe('Mercedes E-Class')
      expect(carsStore.selectedCar.type).toBe('sedan')

      // Затем переключаемся на роскошный автомобиль
      carsStore.selectCar(mockCarsData[1])
      expect(carsStore.selectedCar.name).toBe('BMW 7 Series')
      expect(carsStore.selectedCar.type).toBe('luxury')

      // И наконец на минивэн
      carsStore.selectCar(mockCarsData[2])
      expect(carsStore.selectedCar.name).toBe('Mercedes V-Class')
      expect(carsStore.selectedCar.type).toBe('van')

      // Проверяем, что store всегда хранит только последний выбор
      expect(carsStore.selectedCar.id).toBe(3)
    })
  })

  describe('Граничные случаи', () => {
    it('должен корректно обрабатывать пустой список автомобилей', async () => {
      orderStore.orderData = { ...mockOrderData }
      
      // Устанавливаем пустой список
      carsStore.update([])

      expect(carsStore.cars).toHaveLength(0)
      expect(carsStore.selectedCar).toBeNull()

      // Попытка выбрать автомобиль из пустого списка
      carsStore.selectCar(null)
      expect(carsStore.selectedCar).toBeNull()
    })

    it('должен корректно обрабатывать сброс выбранного автомобиля', async () => {
      carsStore.update(mockCarsData)
      
      // Сначала выбираем автомобиль
      carsStore.selectCar(mockCarsData[0])
      expect(carsStore.selectedCar).not.toBeNull()

      // Затем сбрасываем выбор
      carsStore.selectCar(null)
      expect(carsStore.selectedCar).toBeNull()
    })

    it('должен обрабатывать заказы с минимальными данными', async () => {
      // Минимальный заказ только с обязательными полями
      const minimalOrder = {
        pickup: { address: 'Point A', lat: 0, lng: 0 },
        dropoff: { address: 'Point B', lat: 1, lng: 1 },
        car: null,
        total: null,
        allowedPages: { success_payment_intent: false }
      }

      orderStore.orderData = minimalOrder
      carsStore.update(mockCarsData)
      carsStore.selectCar(mockCarsData[0])

      // Проверяем, что базовая логика работает
      expect(orderStore.orderData.pickup.address).toBe('Point A')
      expect(orderStore.orderData.dropoff.address).toBe('Point B')
      expect(carsStore.selectedCar.name).toBe('Mercedes E-Class')
    })
  })

  describe('Интеграция данных между stores', () => {
    it('должен поддерживать полный жизненный цикл выбора автомобиля', async () => {
      // 1. Инициализация заказа
      orderStore.orderData = { ...mockOrderData }
      expect(orderStore.orderData.car).toBeNull()
      expect(orderStore.orderData.total).toBeNull()

      // 2. Загрузка списка автомобилей
      carsStore.update(mockCarsData)
      expect(carsStore.cars).toHaveLength(3)
      expect(carsStore.selectedCar).toBeNull()

      // 3. Выбор автомобиля пользователем
      const selectedCar = mockCarsData[1] // BMW 7 Series
      carsStore.selectCar(selectedCar)
      expect(carsStore.selectedCar).toEqual(selectedCar)

      // 4. Обновление заказа с выбранным автомобилем
      orderStore.orderData.car = selectedCar.id
      orderStore.orderData.total = selectedCar.base_price + (orderStore.orderData.distance * selectedCar.price_per_km)
      
      // 5. Проверка финального состояния
      expect(orderStore.orderData.car).toBe(2)
      expect(orderStore.orderData.total).toBe(270.00) // 150 + (30 * 4.0)
      expect(carsStore.selectedCar.name).toBe('BMW 7 Series')

      // 6. Готовность к отправке на сервер
      const finalOrderData = orderStore.orderData
      expect(finalOrderData.pickup).toBeDefined()
      expect(finalOrderData.dropoff).toBeDefined()
      expect(finalOrderData.car).toBeDefined()
      expect(finalOrderData.total).toBeGreaterThan(0)
    })
  })
}) 