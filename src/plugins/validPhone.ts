// Cache for dynamically loaded function
let validatePhoneNumberLengthFn:
  | typeof import('libphonenumber-js').validatePhoneNumberLength
  | null = null
let loadingPromise: Promise<void> | null = null

// Preload function - call this when component with phone input mounts
export async function preloadValidPhone() {
  if (validatePhoneNumberLengthFn) {
    return
  }
  if (loadingPromise) {
    await loadingPromise
    return
  }

  loadingPromise = import('libphonenumber-js')
    .then((module) => {
      validatePhoneNumberLengthFn = module.validatePhoneNumberLength
      loadingPromise = null
    })
    .catch((error) => {
      console.error('Failed to load libphonenumber-js:', error)
      loadingPromise = null
    })

  await loadingPromise
}

export function validPhone(event: any, country_prefix: any) {
  // If press backspace
  if (event.data == null) {
    return true
  }

  // Test a number
  if (!/^[0-9]+$/.test(event.data)) {
    event.preventDefault()
    return
  }

  // Valid max length number phone
  // If library is not loaded yet, skip validation (it will be loaded on next input)
  if (!validatePhoneNumberLengthFn) {
    // Trigger preload in background
    preloadValidPhone().catch(() => {})
    return
  }

  const validate = validatePhoneNumberLengthFn(event.target.value + event.data, country_prefix)
  if (validate === 'INVALID_LENGTH') event.preventDefault()
  if (validate === 'TOO_LONG') event.preventDefault()
}
