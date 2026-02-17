import { inject } from 'vue'
import { storeToRefs } from 'pinia'
import * as yup from 'yup'
import { useTrustyStore } from '@/stores/data/trustyComplete'
import type { StringSchema, NumberSchema } from 'yup'

type ValidationSchema = {
  email: StringSchema<string | undefined, yup.AnyObject, string | undefined>
  first_name: StringSchema<string | undefined, yup.AnyObject, string | undefined>
  last_name: StringSchema<string | undefined, yup.AnyObject, string | undefined>
  hours: NumberSchema<number | undefined, yup.AnyObject, number | undefined>
  pickup: StringSchema<string | undefined, yup.AnyObject, string | undefined>
  dropoff: StringSchema<string | undefined, yup.AnyObject, string | undefined>
  [key: string]: yup.AnySchema
}

export function useValidationSchema() {
  const regexLink = inject<RegExp | undefined>('regexLink')
  const regexIsHttps = inject<RegExp | undefined>('regexIsHttps')
  const regexNameField = inject<RegExp | undefined>('regexNameField')
  const trustyStore = useTrustyStore()
  const { pathStartFinish } = storeToRefs(trustyStore)

  const matchesRule = (regex: RegExp | undefined) =>
    regex ? { excludeEmptyString: true } : undefined

  const validationSchema: ValidationSchema = {
    email: yup
      .string()
      .required()
      .email()
      .max(230)
      .matches(regexIsHttps ?? /.*/, matchesRule(regexIsHttps))
      .matches(regexLink ?? /.*/, matchesRule(regexLink)),
    first_name: yup
      .string()
      .required()
      .max(50)
      .matches(regexNameField ?? /.*/, matchesRule(regexNameField))
      .matches(regexIsHttps ?? /.*/, matchesRule(regexIsHttps))
      .matches(regexLink ?? /.*/, matchesRule(regexLink)),
    last_name: yup
      .string()
      .required()
      .max(50)
      .matches(regexNameField ?? /.*/, matchesRule(regexNameField))
      .matches(regexIsHttps ?? /.*/, matchesRule(regexIsHttps))
      .matches(regexLink ?? /.*/, matchesRule(regexLink)),
    hours: yup.number().required().max(10),
    pickup: yup
      .string()
      .required()
      .max(230)
      .test(
        'google-complete',
        'Address must be verified using Google Autocomplete, and the country must be within the European Union or Switzerland',
        () => {
          const state = pathStartFinish.value as typeof pathStartFinish.value & {
            ride_history?: boolean | null
            redis_id?: string | null
          }

          if (state.ride_history) return true
          if (state.redis_id) return true
          return state.valid.pickup
        }
      )
      .matches(regexIsHttps ?? /.*/, matchesRule(regexIsHttps))
      .matches(regexLink ?? /.*/, matchesRule(regexLink)),
    dropoff: yup
      .string()
      .required()
      .max(230)
      .test(
        'google-complete',
        'Address must be verified using Google Autocomplete, and the country must be within the European Union or Switzerland',
        () => {
          const state = pathStartFinish.value as typeof pathStartFinish.value & {
            ride_history?: boolean | null
            redis_id?: string | null
          }

          if (state.ride_history) return true
          if (state.redis_id) return true
          return state.valid.dropoff
        }
      )
      .matches(regexIsHttps ?? /.*/, matchesRule(regexIsHttps))
      .matches(regexLink ?? /.*/, matchesRule(regexLink))
  }

  return {
    validationSchema
  }
}
