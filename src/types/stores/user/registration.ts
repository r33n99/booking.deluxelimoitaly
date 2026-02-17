import type { Ref } from 'vue'

export interface RegistrationData {
  first_name: string | null
  last_name: string | null
  email: string | null
  country_prefix: string | null
  code: string
  phone: string
}

export interface RegistrationStoreState {
  regStep: Ref<number>
  defaultData: Ref<RegistrationData>
  hash: Ref<string | null>
}

export interface RegistrationStoreActions {
  setHash(value: string | null): void
  resetHash(): void
  updateData(data: Partial<RegistrationData>): void
  handleChangeStep(step: number): void
  handleCheckStep(toStep: number): void
  resetStep(): void
}
