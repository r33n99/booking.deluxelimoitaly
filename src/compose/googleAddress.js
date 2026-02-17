import { ref } from 'vue'

import { storeToRefs } from 'pinia'
import { collect } from 'collect.js'
import { useGoogleAddressStore } from '@/stores'

export function useGoogleAddress(/*type = 'oneWayTransfer'*/) {
  const googleAddressStore = useGoogleAddressStore()

  const { fields, activeAuto, pathStartFinish } = storeToRefs(googleAddressStore)

  const dropoff = ref(null)
  const pickup = ref(null)

  const isLatin = (event) =>
    /^[a-zA-Z0-9?><;,{}[\]\-_+=!@#$%\\^&*|'\s]*$/.test(event.data) ? true : event.preventDefault()

  const beforeInput = (event, fieldName) => {
    if (event.inputType !== 'insertFromPaste') {
      isLatin(event)
    }
    activeAuto.value = fieldName
    fields.value[fieldName].valid = false
  }

  const findAutocompleteFromEventPath = (eventPath) => {
    if (!eventPath || !Array.isArray(eventPath)) return null

    const vueGoogleAutocomplete = eventPath.find(
      (el) => el.dataset?.vueTag === 'vue-google-autocomplete'
    )
    return vueGoogleAutocomplete ? vueGoogleAutocomplete.__vueParentComponent : null
  }

  const focusInput = (event, fieldName) => {
    if (!event || !event.path) return

    const vueGoogleAutocomplete = findAutocompleteFromEventPath(event.path)
    if (vueGoogleAutocomplete) {
      activeAuto.value = fieldName
      // eslint-disable-next-line no-undef
      if (orderData.value[fieldName] === vueGoogleAutocomplete.autoCompleteString) {
        return
      }
    }
    fields.value[fieldName].valid = false
  }

  const getAddressData = (addressData, placeResultData) => {
    const countries =
      'Austria, Belgium, Bulgaria, Greece, Denmark, Ireland, Spain, Italy, Cyprus, Latvia, Lithuania, Luxembourg, Malta, Netherlands, Poland, Portugal, Romania, Slovakia, Slovenia, Finland, France, Croatia, Czechia, Sweden, Estonia, Germany, Hungary, Switzerland'
    const countryArray = countries.split(', ')

    let countryChecked = null
    if (Object.prototype.hasOwnProperty.call(addressData, 'country')) {
      countryChecked = addressData.country
    } else {
      let addressCollect = collect(addressData.address_components)
      let findedCountry = addressCollect
        .filter((e) => {
          return e.types.includes('country')
        })
        .first()
      if (findedCountry) {
        countryChecked = findedCountry.long_name
      }
    }
    fields.value[activeAuto.value].valid = false
    if (countryArray.includes(countryChecked)) {
      fields.value[activeAuto.value].valid = true
      if (activeAuto.value === 'pickup') {
        pathStartFinish.value.pickup = {
          lat: placeResultData.geometry.location.lat(),
          lng: placeResultData.geometry.location.lng()
        }
      }
      if (activeAuto.value === 'dropoff') {
        pathStartFinish.value.dropoff = {
          lat: placeResultData.geometry.location.lat(),
          lng: placeResultData.geometry.location.lng()
        }
      }
    }
  }

  const noResultsFound = () => {
    //TODO: Make noResultFound
  }

  // expose managed state as return value
  return {
    noResultsFound,
    fields,
    beforeInput,
    focusInput,
    pickup,
    dropoff,
    getAddressData
  }
}
