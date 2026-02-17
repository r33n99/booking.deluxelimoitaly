<template>
  <input
    ref="autocomplete"
    type="text"
    :class="classname"
    :id="id"
    :placeholder="placeholder"
    :disabled="disabled"
    v-model="autocompleteText"
    @focus="onFocus()"
    @blur="onBlur()"
    @change="onChange"
    @keypress="onKeyPress"
    @keyup="onKeyUp"
  />
</template>

<script>
import { updateInputWidth } from 'update-input-width'

const ADDRESS_COMPONENTS = {
  subpremise: 'short_name',
  street_number: 'short_name',
  route: 'long_name',
  locality: 'long_name',
  administrative_area_level_1: 'short_name',
  administrative_area_level_2: 'long_name',
  country: 'long_name',
  postal_code: 'short_name'
}

const CITIES_TYPE = ['locality', 'administrative_area_level_3']
const REGIONS_TYPE = [
  'locality',
  'sublocality',
  'postal_code',
  'country',
  'administrative_area_level_1',
  'administrative_area_level_2'
]

/*
  By default, we're only including basic place data because requesting these
  fields place data is not additionally charged by Google. Please refer to:

  https://developers.google.com/maps/billing/understanding-cost-of-use#basic-data
*/
const BASIC_DATA_FIELDS = [
  'address_components',
  'adr_address',
  'alt_id',
  'formatted_address',
  'geometry',
  'icon',
  'id',
  'name',
  'business_status',
  'photo',
  'place_id',
  'scope',
  'type',
  'url',
  'utc_offset_minutes',
  'vicinity'
]

export default {
  name: 'VueGoogleAutocomplete',

  props: {
    id: {
      type: String,
      required: true
    },

    classname: String,

    placeholder: {
      type: String,
      default: 'Start typing'
    },

    autoCompleteString: {
      type: String
    },

    disabled: {
      type: Boolean,
      default: false
    },

    types: {
      type: String,
      default: 'address'
    },

    fields: {
      type: Array,
      default: function () {
        return BASIC_DATA_FIELDS
      }
    },

    country: {
      type: [String, Array],
      default: null
    },

    enableGeolocation: {
      type: Boolean,
      default: false
    },

    geolocationOptions: {
      type: Object,
      default: null
    }
  },

  data() {
    return {
      /**
       * The Autocomplete object.
       *
       * @type {Autocomplete}
       * @link https://developers.google.com/maps/documentation/javascript/reference#Autocomplete
       */
      autocomplete: null,

      /**
       * Autocomplete input text
       * @type {String}
       */
      autocompleteText: '',

      geolocation: {
        /**
         * Google Geocoder Objet
         * @type {Geocoder}
         * @link https://developers.google.com/maps/documentation/javascript/reference#Geocoder
         */
        geocoder: null,

        /**
         * Filled after geolocate result
         * @type {Coordinates}
         * @link https://developer.mozilla.org/en-US/docs/Web/API/Coordinates
         */
        loc: null,

        /**
         * Filled after geolocate result
         * @type {Position}
         * @link https://developer.mozilla.org/en-US/docs/Web/API/Position
         */
        position: null
      }
    }
  },

  watch: {
    autocompleteText: function (newVal, oldVal) {
      this.$emit('inputChange', { newVal, oldVal }, this.id)

      this.setAdditionalTopIndentForPacContainers(8)
      // TODO: Rewrite without using 'setTimeout'
      setTimeout(() => {
        this.highlightSelectedPacItem()
      }, 300)
    },
    country: function () {
      this.autocomplete.setComponentRestrictions({
        country: this.country === null ? [] : this.country
      })
    }
  },

  mounted: function () {
    // Checking the existence of a DOM element
    // const inputElement = document.getElementById(this.id);
    // if (!inputElement) {
    //     console.error('Element with id ' + this.id + ' not found.');
    //     return;
    // }
    const options = {}

    if (this.autoCompleteString) {
      this.autocompleteText = this.autoCompleteString
    }

    if (this.types) {
      options.types = [this.types]
    }

    if (this.country) {
      options.componentRestrictions = {
        country: this.country
      }
    }
    // eslint-disable-next-line
    this.autocomplete = new google.maps.places.Autocomplete(
      document.getElementById(this.id),
      options
    )

    this.autocomplete.setFields(this.fields)

    this.autocomplete.addListener('place_changed', this.onPlaceChanged)

    this.$nextTick(() => {
      this.updateAutocompleteWidth()
    })
  },

  beforeUnmount() {
    document.querySelectorAll('.pac-container').forEach((pacContainer) => pacContainer.remove())
  },

  methods: {
    /**
     * When a place changed
     */
    onPlaceChanged() {
      let place = this.autocomplete.getPlace()

      if (!place || !place.geometry) {
        // User entered the name of a Place that was not suggested and
        // pressed the Enter key, or the Place Details request failed.
        this.$emit('no-results-found', place, this.id)
        return
      }

      if (place.address_components !== undefined) {
        // update autocompleteText then emit change event
        this.autocompleteText = document.getElementById(this.id).value
        this.onChange()
        // return returnData object and PlaceResult object
        this.$emit('placechanged', this.formatResult(place), place, this.id, this.autocompleteText)
      }
    },

    /**
     * When the input gets focus
     */
    onFocus() {
      this.biasAutocompleteLocation()
      this.$emit('focus')
      this.updateAutocompleteWidth()

      // TODO: Rewrite without using 'setTimeout'
      setTimeout(() => {
        this.setAdditionalTopIndentForPacContainers(8)
      })
      setTimeout(() => {
        this.highlightSelectedPacItem()
      }, 300)
    },

    /**
     * When the input loses focus
     */
    onBlur() {
      this.$emit('blur')
      this.updateAutocompleteWidth()
    },

    /**
     * When the input got changed
     */
    onChange() {
      this.$emit('change', this.autocompleteText)
      this.updateAutocompleteWidth()
    },

    /**
     * When a key gets pressed
     * @param  {Event} event A keypress event
     */
    onKeyPress(event) {
      this.$emit('keypress', event)
    },

    /**
     * When a keyup occurs
     * @param  {Event} event A keyup event
     */
    onKeyUp(event) {
      this.$emit('keyup', event)
    },

    /**
     * Clear the input
     */
    clear() {
      this.autocompleteText = ''
    },

    /**
     * Focus the input
     */
    focus() {
      this.$refs.autocomplete.focus()
    },

    /**
     * Blur the input
     */
    blur() {
      this.$refs.autocomplete.blur()
    },

    /**
     * Update the value of the input
     * @param  {String} value
     */
    update(value) {
      this.autocompleteText = value
    },

    /**
     * Update the coordinates of the input
     * @param  {Coordinates} value
     */
    updateCoordinates(value) {
      if (!value && !(value.lat || value.lng)) return
      // eslint-disable-next-line
      if (!this.geolocation.geocoder) this.geolocation.geocoder = new google.maps.Geocoder()
      this.geolocation.geocoder.geocode({ location: value }, (results, status) => {
        if (status === 'OK') {
          results = this.filterGeocodeResultTypes(results)
          if (results[0]) {
            this.$emit('placechanged', this.formatResult(results[0]), results[0], this.id)
            this.update(results[0].formatted_address)
          } else {
            this.$emit('error', 'no result for provided coordinates')
          }
        } else {
          this.$emit('error', 'error getting address from coords')
        }
      })
    },

    /**
     * Update location based on navigator geolocation
     */
    geolocate() {
      this.updateGeolocation((geolocation /*, position*/) => {
        this.updateCoordinates(geolocation)
      })
    },

    /**
     * Update internal location from navigator geolocation
     * @param callback
     */
    updateGeolocation(callback = null) {
      if (navigator.geolocation) {
        let options = {}
        if (this.geolocationOptions) Object.assign(options, this.geolocationOptions)
        navigator.geolocation.getCurrentPosition(
          (position) => {
            let geolocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
            this.geolocation.loc = geolocation
            this.geolocation.position = position

            if (callback) callback(geolocation, position)
          },
          (err) => {
            this.$emit('error', 'Cannot get Coordinates from navigator', err)
          },
          options
        )
      }
    },

    // Bias the autocomplete object to the user's geographical location,
    // as supplied by the browser's 'navigator.geolocation' object.
    biasAutocompleteLocation() {
      if (this.enableGeolocation) {
        this.updateGeolocation((geolocation, position) => {
          //ToDO make google maps with library
          // eslint-disable-next-line
          let circle = new google.maps.Circle({
            center: geolocation,
            radius: position.coords.accuracy
          })
          this.autocomplete.setBounds(circle.getBounds())
        })
      }
    },

    /**
     * Format result from Geo google APIs
     * @param place
     * @returns {{formatted output}}
     */
    formatResult(place) {
      let returnData = {}
      for (let i = 0; i < place.address_components.length; i++) {
        let addressType = place.address_components[i].types[0]

        if (ADDRESS_COMPONENTS[addressType]) {
          let val = place.address_components[i][ADDRESS_COMPONENTS[addressType]]
          returnData[addressType] = val
        }
      }

      returnData['latitude'] = place.geometry.location.lat()
      returnData['longitude'] = place.geometry.location.lng()
      return returnData
    },

    /**
     * Extract configured types out of raw result as
     * Geocode API does not allow to do it
     * @param results
     * @returns {GeocoderResult}
     * @link https://developers.google.com/maps/documentation/javascript/reference#GeocoderResult
     */
    filterGeocodeResultTypes(results) {
      if (!results || !this.types) return results
      let output = []
      let types = [this.types]
      if (types.includes('(cities)')) types = types.concat(CITIES_TYPE)
      if (types.includes('(regions)')) types = types.concat(REGIONS_TYPE)

      for (let r of results) {
        for (let t of r.types) {
          if (types.includes(t)) {
            output.push(r)
            break
          }
        }
      }
      return output
    },

    /**
     * Update autocomplete input width by content
     */
    updateAutocompleteWidth() {
      if (this.classname.includes('summary_item_input')) {
        updateInputWidth(this.$refs.autocomplete)
      }
    },

    // Gets an array of '.pac-item' elements
    getPacItems() {
      return Array.from(document.querySelectorAll('.pac-item'))
    },

    // Highlights the '.pac-item' relevant to the previously selected location and marks it with the class '.pac-item-selected'
    highlightSelectedPacItem() {
      let objectWithFormattedPrediction = Object.values(
        this.autocomplete?.gm_accessors_?.place ?? {}
      ).find((value) => Object.prototype.hasOwnProperty.call(value, 'formattedPrediction'))
      if (!objectWithFormattedPrediction) return
      const formattedSelectedPlace = objectWithFormattedPrediction.formattedPrediction.replaceAll(
        /[,\s]/g,
        ''
      )
      this.getPacItems()
        .find((pacItem) => {
          const formattedPacItem = pacItem.textContent.replaceAll(/[,\s]/g, '')
          if (formattedSelectedPlace === formattedPacItem) return pacItem
        })
        ?.classList.add('pac-item-selected')
    },

    // Overrides the 'style.top' property for all '.pac-container' elements based on the provided argument
    setAdditionalTopIndentForPacContainers(additionalPixels) {
      document.querySelectorAll('.pac-container').forEach((pacContainer) => {
        pacContainer.style.top = `${parseInt(pacContainer.style.top) + additionalPixels}px`
      })
    }
  }
}
</script>
