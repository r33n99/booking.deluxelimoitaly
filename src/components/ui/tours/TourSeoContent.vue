<template>
  <!-- Скрытый SEO-контент для поисковых систем -->
  <div
    class="seo-hidden-content"
    aria-hidden="true"
    role="complementary"
    itemscope
    itemtype="https://schema.org/TouristTrip"
  >
    <template v-if="pageData">
      <div class="seo-page-content">
        <tour-about-content :data="pageData" />
      </div>
    </template>
    <template v-else-if="tour">
      <!-- Основное описание тура -->
      <article class="seo-tour-description">
        <h1 itemprop="name">{{ tour.name }} - Tour Detailed Description</h1>
        <div itemprop="description" v-safe-html="tour.description"></div>

        <!-- Детали тура -->
        <section class="seo-tour-details">
          <h2>Tour Information {{ tour.name }}</h2>
          <dl>
            <dt>Tour Duration:</dt>
            <dd itemprop="duration">{{ formattedDuration }}</dd>

            <dt>Price per person:</dt>
            <dd itemprop="offers" itemscope itemtype="https://schema.org/Offer">
              <span itemprop="price">{{ pricePerParticipant }}</span>
              <span itemprop="priceCurrency" content="EUR">€</span>
            </dd>

            <dt>Region:</dt>
            <dd itemprop="locationCreated" v-if="tourDestination">{{ tourDestination }}</dd>

            <dt>Maximum participants:</dt>
            <dd itemprop="maximumAttendeeCapacity">{{ tour.max_participants || 8 }}</dd>
          </dl>
        </section>

        <!-- Основные моменты тура -->
        <section v-if="tour.highlights?.length" class="seo-tour-highlights">
          <h3>What you'll see on the {{ tour.name }} tour</h3>
          <ul itemprop="itinerary">
            <li v-for="(highlight, index) in tour.highlights" :key="index" itemprop="touristType">
              {{ typeof highlight === 'string' ? highlight : highlight.title }}
            </li>
          </ul>
        </section>

        <!-- Сегменты/категории тура -->
        <section v-if="segments?.length" class="seo-tour-segments">
          <h3>{{ tour.name }} Tour Itinerary</h3>
          <div v-for="segment in segments" :key="segment.id" class="seo-segment">
            <h4>{{ segment.name || segment.title }}</h4>
            <p v-if="segment.description">{{ segment.description }}</p>
            <p v-if="segment.duration"><strong>Duration:</strong> {{ segment.duration }} minutes</p>
          </div>
        </section>

        <!-- SEO-текст для ключевых слов -->
        <section class="seo-keywords-content">
          <h3>Why Choose {{ tour.name }} Tour with DLI</h3>
          <p>
            The "{{ tour.name }}" tour is a unique opportunity to explore the best attractions of
            {{ tourDestination || 'Italy' }}. Our tours are led by professional guides who will
            share the history and secrets of each location with you.
          </p>
          <p>
            The tour duration is {{ formattedDuration }}, allowing you to fully immerse yourself in
            the atmosphere of {{ tourDestination || 'Italian culture' }}. The tour price starts from
            {{ pricePerParticipant }}€ per person and includes everything needed for a comfortable
            journey.
          </p>
          <p v-if="tour.highlights?.length">
            During the "{{ tour.name }}" tour, you will visit:
            {{ tour.highlights.map((h) => (typeof h === 'string' ? h : h.title)).join(', ') }}. Each
            location has been carefully selected by our experts for maximum immersion in the local
            culture and history.
          </p>
        </section>
      </article>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getTourDestination, getTourCategories } from '@/utils/tourAdapter'
import { PriceCalculationService } from '@/utils/priceCalculationService'
import TourAboutContent from './TourAboutContent.vue'

const props = defineProps({
  tour: {
    type: Object,
    default: null
  },
  pageData: {
    type: Object,
    default: null
  },
  formattedDuration: {
    type: String,
    default: '0h'
  },
  pricePerParticipant: {
    type: Number,
    default: 0
  }
})

const tourDestination = computed(() => {
  return getTourDestination(props.tour) || 'Italy'
})

const segments = computed(() => {
  return getTourCategories(props.tour)
})
</script>

<style lang="scss" scoped>
.seo-hidden-content {
  /* SEO-friendly скрытие контента */
  position: absolute !important;
  left: -10000px !important;
  top: auto !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: 0 !important;
  overflow: hidden !important;
  clip: rect(1px, 1px, 1px, 1px) !important;
  clip-path: inset(50%) !important;
  border: 0 !important;
  white-space: nowrap !important;
}

/* Для поисковых систем при индексации */
@media print {
  .seo-hidden-content {
    position: relative !important;
    left: auto !important;
    top: auto !important;
    width: auto !important;
    height: auto !important;
    overflow: visible !important;
    clip: auto !important;
    clip-path: none !important;
    white-space: normal !important;
    margin: 2em 0;
    padding: 1em;
    border: 1px solid #ccc;
  }
}

/* Стили для SEO контента */
.seo-tour-description {
  h1,
  h2,
  h3,
  h4 {
    margin: 1em 0 0.5em 0;
    font-weight: bold;
  }

  h2 {
    font-size: 1.5em;
  }
  h3 {
    font-size: 1.3em;
  }
  h4 {
    font-size: 1.1em;
  }

  p {
    margin: 0.8em 0;
    line-height: 1.6;
  }

  dl {
    margin: 1em 0;
  }

  dt {
    font-weight: bold;
    margin-top: 0.8em;
  }

  dd {
    margin: 0.2em 0 0.8em 1em;
  }

  ul {
    margin: 1em 0;
    padding-left: 2em;
  }

  li {
    margin: 0.3em 0;
  }
}

.seo-segment {
  margin: 1.5em 0;
  padding: 1em;
  border-left: 3px solid var(--color-main, #d97959);
}
</style>
