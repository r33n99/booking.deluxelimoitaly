export type HomePageFormIndex = 1 | 2 | 3

export type HomePageServiceType = 'oneWayTransfer' | 'hourlyAsDirected' | 'toursRoadshows'

export type HomePageButtonClass = Record<string, boolean>

export interface HomePageButton {
  class: HomePageButtonClass
  active: boolean
  name: string
  index: HomePageFormIndex
}

export type HomePageServiceTypesMap = Record<HomePageFormIndex, HomePageServiceType>
