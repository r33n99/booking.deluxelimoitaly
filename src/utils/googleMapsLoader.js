/**
 * Utility to wait for Google Maps API to load
 */

let googleMapsLoaded = false
let googleMapsLoadingPromise = null

/**
 * Check if Google Maps API is loaded
 * @returns {boolean}
 */
export function isGoogleMapsLoaded() {
  return (
    googleMapsLoaded ||
    (typeof window !== 'undefined' &&
      window.google &&
      window.google.maps &&
      window.google.maps.places)
  )
}

/**
 * Wait for Google Maps API to be loaded
 * @param {number} maxWaitTime - Maximum time to wait in milliseconds (default: 30000ms)
 * @param {number} checkInterval - Interval between checks in milliseconds (default: 100ms)
 * @returns {Promise<boolean>} - Resolves to true when loaded, false on timeout
 */
export function waitForGoogleMaps(maxWaitTime = 30000, checkInterval = 100) {
  if (googleMapsLoadingPromise) {
    return googleMapsLoadingPromise
  }

  if (isGoogleMapsLoaded()) {
    googleMapsLoaded = true
    return Promise.resolve(true)
  }

  googleMapsLoadingPromise = new Promise((resolve) => {
    const startTime = Date.now()

    const checkLoaded = () => {
      if (isGoogleMapsLoaded()) {
        googleMapsLoaded = true
        googleMapsLoadingPromise = null
        resolve(true)
        return
      }

      const elapsed = Date.now() - startTime
      if (elapsed >= maxWaitTime) {
        console.error('[GoogleMapsLoader] Timeout waiting for Google Maps API')
        googleMapsLoadingPromise = null
        resolve(false)
        return
      }

      setTimeout(checkLoaded, checkInterval)
    }

    checkLoaded()
  })

  return googleMapsLoadingPromise
}

/**
 * Execute callback when Google Maps is loaded
 * @param {Function} callback - Function to execute when loaded
 * @param {Function} onError - Function to execute on error
 */
export async function onGoogleMapsReady(callback, onError = null) {
  const loaded = await waitForGoogleMaps()
  if (loaded) {
    callback()
  } else if (onError) {
    onError(new Error('Google Maps API failed to load'))
  }
}

/**
 * Reset the loader state (useful for testing)
 */
export function resetGoogleMapsLoader() {
  googleMapsLoaded = false
  googleMapsLoadingPromise = null
}
