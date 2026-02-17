import type { OrderData } from '@/types/stores/ride/order'
import type {
  Appearance,
  Stripe,
  StripeConstructorOptions,
  StripeElements,
  StripeElementsOptions,
  StripePaymentElement,
  StripePaymentElementChangeEvent
} from '@stripe/stripe-js'

export type PaymentMode = 'light' | 'dark'

declare global {
  // Stripe.js injects a global factory function
  const Stripe: StripeConstructor
}

export interface StripeConstructor {
  (key: string, options?: StripeConstructorOptions): Stripe
}

export interface StoragePlugin {
  getKeys(keys: string[]): Record<string, string | null> | Error
  fillOutKeys<T extends Record<string, unknown>>(data: T): T
  getItem(key: string): string | null
  setItem(key: string, value: string | Date, storageType?: string): void
  removeItem(key: string): void
}

export interface PaymentIntentData {
  client_secret: string
}

export interface PaymentCar {
  class_id: string | number
  [key: string]: unknown
}

export type TransactionOrder = Partial<OrderData> & {
  id?: string | number | null
  payment_timer?: string | null
  priceChanged?: boolean
  [key: string]: unknown
}

export interface TransactionInitData {
  payment: PaymentIntentData
  order: TransactionOrder
  cars?: PaymentCar[]
  type?: string | null
}

export interface TransactionInitResponse {
  status: 'success' | 'error'
  data?: TransactionInitData
}

export interface StripeResources {
  stripe: Stripe
  elements: StripeElements
  paymentElement: StripePaymentElement
}

export type StripeAppearanceMap = Record<PaymentMode, Appearance>
export type StripeElementsOptionsWithAppearance = StripeElementsOptions & { appearance: Appearance }
export type PaymentElementChangeHandler = (event: StripePaymentElementChangeEvent) => void
