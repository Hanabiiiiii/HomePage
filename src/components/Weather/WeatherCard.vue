<!-- src/components/Weather/WeatherCard.vue -->

<script setup lang="ts">
import { onMounted } from 'vue'

import { useWeather } from '@/utils/Weather/weather'
import '@/styles/Weather/weather.scss'

const {
  loadWeather,
  refreshWeather,
  startAutoRefresh,
} = useWeather()

onMounted(() => {
  startAutoRefresh()

  // Weather 数据由 ProfileCard 使用，
  // 这里仍保留 WeatherCard 的独立请求入口。
  void loadWeather()
})
</script>

<template>
  <section class="weather-card weather-card-hidden" aria-hidden="true">
    <button class="weather-refresh liquid-glass-button" type="button" tabindex="-1" @click="refreshWeather">
      ↻
    </button>
  </section>
</template>

<style scoped>
.weather-card-hidden {
  display: none;
}
</style>