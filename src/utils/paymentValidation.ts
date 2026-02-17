import * as yup from 'yup'

export const userFormSchema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required')
    .test(
      'email-dot',
      'The email address must contain a dot (.) in the domain part after the @ symbol',
      (value) => {
        if (!value) return false
        const parts = value.split('@')
        if (parts.length !== 2) return false
        return parts[1].includes('.')
      }
    ),
  phone: yup.string().required('Phone number is required'),
  country: yup.string().required('Country is required')
})

interface PaymentFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  country: string
  [key: string]: unknown
}

type ValidationErrors = Record<string, string>

export const validatePaymentForm = async (
  formData: PaymentFormData
): Promise<{ isValid: boolean; errors: ValidationErrors }> => {
  try {
    // Try validating the whole form
    await userFormSchema.validate(formData, { abortEarly: false })
    return { isValid: true, errors: {} }
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      // Collect all errors from validation
      const errors: ValidationErrors = {}

      error.inner.forEach((err) => {
        if (err.path) {
          errors[err.path] = err.message
        }
      })

      // If no inner errors but we have a path/message, use that
      if (error.inner.length === 0 && error.path) {
        errors[error.path] = error.message
      }

      return { isValid: false, errors }
    }

    // Fallback for unexpected errors
    return { isValid: false, errors: { email: 'Validation failed' } }
  }
}

type StripeErrorKey =
  | 'card_error'
  | 'validation_error'
  | 'rate_limit_error'
  | 'invalid_request_error'
  | 'authentication_error'
  | 'api_error'
  | 'expired_card'
  | 'incorrect_cvc'
  | 'insufficient_funds'
  | 'payment_intent_authentication_failure'
  | 'incorrect-zip'
  | 'card-declined'

interface PaymentError {
  type?: StripeErrorKey | string
  decline_code?: StripeErrorKey | string
  message?: string
}

export const formatCreditCardError = (error: PaymentError | null | undefined): string => {
  if (!error) return ''

  const errorMessages: Record<StripeErrorKey, string> = {
    card_error:
      'There was an issue with your credit card. Please check your card details and try again.',
    validation_error: 'Please check your payment information and try again.',
    rate_limit_error: 'Too many requests. Please try again later.',
    invalid_request_error: 'The payment request was invalid. Please try again.',
    authentication_error: 'Authentication with the payment service failed.',
    api_error: 'Payment service is temporarily unavailable. Please try again later.',
    expired_card: 'Your card has expired. Please use a different card.',
    incorrect_cvc: "Your card's security code is incorrect. Please check the code.",
    insufficient_funds: 'Your card has insufficient funds. Please use a different payment method.',
    payment_intent_authentication_failure: 'Authentication for this payment failed.',
    'incorrect-zip': "Your card's zip code failed validation. Please check the zip code.",
    'card-declined': 'Your card was declined. Please use a different card or contact your bank.'
  }

  if (error.type && errorMessages[error.type as StripeErrorKey]) {
    return errorMessages[error.type as StripeErrorKey]
  }

  if (error.decline_code && errorMessages[error.decline_code as StripeErrorKey]) {
    return errorMessages[error.decline_code as StripeErrorKey]
  }

  return error.message || 'An error occurred while processing your payment. Please try again.'
}
