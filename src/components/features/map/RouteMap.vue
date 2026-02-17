<template>
  <div class="map-container">
    <GMapMap
      v-if="googleDefined"
      @click="handleMapClick"
      ref="mapRef"
      :center="mapCenter"
      :zoom="zoomLevel"
      map-type-id="styledMap"
      class="mt-3 h-80 w-full"
      :options="{
        disableDefaultUI: true,
        zoomControl: true,
        fullscreenControl: true
      }"
    >
      <GMapPolyline v-if="path" :path="path" :options="{ strokeColor: '#14a201' }" />
      <GMapMarker
        v-if="validPickup"
        :key="`pickup-${validPickup.lat}-${validPickup.lng}`"
        @click="handleMarkerClick('pickup')"
        @dragstart="handleMarkerClick('pickup')"
        :position="validPickup"
        :icon="actualMarkerPickup"
        :draggable="true"
        @dragend="updateMarkerLocation('pickup', $event.latLng)"
      />
      <GMapMarker
        v-if="validDropoff"
        :key="`dropoff-${validDropoff.lat}-${validDropoff.lng}`"
        @click="handleMarkerClick('dropoff')"
        @dragstart="handleMarkerClick('dropoff')"
        :position="validDropoff"
        :icon="actualMarkerDropoff"
        :draggable="true"
        @dragend="updateMarkerLocation('dropoff', $event.latLng)"
      />
    </GMapMap>
    <div v-if="modal && isGMStylePresent">
      <teleport :to="modalTarget">
        <map-modal @close-modal="closeModal" />
      </teleport>
    </div>
  </div>
</template>

<script setup>
import { computed, inject, onMounted, ref, watch } from 'vue'
import marker from '~project_assets/images/marker.svg'

import { storeToRefs } from 'pinia'
import EUGeoJson from '@/assets/countries.geojson'
import MapModal from '@/components/layout/modals/mapModal.vue'
import { useTrustyStore } from '@/stores/data/trustyComplete'

const trustyStore = useTrustyStore()

const { activeAuto, pathStartFinish, pickupRef, dropoffRef } = storeToRefs(trustyStore)
const { checkAddress, updateLastChoisePlace, updatePlaceChoised } = trustyStore

const googleDefined = computed(() => {
  return typeof window !== 'undefined' && !!window.google?.maps?.Map
})

// Валидация координат для безопасной передачи в Google Maps
const isValidCoordinate = (coord) => {
  return (
    coord &&
    typeof coord.lat === 'number' &&
    typeof coord.lng === 'number' &&
    !isNaN(coord.lat) &&
    !isNaN(coord.lng)
  )
}

const validPickup = computed(() => {
  return isValidCoordinate(pathStartFinish.value.pickup) ? pathStartFinish.value.pickup : null
})

const validDropoff = computed(() => {
  return isValidCoordinate(pathStartFinish.value.dropoff) ? pathStartFinish.value.dropoff : null
})

const mapCenter = computed(() => {
  return validPickup.value || { lat: 41.9028, lng: 12.4964 } // Италия по умолчанию
})

const axios = inject('axios')
const mapRef = ref(null)
const requestTime = ref(false)
const path = ref(null)
const latRoadAbs = ref(null)
let mapInstance = ref()
let zoomLevel = ref(8)
const actualMarkerPickup = ref(marker)
const actualMarkerDropoff = ref(marker)
const prevPickup = ref(null)
const prevDropoff = ref(null)
const modal = ref(false)
const modalTarget = ref('.gm-style')
const emit = defineEmits(['markerdragged'])

const isGMStylePresent = computed(() => {
  return document.querySelector(modalTarget.value) !== null
})

const props = defineProps({
  form: Object,
  formName: String
})

function closeModal() {
  modal.value = false
}

function saveToLocalStorage() {
  localStorage.setItem('prevPickup', JSON.stringify(prevPickup.value))
  localStorage.setItem('prevDropoff', JSON.stringify(prevDropoff.value))
}

function loadFromLocalStorage() {
  const storedPickup = localStorage.getItem('prevPickup')
  const storedDropoff = localStorage.getItem('prevDropoff')

  if (storedPickup) {
    try {
      const parsed = JSON.parse(storedPickup)
      if (isValidCoordinate(parsed)) {
        prevPickup.value = parsed
      }
    } catch (e) {
      console.warn('Failed to parse stored pickup coordinates', e)
    }
  }

  if (storedDropoff) {
    try {
      const parsed = JSON.parse(storedDropoff)
      if (isValidCoordinate(parsed)) {
        prevDropoff.value = parsed
      }
    } catch (e) {
      console.warn('Failed to parse stored dropoff coordinates', e)
    }
  }
}

function handleMarkerClick(marker) {
  activeAuto.value = marker
}

async function loadEUGeoJson() {
  const response = await fetch(EUGeoJson)
  return response.json()
}

async function updateMarkerLocation(locationType, newLocation) {
  if (!newLocation) {
    console.error('Ошибка: отсутствует объект location.')
    return
  }

  const lat = newLocation.lat()
  const lng = newLocation.lng()

  if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
    console.error('Ошибка: неверные координаты.', { lat, lng })
    return
  }

  let latLng = {
    lat,
    lng
  }

  const pointInPolygon = (await import('point-in-polygon')).default
  const italyGeo = await loadEUGeoJson()

  let isInItaly = false
  const point = [latLng.lng, latLng.lat]

  for (const feature of italyGeo.features) {
    const geometry = feature.geometry

    if (geometry.type === 'Polygon') {
      // Для Polygon: coordinates[0] - внешний контур
      if (pointInPolygon(point, geometry.coordinates[0])) {
        isInItaly = true
        break
      }
    } else if (geometry.type === 'MultiPolygon') {
      // Для MultiPolygon: каждый элемент - массив полигонов
      for (const polygonCoords of geometry.coordinates) {
        // polygonCoords[0] - внешний контур полигона
        if (pointInPolygon(point, polygonCoords[0])) {
          isInItaly = true
          break
        }
      }
      if (isInItaly) break
    }
  }

  if (isInItaly) {
    if (isValidCoordinate(pathStartFinish.value.pickup)) {
      prevPickup.value = { ...pathStartFinish.value.pickup }
    }
    if (isValidCoordinate(pathStartFinish.value.dropoff)) {
      prevDropoff.value = { ...pathStartFinish.value.dropoff }
    }
    saveToLocalStorage()
  }

  if (!isInItaly) {
    modal.value = true
    if (locationType === 'pickup' && isValidCoordinate(prevPickup.value)) {
      pathStartFinish.value.pickup = { ...prevPickup.value }
    } else if (locationType === 'dropoff' && isValidCoordinate(prevDropoff.value)) {
      pathStartFinish.value.dropoff = { ...prevDropoff.value }
    }
    return
  }

  actualMarkerPickup.value = marker
  actualMarkerDropoff.value = marker
  emit('markerdragged', locationType)

  if (!window.google?.maps?.Geocoder) return
  const geocoder = new window.google.maps.Geocoder()

  geocoder.geocode({ location: latLng }, (results, status) => {
    if (status === window.google.maps.GeocoderStatus.OK && results && results.length > 0) {
      const firstResult = results[0]
      if (!checkAddress(firstResult, locationType)) return false

      if (locationType === 'pickup' && pickupRef.value) {
        pickupRef.value = firstResult.formatted_address
        updateLastChoisePlace(
          {
            formatted_address: pickupRef.value,
            place_id: firstResult.place_id
          },
          locationType,
          true
        )
        updatePlaceChoised(true, locationType)
        const pickupLat = firstResult.geometry.location.lat()
        const pickupLng = firstResult.geometry.location.lng()
        if (
          typeof pickupLat === 'number' &&
          typeof pickupLng === 'number' &&
          !isNaN(pickupLat) &&
          !isNaN(pickupLng)
        ) {
          pathStartFinish.value.pickup.lat = pickupLat
          pathStartFinish.value.pickup.lng = pickupLng
        }
        props.form.validate()
      } else if (locationType === 'dropoff' && dropoffRef.value) {
        dropoffRef.value = firstResult.formatted_address
        updateLastChoisePlace(
          {
            formatted_address: dropoffRef.value,
            place_id: firstResult.place_id
          },
          locationType,
          true
        )
        updatePlaceChoised(true, locationType)
        const dropoffLat = firstResult.geometry.location.lat()
        const dropoffLng = firstResult.geometry.location.lng()
        if (
          typeof dropoffLat === 'number' &&
          typeof dropoffLng === 'number' &&
          !isNaN(dropoffLat) &&
          !isNaN(dropoffLng)
        ) {
          pathStartFinish.value.dropoff.lat = dropoffLat
          pathStartFinish.value.dropoff.lng = dropoffLng
        }
        props.form.validate()
      }
    } else {
      console.error('Ошибка геокодирования: нет результатов или ошибка в запросе.')
    }
  })
}

function fitMapBounds() {
  if (
    !window.google?.maps?.LatLngBounds ||
    !mapRef.value ||
    !validPickup.value ||
    !validDropoff.value ||
    !mapRef.value.$mapObject
  ) {
    return
  }

  const bounds = new window.google.maps.LatLngBounds()
  bounds.extend(validPickup.value)
  bounds.extend(validDropoff.value)

  let diffLat = Math.abs(validPickup.value.lat - validDropoff.value.lat)
  const diffLong = Math.abs(validPickup.value.lng - validDropoff.value.lng)
  if (diffLong < 0.01) {
    bounds.extend({
      lat: validPickup.value.lat,
      lng: validPickup.value.lng + 1
    })
    bounds.extend({
      lat: validPickup.value.lat,
      lng: validPickup.value.lng - 1
    })
  }
  mapRef.value.$mapObject.fitBounds(bounds)
  zoomLevel.value =
    mapRef.value.$mapObject.getZoom() -
    ((props.form.values.pickup === 'Florence, Metropolitan City of Florence, Italy' &&
      props.form.values.dropoff === 'Lucca, Province of Lucca, Italy') ||
    (props.form.values.pickup === 'Florence, Metropolitan City of Florence, Italy' &&
      props.form.values.dropoff === 'Pisa, Province of Pisa, Italy')
      ? 0.7
      : 0)

  if (diffLong > diffLat) {
    if (zoomLevel.value > 10) {
      zoomLevel.value -= 1
    } else if (latRoadAbs.value >= 0.2 && latRoadAbs.value < 0.4 && zoomLevel.value >= 9.5) {
      zoomLevel.value -= 1
    } else if (latRoadAbs.value >= 0.4 && latRoadAbs.value < 0.6 && zoomLevel.value >= 9) {
      zoomLevel.value -= 0.85
    } else if (latRoadAbs.value >= 0.6 && latRoadAbs.value < 0.7 && zoomLevel.value >= 8) {
      zoomLevel.value -= 1.2
    } else if (latRoadAbs.value >= 0.7 && latRoadAbs.value < 0.8 && zoomLevel.value >= 8) {
      zoomLevel.value -= 1
    } else if (latRoadAbs.value >= 0.8 && latRoadAbs.value < 1.3 && zoomLevel.value >= 8) {
      zoomLevel.value -= 1
    } else if (latRoadAbs.value >= 1.3 && latRoadAbs.value < 1.5 && zoomLevel.value >= 7) {
      zoomLevel.value -= 0.8
    } else if (latRoadAbs.value >= 1.5 && latRoadAbs.value < 2.2 && zoomLevel.value >= 7) {
      zoomLevel.value -= 0.4
    }
  } else {
    if (zoomLevel.value > 10) {
      zoomLevel.value -= 1.5
    }
  }
}

watch(
  pathStartFinish,
  (value) => {
    if (
      Object.prototype.hasOwnProperty.call(value, 'pickup') &&
      Object.prototype.hasOwnProperty.call(value, 'dropoff') &&
      isValidCoordinate(value.pickup) &&
      isValidCoordinate(value.dropoff)
    ) {
      requestTime.value = true

      axios
        .post('/route/path', {
          origin: `${value.pickup.lat},${value.pickup.lng}`,
          destination: `${value.dropoff.lat},${value.dropoff.lng}`,
          key: import.meta.env.VITE_APP_GOOGLE_API_KEY
        })
        .then((value) => {
          requestTime.value = false

          if (!value.data?.data?.routes.length || !window.google?.maps?.geometry?.encoding)
            return false

          path.value = new window.google.maps.geometry.encoding.decodePath(
            value.data.data.routes[0].overview_polyline.points
          )
          fitMapBounds()
        })
        .catch((reason) => {
          console.error('Error fetching route path:', reason)
        })
    } else {
      // Очистка пути, если одна из координат стала невалидной
      path.value = null
      requestTime.value = false
    }
  },
  { deep: true }
)

onMounted(() => {
  loadFromLocalStorage()
  if (!mapRef.value) {
    return
  }
  mapRef.value.$mapPromise.then((map) => {
    if (!window.google?.maps?.Data) return
    mapInstance.value = map

    fetch(EUGeoJson)
      .then((response) => response.json())
      .then((geoJsonData) => {
        const geoJsonLayer = new window.google.maps.Data()
        geoJsonLayer.addGeoJson(geoJsonData)

        geoJsonLayer.setStyle({
          fillColor: 'transparent',
          strokeWeight: 0.2,
          strokeColor: 'transparent',
          fillOpacity: 0.5
        })

        geoJsonLayer.setMap(map)
      })
      .catch((error) => {
        console.error('Ошибка при загрузке GeoJSON:', error)
      })

    if (!window.google?.maps?.StyledMapType) return
    const styledMapType = new window.google.maps.StyledMapType([
      {
        featureType: 'administrative',
        elementType: 'labels.text.fill',
        stylers: [
          {
            color: '#444444'
          }
        ]
      },
      {
        featureType: 'landscape',
        elementType: 'all',
        stylers: [
          {
            color: '#f2f2f2'
          }
        ]
      },
      {
        featureType: 'poi',
        elementType: 'all',
        stylers: [
          {
            visibility: 'off'
          }
        ]
      },
      {
        featureType: 'road',
        elementType: 'all',
        stylers: [
          {
            saturation: -100
          },
          {
            lightness: 45
          }
        ]
      },
      {
        featureType: 'road.highway',
        elementType: 'all',
        stylers: [
          {
            visibility: 'simplified'
          }
        ]
      },
      {
        featureType: 'road.arterial',
        elementType: 'labels.icon',
        stylers: [
          {
            visibility: 'off'
          }
        ]
      },
      {
        featureType: 'transit',
        elementType: 'all',
        stylers: [
          {
            visibility: 'off'
          }
        ]
      },
      {
        featureType: 'water',
        elementType: 'all',
        stylers: [
          {
            color: '#46bcec'
          },
          {
            visibility: 'on'
          }
        ]
      }
    ])

    map.mapTypes.set('styledMap', styledMapType)
  })

  fitMapBounds()
  if (typeof window.vueGoogleMapsInit === 'function') {
    window.vueGoogleMapsInit()
  }

  requestTime.value = true
  if ((props.formName == 'Tours' || props.formName == 'Hourly') && !validPickup.value) {
    return
  }

  if (!validPickup.value || !validDropoff.value) {
    loadItalyMap()
    return
  }

  axios
    .post('/route/path', {
      origin: `${validPickup.value.lat},${validPickup.value.lng}`,
      destination: `${validDropoff.value.lat},${validDropoff.value.lng}`,
      key: import.meta.env.VITE_APP_GOOGLE_API_KEY
    })
    .then((value) => {
      requestTime.value = false

      const routeData = value?.data?.data?.routes?.[0]

      if (!validPickup.value || !validDropoff.value || !window.google?.maps?.geometry?.encoding) {
        loadItalyMap()
        return
      }

      path.value = new window.google.maps.geometry.encoding.decodePath(
        routeData.overview_polyline.points
      )

      if (routeData.legs?.[0]?.steps) {
        let steps = routeData.legs[0].steps

        let latMin = steps.reduce(function (x, y) {
          return Math.min(x, y.start_location.lat)
        }, 1000)

        let latMax = steps.reduce(function (x, y) {
          return Math.max(x, y.start_location.lat)
        }, 0)

        latRoadAbs.value = latMax - latMin
      }

      setTimeout(() => {
        fitMapBounds()
      }, 200)
    })
    .catch((reason) => {
      console.error('Ошибка при запросе маршрута:', reason)
    })
})

function loadItalyMap() {
  if (!mapInstance.value) return
  const italyCenter = { lat: 41.9028, lng: 12.4964 }
  mapInstance.value.setCenter(italyCenter)
  mapInstance.value.setZoom(6)
}

onMounted(() => {
  const observer = new MutationObserver(() => {
    const mapRoot = mapRef.value?.$el || mapRef.value
    if (mapRoot) {
      mapRoot.querySelectorAll('button, [tabindex], a, input, select, textarea').forEach((el) => {
        el.setAttribute('tabindex', '-1')
      })
    }
    document
      .querySelectorAll('.gm-control-active, .gm-fullscreen-control, .gm-style button, .gm-style a')
      .forEach((el) => {
        el.setAttribute('tabindex', '-1')
      })
  })
  observer.observe(document.body, { childList: true, subtree: true })
})
</script>

<style scoped>
.map-container {
  width: 100%;
}
</style>
