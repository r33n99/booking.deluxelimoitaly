import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { CarSummary } from '@/types/stores/ride/cars'

const STORE_NAME = 'cars'
const LOCALSTORAGE_KEY = 'cars'
const SELECTED_CAR_KEY = 'selectedCar'

const parseStorageItem = <T>(value: string | null, fallback: T): T => {
  if (!value) {
    return fallback
  }

  try {
    return (JSON.parse(value) as T) || fallback
  } catch (error) {
    console.error(`Failed to parse storage item`, error)
    return fallback
  }
}

export const useCarsStore = defineStore(STORE_NAME, () => {
  const defaultCars: CarSummary[] | null = null
  const cars = ref<CarSummary[] | null>(defaultCars)
  const selectedCar = ref<CarSummary | null | 0>(null)

  const update = (data: CarSummary[] | null): void => {
    cars.value = data
    if (data) {
      sessionStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(data))
    } else {
      sessionStorage.removeItem(LOCALSTORAGE_KEY)
    }
  }

  const selectCar = (car: CarSummary | null, { useResetSentinel = false } = {}): void => {
    selectedCar.value = car

    if (car) {
      sessionStorage.setItem(SELECTED_CAR_KEY, JSON.stringify(car))
      return
    }

    selectedCar.value = useResetSentinel ? 0 : null
    sessionStorage.removeItem(SELECTED_CAR_KEY)
  }

  const $reset = (): void => {
    cars.value = defaultCars
    selectCar(null, { useResetSentinel: true })
    sessionStorage.removeItem(LOCALSTORAGE_KEY)
    sessionStorage.removeItem(SELECTED_CAR_KEY)
  }

  const loadDefaultValue = (): void => {
    const storedCars = sessionStorage.getItem(LOCALSTORAGE_KEY)
    const storedSelectedCar = sessionStorage.getItem(SELECTED_CAR_KEY)

    update(parseStorageItem<CarSummary[] | null>(storedCars, defaultCars))

    if (storedSelectedCar) {
      const parsed = parseStorageItem<CarSummary | null>(storedSelectedCar, null)
      if (parsed) {
        selectCar(parsed)
        return
      }
    }

    selectCar(null)
  }

  loadDefaultValue()

  return {
    cars,
    selectedCar,
    update,
    selectCar,
    $reset
  }
})
