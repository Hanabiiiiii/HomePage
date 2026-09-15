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

let loadTimeoutId: number | null = null

/* 已尝试过的本地图片，避免失败后反复取到同一张 */
let triedLocalImages = new Set<string>()

/* =================================
   当前主题
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
  isMobile.value =
    mediaQuery?.matches ?? false
}

function handleMediaChange(
  event: MediaQueryListEvent,
) {
  isMobile.value = event.matches

  /*
   * 当前已经在使用本地图片时，
   * 按新的设备类型重新随机一张。
   */
  if (source.value === 'local') {
    triedLocalImages = new Set()

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

  const pool = preferred.length > 0
    ? preferred
    : local.desktop

  const candidates = pool.filter(
    (item) => !triedLocalImages.has(item),
  )

  if (candidates.length === 0) {
    return ''
  }

  const index = Math.floor(
    Math.random() * candidates.length,
  )

  return candidates[index] ?? ''
}

/* =================================
   超时控制
   ================================= */

function clearLoadTimeout() {
  if (loadTimeoutId === null) {
    return
  }

  window.clearTimeout(loadTimeoutId)

  loadTimeoutId = null
}

function startLoadTimeout() {
  clearLoadTimeout()

  const timeout =
    siteConfig.background.apiTimeout

  if (!timeout || timeout <= 0) {
    return
  }

  loadTimeoutId = window.setTimeout(() => {
    loadTimeoutId = null

    /* API 图片超时，回退到本地图片 */
    if (
      source.value === 'api' &&
      !imageLoaded.value
    ) {
      loadLocalImage()
    }
  }, timeout)
}

/* =================================
   加载流程
   ================================= */

function loadApiImage() {
  const { api } = siteConfig.background

  if (!api) {
    loadLocalImage()

    return
  }

  source.value = 'api'

  imageFailed.value = false

  imageSrc.value = api

  startLoadTimeout()
}

function loadLocalImage() {
  clearLoadTimeout()

  const src = pickLocalImage()

  if (!src) {
    finishLoadingWithFailure()

    return
  }

  triedLocalImages.add(src)

  source.value = 'local'

  imageFailed.value = false

  imageSrc.value = src
}

/* =================================
   图片事件
   ================================= */

function handleImageLoad() {
  clearLoadTimeout()

  imageLoaded.value = true

  imageFailed.value = false

  appStore.setBackgroundReady(true)

  appStore.finishLoading()
}

function handleImageError() {
  clearLoadTimeout()

  /*
   * API 图片失败 -> 回退本地图片
   * 本地图片失败 -> 换列表里的另一张
   * 全部尝试失败 -> finishLoadingWithFailure
   */
  loadLocalImage()
}

function finishLoadingWithFailure() {
  imageLoaded.value = false

  imageFailed.value = true

  appStore.setBackgroundReady(true)

  appStore.finishLoading()
}

/* =================================
   Mounted
   ================================= */

onMounted(() => {
  /* ---------------------------------
     Theme
     --------------------------------- */

  updateTheme()

  themeObserver = new MutationObserver(() => {
    updateTheme()
  })

  themeObserver.observe(
    document.documentElement,
    {
      attributes: true,
      attributeFilter: [
        'data-theme',
      ],
    },
  )

  /* ---------------------------------
     Mobile
     --------------------------------- */

  mediaQuery =
    window.matchMedia(
      '(max-width: 760px)',
    )

  updateDeviceType()

  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener(
      'change',
      handleMediaChange,
    )
  } else {
    mediaQuery.addListener(
      handleMediaChange,
    )
  }

  /* ---------------------------------
     Background
     --------------------------------- */

  loadApiImage()
})

/* =================================
   Unmounted
   ================================= */

onUnmounted(() => {
  clearLoadTimeout()

  if (themeObserver) {
    themeObserver.disconnect()

    themeObserver = null
  }

  if (mediaQuery) {
    if (
      mediaQuery.removeEventListener
    ) {
      mediaQuery.removeEventListener(
        'change',
        handleMediaChange,
      )
    } else {
      mediaQuery.removeListener(
        handleMediaChange,
      )
    }

    mediaQuery = null
  }
})
</script>

<template>
  <div class="background-layer" :class="[
    `theme-${theme}`,
    {
      'is-loaded':
        imageLoaded,

      'is-failed':
        imageFailed,
    },
  ]" aria-hidden="true">
    <!-- =================================
         Background Image
         ================================= -->

    <img v-if="
      !imageFailed &&
      imageSrc
    " class="background-image" :src="imageSrc" alt="" decoding="async" @load="handleImageLoad"
      @error="handleImageError" />

    <!-- =================================
         Dark Overlay
         ================================= -->

    <div class="
        background-tint
        background-tint-dark
      " />

    <!-- =================================
         Light Overlay
         ================================= -->

    <div class="
        background-tint
        background-tint-light
      " />

    <!-- =================================
         Vignette
         ================================= -->

    <div class="
        background-vignette
      " />
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

  background:
    var(--page-background);

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

  object-position:
    center center;

  opacity: 0;

  filter: none;

  transform: none;

  transition:
    opacity 0.65s ease;
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

  transition:
    opacity 0.45s ease;
}

/* =================================
   Dark Overlay
   ================================= */

.background-tint-dark {
  background:
    radial-gradient(circle at 20% 18%,
      rgb(110 78 135 / 7%) 0%,
      transparent 40%),

    linear-gradient(135deg,
      rgb(8 7 15 / 24%),
      rgb(24 17 39 / 28%));
}

/* =================================
   Light Overlay
   ================================= */

.background-tint-light {
  background:
    radial-gradient(circle at 18% 18%,
      rgb(255 255 255 / 22%) 0%,
      transparent 42%),

    radial-gradient(circle at 82% 76%,
      rgb(255 245 250 / 11%) 0%,
      transparent 44%),

    linear-gradient(135deg,
      rgb(255 255 255 / 8%),
      rgb(255 255 255 / 11%));
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
    radial-gradient(ellipse at center,
      transparent 48%,
      rgb(5 4 10 / 9%) 100%);

  transition:
    opacity 0.45s ease,
    background 0.45s ease;
}

/* =================================
   Light Vignette
   ================================= */

.background-layer.theme-light .background-vignette {
  background:
    radial-gradient(ellipse at center,
      transparent 62%,
      rgb(55 42 70 / 4%) 100%);
}

/* =================================
   Mobile
   ================================= */

@media (max-width: 760px) {
  .background-image {
    object-position:
      center center;
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