<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { siteConfig } from '@/config/site'

interface WeatherResponse {
  status?: number
  message?: string
  city?: string
  now?: {
    text?: string
    temp?: string | number
    wind_dir?: string
    wind_class?: string
  }
}

interface WeatherState {
  city: string
  text: string
  temperature: number
  windDirection: string
  windPower: string
}

const loading = ref(true)
const refreshing = ref(false)
const error = ref('')
const weather = ref<WeatherState | null>(null)

let refreshTimer: number | undefined
let controller: AbortController | undefined

const weatherIcon = computed(() => {
  if (!weather.value) return '☁️'

  const text = weather.value.text

  if (/晴/.test(text)) return '☀️'
  if (/雷/.test(text)) return '⛈️'
  if (/雪|冰雹/.test(text)) return '🌨️'
  if (/雨/.test(text)) return '🌧️'
  if (/雾|霾|沙尘/.test(text)) return '🌫️'
  if (/阴|云/.test(text)) return '☁️'

  return '🌤️'
})

const displayCity = computed(() => {
  return weather.value?.city || siteConfig.weather.city
})

function formatWindDirection(direction: string) {
  if (!direction || direction === '--') return '--'
  return direction.endsWith('风') ? direction : `${direction}风`
}

async function loadWeather() {
  controller?.abort()
  controller = new AbortController()

  loading.value = !weather.value
  refreshing.value = true
  error.value = ''

  const timeout = window.setTimeout(() => controller?.abort(), 8000)

  try {
    const response = await fetch(siteConfig.weather.api, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data = (await response.json()) as WeatherResponse

    if (data.status !== 0 || !data.now) {
      throw new Error(data.message || '天气获取失败')
    }

    const temperature = Number(data.now.temp)

    weather.value = {
      city: data.city || siteConfig.weather.city,
      text: data.now.text || '天气未知',
      temperature: Number.isFinite(temperature) ? temperature : 0,
      windDirection: formatWindDirection(data.now.wind_dir || '--'),
      windPower:
        data.now.wind_class?.replace(/\s*级/g, '') ||
        '--',
    }
  } catch (loadError) {
    if (
      loadError instanceof DOMException &&
      loadError.name === 'AbortError'
    ) {
      error.value = '天气请求超时'
    } else {
      error.value = '天气暂时无法获取'
    }
  } finally {
    window.clearTimeout(timeout)
    loading.value = false
    refreshing.value = false
  }
}

function refreshWeather() {
  void loadWeather()
}

onMounted(() => {
  void loadWeather()

  refreshTimer = window.setInterval(() => {
    void loadWeather()
  }, 10 * 60 * 1000)
})

onUnmounted(() => {
  controller?.abort()

  if (refreshTimer !== undefined) {
    window.clearInterval(refreshTimer)
  }
})
</script>

<template>
  <section class="weather-card liquid-glass" aria-label="当前天气">
    <div class="weather-main">
      <div class="weather-icon" aria-hidden="true">
        {{ weatherIcon }}
      </div>

      <div class="weather-info">
        <div class="weather-place liquid-glass-text">
          {{ displayCity }}
        </div>

        <div class="weather-state liquid-glass-text">
          <span v-if="loading && !weather">加载天气中…</span>
          <span v-else>{{ weather?.text || error || '天气获取失败' }}</span>
        </div>
      </div>

      <div class="weather-temperature liquid-glass-text">
        <span v-if="weather">
          {{ Math.round(weather.temperature) }}°
        </span>
        <span v-else>--°</span>
      </div>
    </div>

    <div v-if="weather" class="weather-details">
      <span>{{ weather.windDirection }}</span>
      <span>{{ weather.windPower }}级</span>
    </div>

    <div v-else class="weather-status">
      {{ error || '正在连接天气服务…' }}
    </div>

    <button
      class="weather-refresh liquid-glass-button"
      type="button"
      :disabled="refreshing"
      :aria-label="refreshing ? '正在刷新天气' : '刷新天气'"
      title="刷新天气"
      @click="refreshWeather"
    >
      <span :class="{ spinning: refreshing }" aria-hidden="true">↻</span>
    </button>
  </section>
</template>

<style scoped>
.weather-card {
  position: relative;
  width: 100%;
  padding: 18px 20px 16px;
}

.weather-main {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

.weather-icon {
  display: grid;
  flex: 0 0 48px;
  width: 48px;
  height: 48px;
  place-items: center;
  border: 1px solid rgb(255 255 255 / 18%);
  border-radius: 15px;
  background: rgb(255 255 255 / 8%);
  font-size: 27px;
}

.weather-info {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  gap: 4px;
}

.weather-place {
  overflow: hidden;
  color: var(--text-color);
  font-size: 14px;
  font-weight: 700;
  line-height: 1.45;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.weather-state {
  overflow: hidden;
  color: var(--text-secondary);
  font-size: 12px;
  line-height: 1.45;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.weather-temperature {
  flex: 0 0 auto;
  padding-right: 26px;
  color: var(--text-color);
  font-size: clamp(28px, 3vw, 36px);
  font-weight: 700;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.weather-details {
  display: flex;
  gap: 16px;
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid rgb(255 255 255 / 16%);
  color: var(--text-secondary);
  font-size: 11px;
  line-height: 1.5;
  text-shadow: var(--text-shadow-secondary);
  transition:
    color 0.35s ease,
    text-shadow 0.35s ease;
}

.weather-status {
  margin-top: 12px;
  padding-right: 28px;
  color: var(--text-secondary);
  font-size: 11px;
  line-height: 1.6;
  text-shadow: var(--text-shadow-secondary);
  transition:
    color 0.35s ease,
    text-shadow 0.35s ease;
}

.weather-refresh {
  position: absolute;
  right: 14px;
  bottom: 14px;
  width: 28px;
  height: 28px;
  padding: 0;
  color: var(--text-secondary);
  font-size: 16px;
}

.weather-refresh:disabled {
  opacity: 0.7;
}

.spinning {
  display: inline-block;
  animation: weather-spin 0.8s linear infinite;
}

@keyframes weather-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 420px) {
  .weather-card {
    padding: 16px;
  }

  .weather-icon {
    flex-basis: 44px;
    width: 44px;
    height: 44px;
    font-size: 24px;
  }

  .weather-temperature {
    padding-right: 24px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .spinning {
    animation: none;
  }
}
</style>
