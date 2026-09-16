<script setup lang="ts">
import {
  onMounted,
  onUnmounted,
  ref,
} from 'vue'

import { siteConfig } from '@/config/site'
import { useAppStore } from '@/stores/app'

type Theme = 'dark' | 'light'

type BackgroundSource = 'api' | 'local' | ''

const appStore = useAppStore()

const isMobile = ref(false)

const imageSrc = ref('')

const imageLoaded = ref(false)

const imageFailed = ref(false)

const source = ref<BackgroundSource>('')

const theme = ref<Theme>('dark')

let mediaQuery: MediaQueryList | null = null

let themeObserver: MutationObserver | null = null

let apiTimerId: number | null = null

let localTimerId: number | null = null

/* 已尝试过的本地图片，避免失败后反复取到同一张 */
const triedLocalImages = new Set<string>()

/* 本地图片最多尝试次数 */
const MAX_LOCAL_ATTEMPTS = 2

let localAttempts = 0

/* 幂等完成标志 */
let backgroundReady = false

let destroyed = false

/* =================================
   超时配置
   ================================= */

/*
 * API 超时：硬上限 30 秒。
 *
 * 优先读 site.ts 配置，但压到 30s 以内。
 * 配置为 0 / 未配置时，直接用 30000。
 */
const API_TIMEOUT = (() => {
  const configured =
    siteConfig.background.apiTimeout || 0

  return configured > 0
    ? Math.min(configured, 30000)
    : 30000
})()

/* 本地图片超时：本地图应该很快，5 秒足够 */
const LOCAL_TIMEOUT = 5000

/* =================================
   主题
   ================================= */

function getCurrentTheme(): Theme {
  return document.documentElement.dataset.theme === 'light'
    ? 'light'
    : 'dark'
}

function updateTheme() {
  theme.value = getCurrentTheme()
}

/* =================================
   设备类型
   ================================= */

function updateDeviceType() {
  isMobile.value = mediaQuery?.matches ?? false
}

function handleMediaChange(event: MediaQueryListEvent) {
  isMobile.value = event.matches

  /*
   * 只有"当前是本地图 + 还没完成"时，
   * 才按新的设备类型重新随机一张。
   */
  if (
    source.value === 'local' &&
    !backgroundReady
  ) {
    triedLocalImages.clear()
    localAttempts = 0
    loadLocalImage()
  }
}

/* =================================
   本地图片随机选取
   ================================= */

function pickLocalImage(): string {
  const { local } = siteConfig.background

  const preferred = isMobile.value
    ? local.mobile
    : local.desktop

  const pool =
    preferred.length > 0 ? preferred : local.desktop

  const candidates = pool.filter(
    (item) => !triedLocalImages.has(item),
  )

  if (candidates.length === 0) return ''

  const index = Math.floor(
    Math.random() * candidates.length,
  )

  return candidates[index] ?? ''
}

/* =================================
   幂等完成
   ================================= */

function markBackgroundReady(success: boolean) {
  if (backgroundReady || destroyed) return

  backgroundReady = true

  imageLoaded.value = success
  imageFailed.value = !success

  /*
   * 只通知 store "背景已就绪"，
   * 关闭 Loading 由 LoadingScreen 统一决策。
   */
  appStore.setBackgroundReady(true)
}

/* =================================
   超时清理
   ================================= */

function clearApiTimeout() {
  if (apiTimerId === null) return
  window.clearTimeout(apiTimerId)
  apiTimerId = null
}

function clearLocalTimeout() {
  if (localTimerId === null) return
  window.clearTimeout(localTimerId)
  localTimerId = null
}

function clearAllTimeouts() {
  clearApiTimeout()
  clearLocalTimeout()
}

/* =================================
   API 加载（优先）
   ================================= */

function loadApiImage() {
  if (destroyed || backgroundReady) return

  const { api } = siteConfig.background

  if (!api) {
    loadLocalImage()
    return
  }

  source.value = 'api'
  imageFailed.value = false
  imageSrc.value = api

  clearApiTimeout()

  apiTimerId = window.setTimeout(() => {
    apiTimerId = null

    if (destroyed || backgroundReady) return
    if (source.value !== 'api' || imageLoaded.value) {
      return
    }

    /*
     * API 超时 → 中止 API 请求 → 切换到本地图
     *
     * 注：Vue 更新 <img :src> 后，
     * 浏览器会自动取消对旧 API URL 的下载。
     */
    console.warn(
      `[Background] API 图片加载超时（${API_TIMEOUT}ms），中止 API 请求，切换到本地图片`,
    )

    loadLocalImage()
  }, API_TIMEOUT)
}

/* =================================
   本地加载
   ================================= */

function loadLocalImage() {
  if (destroyed || backgroundReady) return

  /* 从 API 切换到本地时，清掉 API 超时 */
  clearApiTimeout()

  if (localAttempts >= MAX_LOCAL_ATTEMPTS) {
    console.warn(
      '[Background] 本地图片全部尝试失败，放弃',
    )
    markBackgroundReady(false)
    return
  }

  const src = pickLocalImage()

  if (!src) {
    console.warn(
      '[Background] 没有可用的本地图片',
    )
    markBackgroundReady(false)
    return
  }

  localAttempts++
  triedLocalImages.add(src)

  source.value = 'local'
  imageFailed.value = false
  imageSrc.value = src

  clearLocalTimeout()

  localTimerId = window.setTimeout(() => {
    localTimerId = null

    if (destroyed || backgroundReady) return
    if (source.value !== 'local' || imageLoaded.value) {
      return
    }

    console.warn(
      `[Background] 本地图片加载超时（${LOCAL_TIMEOUT}ms），尝试下一张`,
    )

    loadLocalImage()
  }, LOCAL_TIMEOUT)
}

/* =================================
   图片事件
   ================================= */

function handleImageLoad() {
  if (destroyed || backgroundReady) return

  clearAllTimeouts()

  console.log(
    `[Background] 图片加载完成：${source.value}`,
  )

  markBackgroundReady(true)
}

function handleImageError() {
  if (destroyed || backgroundReady) return

  clearAllTimeouts()

  if (source.value === 'api') {
    console.warn(
      '[Background] API 图片加载失败，切换到本地图片',
    )
  } else {
    console.warn(
      '[Background] 本地图片加载失败，尝试下一张',
    )
  }

  loadLocalImage()
}

/* =================================
   Mounted / Unmounted
   ================================= */

onMounted(() => {
  /* Theme */

  updateTheme()

  themeObserver = new MutationObserver(() => {
    updateTheme()
  })

  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  })

  /* Mobile */

  mediaQuery = window.matchMedia('(max-width: 760px)')

  updateDeviceType()

  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener(
      'change',
      handleMediaChange,
    )
  } else {
    mediaQuery.addListener(handleMediaChange)
  }

  /* Background: API 优先，最多 30s，超时切本地 */

  loadApiImage()
})

onUnmounted(() => {
  destroyed = true
  backgroundReady = true

  clearAllTimeouts()

  if (themeObserver) {
    themeObserver.disconnect()
    themeObserver = null
  }

  if (mediaQuery) {
    if (mediaQuery.removeEventListener) {
      mediaQuery.removeEventListener(
        'change',
        handleMediaChange,
      )
    } else {
      mediaQuery.removeListener(handleMediaChange)
    }
    mediaQuery = null
  }
})
</script>

<template>
  <div
    class="background-layer"
    :class="[
      `theme-${theme}`,
      {
        'is-loaded': imageLoaded,
        'is-failed': imageFailed,
      },
    ]"
    aria-hidden="true"
  >
    <!-- =================================
         Background Image
         ================================= -->

    <img
      v-if="!imageFailed && imageSrc"
      :key="imageSrc"
      class="background-image"
      :src="imageSrc"
      alt=""
      decoding="async"
      fetchpriority="high"
      @load="handleImageLoad"
      @error="handleImageError"
    />

    <!-- Dark Overlay -->
    <div
      class="background-tint background-tint-dark"
    />

    <!-- Light Overlay -->
    <div
      class="background-tint background-tint-light"
    />

    <!-- Vignette -->
    <div class="background-vignette" />
  </div>
</template>

<style scoped>
/* =================================
   Background
   ================================= */

.background-layer {
  position: fixed;

  inset: 0;

  z-index: -2;

  width: 100%;
  height: 100%;

  overflow: hidden;

  background: var(--page-background);

  pointer-events: none;
}

/* =================================
   Background Image
   ================================= */

.background-image {
  position: absolute;

  inset: 0;

  display: block;

  width: 100%;
  height: 100%;

  object-fit: cover;
  object-position: center center;

  opacity: 0;

  filter: none;
  transform: none;

  transition: opacity 0.65s ease;
}

.background-layer.is-loaded .background-image {
  opacity: 1;
}

/* =================================
   Overlay Common
   ================================= */

.background-tint {
  position: absolute;

  inset: 0;

  z-index: 1;

  pointer-events: none;

  opacity: 0;

  transition: opacity 0.45s ease;
}

/* =================================
   Dark Overlay
   ================================= */

.background-tint-dark {
  background:
    radial-gradient(
      circle at 20% 18%,
      rgb(110 78 135 / 7%) 0%,
      transparent 40%
    ),
    linear-gradient(
      135deg,
      rgb(8 7 15 / 24%),
      rgb(24 17 39 / 28%)
    );
}

/* =================================
   Light Overlay
   ================================= */

.background-tint-light {
  background:
    radial-gradient(
      circle at 18% 18%,
      rgb(255 255 255 / 22%) 0%,
      transparent 42%
    ),
    radial-gradient(
      circle at 82% 76%,
      rgb(255 245 250 / 11%) 0%,
      transparent 44%
    ),
    linear-gradient(
      135deg,
      rgb(255 255 255 / 8%),
      rgb(255 255 255 / 11%)
    );
}

/* =================================
   Dark Theme
   ================================= */

.background-layer.theme-dark .background-tint-dark {
  opacity: 1;
}

.background-layer.theme-dark .background-tint-light {
  opacity: 0;
}

/* =================================
   Light Theme
   ================================= */

.background-layer.theme-light .background-tint-dark {
  opacity: 0;
}

.background-layer.theme-light .background-tint-light {
  opacity: 1;
}

/* =================================
   Vignette
   ================================= */

.background-vignette {
  position: absolute;

  inset: 0;

  z-index: 2;

  pointer-events: none;

  background:
    radial-gradient(
      ellipse at center,
      transparent 48%,
      rgb(5 4 10 / 9%) 100%
    );

  transition:
    opacity 0.45s ease,
    background 0.45s ease;
}

.background-layer.theme-light .background-vignette {
  background:
    radial-gradient(
      ellipse at center,
      transparent 62%,
      rgb(55 42 70 / 4%) 100%
    );
}

/* =================================
   Mobile
   ================================= */

@media (max-width: 760px) {
  .background-image {
    object-position: center center;
  }
}

/* =================================
   Reduced Motion
   ================================= */

@media (prefers-reduced-motion: reduce) {
  .background-image,
  .background-tint,
  .background-vignette {
    transition: none;
  }
}
</style>