<!-- src/components/Profile/ProfileCard.vue -->

<script setup lang="ts">
import {
  computed,
  onMounted,
  onUnmounted,
  ref,
} from 'vue'

import { siteConfig } from '@/config/site'
import { useWeather } from '@/utils/Weather/weather'

const now = ref(new Date())

const avatarLoaded = ref(true)

let clockTimer:
  number | undefined

const {
  loading: weatherLoading,
  weather,
  weatherIcon,
  displayCity,
  loadWeather,
  startAutoRefresh,
} = useWeather()

/* =================================
   Time
   ================================= */

const formattedTime = computed(() => {
  return now.value.toLocaleTimeString(
    'zh-CN',
    {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    },
  )
})

const formattedDate = computed(() => {
  return now.value.toLocaleDateString(
    'zh-CN',
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    },
  )
})

/* =================================
   Location
   ================================= */

const profileLocation = computed(() => {
  return (
    displayCity.value ||
    siteConfig.profile.location
  )
})

/* =================================
   Avatar Fallback
   ================================= */

const avatarFallback = computed(() => {
  const name =
    siteConfig.profile.name.trim()

  if (!name) {
    return '?'
  }

  return name
    .charAt(0)
    .toUpperCase()
})

/* =================================
   Avatar Error
   ================================= */

function handleAvatarError() {
  avatarLoaded.value = false
}

/* =================================
   Lifecycle
   ================================= */

onMounted(() => {
  clockTimer =
    window.setInterval(() => {
      now.value = new Date()
    }, 1000)

  /*
   * WeatherCard 删除以后，
   * ProfileCard 负责第一次加载天气。
   */
  void loadWeather()

  /*
   * 每 10 分钟自动刷新。
   */
  startAutoRefresh()
})

onUnmounted(() => {
  if (
    clockTimer !== undefined
  ) {
    window.clearInterval(
      clockTimer,
    )
  }
})
</script>

<template>
  <section class="profile-card liquid-glass">
    <div class="profile-content">

      <!-- =========================
           Avatar
           ========================= -->

      <div class="avatar-wrapper">

        <div v-if="!avatarLoaded" class="avatar avatar-fallback" aria-label="头像占位">
          {{ avatarFallback }}
        </div>

        <img v-else class="avatar" :src="siteConfig.avatar" :alt="`${siteConfig.profile.name} 的头像`" decoding="async"
          @error="handleAvatarError" />

        <span class="online-indicator" aria-label="在线" title="在线" />
      </div>

      <!-- =========================
           Profile
           ========================= -->

      <div class="profile-info">

        <h1 class="profile-name">
          {{ siteConfig.profile.name }}
        </h1>

        <p class="profile-subtitle">
          {{ siteConfig.profile.subtitle }}
        </p>

        <!-- =========================
             Location + Weather
             ========================= -->

        <div class="profile-weather">

          <!-- Location -->

          <span class="profile-location">
            <span class="location-icon">
              ◆
            </span>

            <span>
              {{ profileLocation }}
            </span>
          </span>

          <!-- Divider -->

          <span class="weather-divider">
            ·
          </span>

          <!-- Weather -->

          <span class="weather-condition" :class="{
            loading:
              weatherLoading &&
              !weather,
          }">
            <span class="weather-emoji" aria-hidden="true">
              {{ weatherIcon }}
            </span>

            <span>
              {{
                weather?.text ||
                '加载中'
              }}
            </span>
          </span>

          <!-- Temperature -->

          <template v-if="weather">

            <span class="weather-divider">
              ·
            </span>

            <span class="weather-temperature">
              {{
                Math.round(
                  weather.temperature,
                )
              }}°
            </span>

          </template>

        </div>

        <!-- =========================
             Wind
             ========================= -->

        <div v-if="weather" class="weather-details">
          <span>
            {{ weather.windDirection }}
          </span>

          <span>
            {{ weather.windPower }}级
          </span>
        </div>

      </div>

      <!-- =========================
           Clock
           ========================= -->

      <div class="profile-clock">

        <time class="clock-time">
          {{ formattedTime }}
        </time>

        <time class="clock-date">
          {{ formattedDate }}
        </time>

      </div>

    </div>
  </section>
</template>

<style scoped>
/* =================================
   Profile Card
   ================================= */

.profile-card {
  position: relative;

  display: block;

  width: 100%;

  padding:
    26px 26px 24px;

  text-align: center;
}

/* =================================
   Content
   ================================= */

.profile-content {
  position: relative;

  z-index: 10;

  display: flex;

  flex-direction: column;

  align-items: center;

  width: 100%;
}

/* =================================
   Avatar
   ================================= */

.avatar-wrapper {
  position: relative;

  width: 108px;
  height: 108px;

  margin-bottom: 19px;
}

.avatar {
  display: block;

  width: 100%;
  height: 100%;

  object-fit: cover;

  border:
    2px solid rgb(255 255 255 / 70%);

  border-radius: 50%;

  background:
    rgb(255 255 255 / 12%);

  box-shadow:
    0 8px 24px rgb(0 0 0 / 18%),

    0 0 0 5px rgb(255 255 255 / 10%);

  box-sizing: border-box;

  transition:
    border-color 0.35s ease,
    box-shadow 0.35s ease;
}

/* =================================
   Avatar Fallback
   ================================= */

.avatar-fallback {
  display: flex;

  align-items: center;
  justify-content: center;

  color:
    #ffffff;

  background:
    linear-gradient(135deg,
      var(--accent-color),
      #c995dc);

  font-size: 36px;

  font-weight: 700;
}

/* =================================
   Online
   ================================= */

.online-indicator {
  position: absolute;

  right: 1px;
  bottom: 2px;

  width: 13px;
  height: 13px;

  border:
    3px solid rgb(255 255 255 / 90%);

  border-radius: 50%;

  background:
    #71d6a0;

  box-shadow:
    0 2px 8px rgb(40 100 70 / 25%);

  box-sizing: content-box;

  transition:
    border-color 0.35s ease;
}

/* =================================
   Profile Info
   ================================= */

.profile-info {
  width: 100%;

  min-width: 0;
}

.profile-name {
  margin: 0;

  color:
    var(--text-color);

  font-family:
    'Pacifico',
    cursive;

  font-size:
    clamp(34px, 4vw, 42px);

  font-weight:
    400;

  letter-spacing:
    0.025em;

  line-height:
    1.25;

  text-shadow:
    var(--text-shadow);

  transition:
    color 0.35s ease,
    text-shadow 0.35s ease;
}

.profile-subtitle {
  margin:
    10px 0 0;

  color:
    var(--text-secondary);

  font-family:
    'Pacifico',
    cursive;

  font-size:
    clamp(12px, 1.8vw, 15px);

  font-weight:
    400;

  line-height:
    1.7;

  letter-spacing:
    0.04em;

  text-shadow:
    var(--text-shadow-secondary);

  transition:
    color 0.35s ease,
    text-shadow 0.35s ease;
}

/* =================================
   Weather
   ================================= */

.profile-weather {
  display: flex;

  align-items: center;

  justify-content: center;

  flex-wrap: wrap;

  gap:
    7px;

  margin:
    10px 0 0;

  color:
    var(--text-secondary);

  font-size:
    clamp(10px, 1.5vw, 13px);

  line-height:
    1.5;

  text-shadow:
    var(--text-shadow-secondary);

  transition:
    color 0.35s ease,
    text-shadow 0.35s ease;
}

.profile-location,
.weather-condition,
.weather-temperature {
  display: inline-flex;

  align-items: center;

  white-space:
    nowrap;
}

.profile-location {
  gap:
    5px;
}

.location-icon {
  color:
    var(--accent-color);

  font-size:
    10px;

  transition:
    color 0.35s ease;
}

.weather-condition {
  gap:
    5px;
}

.weather-emoji {
  font-size:
    15px;

  line-height:
    1;
}

.weather-temperature {
  color:
    var(--text-color);

  font-size:
    1.05em;

  font-weight:
    600;

  transition:
    color 0.35s ease;
}

.weather-divider {
  opacity:
    0.45;

  user-select:
    none;
}

.weather-condition.loading {
  opacity:
    0.65;
}

/* =================================
   Wind
   ================================= */

.weather-details {
  display: flex;

  align-items: center;

  justify-content: center;

  gap:
    12px;

  margin-top:
    5px;

  color:
    var(--text-muted);

  font-size:
    clamp(11px, 1.4vw, 13px);

  line-height:
    1.4;

  text-shadow:
    var(--text-shadow-secondary);

  transition:
    color 0.35s ease,
    text-shadow 0.35s ease;
}

/* =================================
   Clock
   ================================= */

.profile-clock {
  display: flex;

  flex-direction: column;

  align-items: center;

  width: 100%;

  margin-top:
    23px;

  padding-top:
    18px;

  border-top:
    1px solid rgb(255 255 255 / 18%);

  transition:
    border-color 0.35s ease;
}

.clock-time {
  color:
    var(--text-color);

  font-family:
    'SFMono-Regular',
    Consolas,
    'Liberation Mono',
    Menlo,
    monospace;

  font-size:
    clamp(24px, 3vw, 29px);

  font-weight:
    700;

  letter-spacing:
    0.065em;

  line-height:
    1.2;

  font-variant-numeric:
    tabular-nums;

  text-shadow:
    var(--text-shadow);

  transition:
    color 0.35s ease,
    text-shadow 0.35s ease;
}

.clock-date {
  margin-top:
    7px;

  color:
    var(--text-secondary);

  font-size:
    11px;

  letter-spacing:
    0.035em;

  line-height:
    1.6;

  text-shadow:
    var(--text-shadow-secondary);

  transition:
    color 0.35s ease,
    text-shadow 0.35s ease;
}

/* =================================
   Dark Theme
   ================================= */

:global(html[data-theme='dark']) .avatar {
  border-color:
    rgb(255 255 255 / 28%);

  box-shadow:
    0 8px 26px rgb(0 0 0 / 28%),

    0 0 0 5px rgb(255 255 255 / 5%);
}

:global(html[data-theme='dark']) .online-indicator {
  border-color:
    rgb(32 23 42 / 95%);
}

:global(html[data-theme='dark']) .profile-clock {
  border-top-color:
    rgb(255 255 255 / 11%);
}

/* =================================
   Light Theme
   ================================= */

:global(html[data-theme='light']) .avatar {
  border-color:
    rgb(255 255 255 / 80%);

  box-shadow:
    0 8px 24px rgb(80 60 100 / 16%),

    0 0 0 5px rgb(255 255 255 / 22%);
}

:global(html[data-theme='light']) .online-indicator {
  border-color:
    rgb(255 255 255 / 92%);
}

:global(html[data-theme='light']) .profile-clock {
  border-top-color:
    rgb(62 62 62 / 14%);
}

/* =================================
   Mobile
   ================================= */

@media (max-width: 760px) {
  .profile-card {
    padding:
      22px 20px 20px;
  }

  .avatar-wrapper {
    width:
      96px;

    height:
      96px;

    margin-bottom:
      16px;
  }

  .online-indicator {
    right:
      -1px;

    bottom:
      1px;
  }

  .profile-name {
    font-size:
      34px;
  }

  .profile-subtitle {
    font-size:
      14px;
  }

  .profile-weather {
    font-size:
      11px;
  }

  .weather-emoji {
    font-size:
      14px;
  }

  .weather-details {
    font-size:
      11px;
  }

  .profile-clock {
    margin-top:
      20px;

    padding-top:
      16px;
  }

  .clock-time {
    font-size:
      25px;
  }
}

/* =================================
   Reduced Motion
   ================================= */

@media (prefers-reduced-motion: reduce) {

  .profile-name,
  .profile-subtitle,
  .profile-location,
  .weather-condition,
  .weather-temperature,
  .weather-details,
  .clock-time,
  .clock-date,
  .profile-clock,
  .avatar,
  .online-indicator,
  .location-icon {
    transition:
      none;
  }
}
</style>