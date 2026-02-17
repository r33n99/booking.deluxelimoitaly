export type LuggageType = 'large' | 'small'

export interface PickupDropoffText {
  title: string
  visibleText: boolean
}

export interface LuggageCounter {
  current: number
  max: number
}

export type LuggageCounters = Record<LuggageType, LuggageCounter>
