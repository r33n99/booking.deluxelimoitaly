type GtmEventData = Record<string, unknown>

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>
  }
}

export const trackGtmEvent = (eventName: string, eventData: GtmEventData = {}): void => {
  if (window.dataLayer) {
    window.dataLayer.push({
      event: eventName,
      ...eventData
    })
  } else {
    console.warn('Google Tag Manager dataLayer is not available.')
  }
}

export {}
