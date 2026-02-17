export interface TourSummary {
  id: number | string
  name?: string
  [key: string]: unknown
}

export interface AreaSummary {
  id: number | string
  name: string
  [key: string]: unknown
}

export interface EmailSubscribeSuccessResponse {
  success?: boolean
  [key: string]: unknown
}
