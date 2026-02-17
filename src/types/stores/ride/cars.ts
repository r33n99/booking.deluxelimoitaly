import type { Ref } from 'vue'

export interface CarSummary {
  id: string | number
  name: string
  description?: string
  class_images?: Array<{
    original: string
    webp: string
  }>
  slug_class_name?: string
  max_passengers?: number
  max_luggage?: number
  max_hand_luggage?: number
  [key: string]: unknown
}

export interface CarsStoreState {
  cars: Ref<CarSummary[] | null>
  selectedCar: Ref<CarSummary | null>
}

export interface CarsStoreActions {
  update(data: CarSummary[] | null): void
  selectCar(car: CarSummary | null): void
  $reset(): void
}
