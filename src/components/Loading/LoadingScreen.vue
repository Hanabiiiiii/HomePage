<script setup lang="ts">
import {
  nextTick,
  onMounted,
  onUnmounted,
  ref,
} from 'vue'

import { siteConfig } from '@/config/site'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()

/* =====================================================
   常量
   ===================================================== */

const MAX_LOADING_MS = 42000

/* 字体整体超时：字体就绪前不阻塞关 Loading 太久 */
const FONT_TIMEOUT_MS = 4000

/* 非背景图片独立超时 */
const IMAGE_TIMEOUT_MS = 3000

/* 连续多少帧稳定才认定"页面就绪" */
const STABLE_FRAMES = 3

/* 每一轮之间的小睡眠，避免忙等 */
const CHECK_INTERVAL_MS = 30

/*
 * Loading 文字淡入前，最多等字体多久。
 *
 * - 字体在这个时间内就绪 → Loading 文字用正确字体淡入
 * - 字体超时 → 用 fallback 淡入（避免 Loading 空白太久）
 */
const FONT_FADE_IN_MAX_WAIT_MS = 800

/* =====================================================
   状态
   ===================================================== */

const visible = ref(true)

/* Loading 文字是否已经可以淡入 */
const contentReady = ref(false)

const loadingText = 'Loading'

/* =====================================================
   关键字体 —— 顶层立即触发
   =====================================================

   在 <script setup> 顶层调用（而不是 onMounted 里），
   让字体请求在 Vue 组件实例化时立刻发出。

   - 拉丁区用空字符串
   - CJK 区传入"正在准备页面资源"，只下载对应分区
   - Pacifico 也要拉，ProfileCard 的昵称用它
   ===================================================== */

const CRITICAL_CJK_TEXT = '正在准备页面资源'

const CRITICAL_SPECS: Array<[string, string?]> = [
  ['400 16px "LXGW WenKai"'],
  ['400 16px "LXGW WenKai"', CRITICAL_CJK_TEXT],
  ['400 16px "Pacifico"'],
]

function triggerFontLoad(): Promise<void> {
  if (typeof document === 'undefined' || !document.fonts) {
    return Promise.resolve()
  }

  const jobs = CRITICAL_SPECS.map(([spec, text]) =>
    document.fonts.load(spec, text).catch(() => undefined),
  )

  return Promise.all(jobs).then(() => undefined)
}

/*
 * 顶层立即触发 —— 不 await，只是让请求尽早发出。
 */
const initialFontPromise = triggerFontLoad()

/* =====================================================
   全局 fetch 拦截
   ===================================================== */

const originalFetch = window.fetch.bind(window)

let pendingRequests = 0
let isTracking = true

function isWeatherRequest(input: RequestInfo | URL) {
  let url = ''
  if (typeof input === 'string') url = input
  else if (input instanceof URL) url = input.href
  else url = input.url
  return url.startsWith(siteConfig.weather.api)
}

function hasPendingRequests() {
  return pendingRequests > 0
}

window.fetch = (async function (
  input: RequestInfo | URL,
  init?: RequestInit,
) {
  if (!isTracking || isWeatherRequest(input)) {
    return originalFetch(input, init)
  }

  pendingRequests++
  try {
    return await originalFetch(input, init)
  } finally {
    pendingRequests--
    if (pendingRequests < 0) pendingRequests = 0
  }
} as typeof window.fetch)

/* =====================================================
   工具
   ===================================================== */

function nextFrame(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => resolve())
  })
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
): Promise<T | void> {
  return Promise.race([
    promise,
    new Promise<void>((resolve) => {
      window.setTimeout(resolve, ms)
    }),
  ])
}

/* =====================================================
   字体等待
   ===================================================== */

async function waitForFonts() {
  if (!document.fonts) return

  try {
    const jobs: Promise<unknown>[] = [
      /* fonts.ready 兜底 */
      document.fonts.ready.then(() => undefined),
      /* 复用顶层已经触发的加载 */
      initialFontPromise,
    ]

    await withTimeout(
      Promise.all(jobs).then(() => undefined),
      FONT_TIMEOUT_MS,
    )
  } catch {
    /* 字体整体超时，不阻塞 */
  }
}

/* =====================================================
   图片等待
   ===================================================== */

async function waitForImages() {
  const images = Array.from(document.images).filter(
    (image) =>
      image.loading !== 'lazy' &&
      !image.classList.contains('background-image'),
  )

  if (images.length === 0) return

  const loadAll = Promise.all(
    images.map(
      (image) =>
        new Promise<void>((resolve) => {
          if (image.complete) {
            resolve()
            return
          }

          const done = () => {
            image.removeEventListener('load', done)
            image.removeEventListener('error', done)
            resolve()
          }

          image.addEventListener('load', done, { once: true })
          image.addEventListener('error', done, { once: true })
        }),
    ),
  )

  await withTimeout(loadAll, IMAGE_TIMEOUT_MS)
}

/* =====================================================
   背景等待
   ===================================================== */

function isBackgroundReady() {
  return appStore.isBackgroundReady
}

/* =====================================================
   单次稳定检查
   ===================================================== */

async function checkStableOnce(): Promise<boolean> {
  await nextTick()

  await Promise.all([
    waitForFonts(),
    waitForImages(),
  ])

  for (let i = 0; i < STABLE_FRAMES; i++) {
    if (hasPendingRequests()) return false
    if (!isBackgroundReady()) return false

    await nextFrame()
  }

  return !hasPendingRequests() && isBackgroundReady()
}

/* =====================================================
   关闭 Loading
   ===================================================== */

let hardTimer: number | undefined
let destroyed = false

function clearTimers() {
  if (hardTimer !== undefined) {
    window.clearTimeout(hardTimer)
    hardTimer = undefined
  }
}

function closeLoading() {
  if (destroyed) return

  clearTimers()

  isTracking = false
  visible.value = false
  appStore.finishLoading()
}

/* =====================================================
   主流程
   ===================================================== */

async function finishLoadingWhenReady() {
  const hardTimeout = new Promise<'timeout'>((resolve) => {
    hardTimer = window.setTimeout(() => {
      resolve('timeout')
    }, MAX_LOADING_MS)
  })

  const waitReady = (async (): Promise<'ready' | 'timeout'> => {
    const deadline = Date.now() + MAX_LOADING_MS

    while (Date.now() < deadline && !destroyed) {
      const stable = await checkStableOnce()

      if (stable) {
        await sleep(CHECK_INTERVAL_MS)

        if (destroyed) return 'timeout'

        if (!hasPendingRequests() && isBackgroundReady()) {
          return 'ready'
        }
      }

      await sleep(CHECK_INTERVAL_MS)
    }

    return 'timeout'
  })()

  await Promise.race([waitReady, hardTimeout])

  closeLoading()
}

/* =====================================================
   Loading 文字淡入
   =====================================================

   字体就绪 → 淡入（观感最佳）
   字体超时 → 也用 fallback 淡入（避免 Loading 空白太久）
   ===================================================== */

async function revealLoadingContent() {
  const fontReady = Promise.race([
    initialFontPromise.then(() => 'ready' as const),
    sleep(FONT_FADE_IN_MAX_WAIT_MS).then(() => 'timeout' as const),
  ])

  await fontReady

  if (destroyed) return

  contentReady.value = true
}

/* =====================================================
   Mounted / Unmounted
   ===================================================== */

onMounted(() => {
  void revealLoadingContent()
  void finishLoadingWhenReady()
})

onUnmounted(() => {
  destroyed = true
  isTracking = false
  window.fetch = originalFetch
  clearTimers()
})
</script>

<template>
  <Transition
    name="loading-splash"
    :duration="{ enter: 400, leave: 1000 }"
  >
    <div
      v-if="visible"
      class="loading-screen"
      aria-label="页面正在加载"
      aria-live="polite"
    >
      <div
        class="loading-curtain loading-curtain--left"
        aria-hidden="true"
      />

      <div
        class="loading-curtain loading-curtain--right"
        aria-hidden="true"
      />

      <div
        class="loading-content"
        :class="{ 'is-ready': contentReady }"
      >
        <p class="loading-title" aria-label="Loading">
          <span
            v-for="(char, index) in loadingText"
            :key="index"
            class="loading-letter"
            aria-hidden="true"
            :style="{
              animationDelay: `${index * 0.09}s`,
            }"
          >
            {{ char }}
          </span>
        </p>

        <p class="loading-subtitle">
          正在准备页面资源
        </p>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* =================================
   Screen
   ================================= */

.loading-screen {
  position: fixed;

  inset: 0;

  z-index: 1000;

  overflow: hidden;

  isolation: isolate;

  backdrop-filter:
    blur(20px) saturate(140%);

  -webkit-backdrop-filter:
    blur(20px) saturate(140%);

  will-change: opacity;
}

/* =================================
   Curtain
   ================================= */

.loading-curtain {
  position: absolute;

  top: 0;
  bottom: 0;

  width: 50%;

  background:
    color-mix(
      in srgb,
      var(--page-background) 60%,
      transparent
    );

  will-change: transform;

  backface-visibility: hidden;
}

.loading-curtain--left {
  left: 0;
}

.loading-curtain--right {
  right: 0;
}

/* =================================
   Content
   =================================

   字体就绪前：opacity 0（不可见，但占据布局）
   字体就绪后：淡入

   这样用户不会看到字体从 fallback 跳到 LXGW WenKai。
   ================================= */

.loading-content {
  position: absolute;

  inset: 0;

  z-index: 2;

  display: flex;

  flex-direction: column;

  align-items: center;

  justify-content: center;

  padding: 0 24px;

  box-sizing: border-box;

  text-align: center;

  /* 关键：等字体 */
  opacity: 0;

  transform: translateY(6px);

  transition:
    opacity 0.35s ease,
    transform 0.35s ease;

  will-change:
    transform,
    opacity;
}

.loading-content.is-ready {
  opacity: 1;
  transform: translateY(0);
}

/* =================================
   Title
   ================================= */

.loading-title {
  display: flex;

  align-items: center;

  justify-content: center;

  padding-bottom: 10px;

  margin: 0;

  font-family:
    'LXGW WenKai',
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    'Microsoft YaHei',
    sans-serif;

  color: var(--text-color);

  font-size: 42px;

  font-weight: 700;

  line-height: 1;

  letter-spacing: 0.02em;

  text-shadow: var(--text-shadow);

  transition:
    color 0.35s ease,
    text-shadow 0.35s ease;
}

/* =================================
   Letter
   ================================= */

.loading-letter {
  display: inline-block;

  animation:
    loading-wave 1.5s ease-in-out infinite;

  will-change:
    transform,
    opacity;

  transform-origin: center bottom;
}

/* =================================
   Subtitle
   ================================= */

.loading-subtitle {
  margin: 14px 0 0;

  font-family:
    'LXGW WenKai',
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    'Microsoft YaHei',
    sans-serif;

  color: var(--text-secondary);

  font-size: 13px;

  line-height: 1.6;

  letter-spacing: 0.05em;

  text-shadow:
    var(--text-shadow-secondary);

  transition:
    color 0.35s ease,
    text-shadow 0.35s ease;
}

/* =================================
   Keyframes
   ================================= */

@keyframes loading-wave {
  0%,
  60%,
  100% {
    transform: translateY(0) scale(1);
    opacity: 0.55;
  }

  30% {
    transform: translateY(-12px) scale(1.06);
    opacity: 1;
  }
}

/* =================================
   Transition
   ================================= */

.loading-splash-enter-active {
  transition: opacity 0.4s ease;
}

.loading-splash-enter-from {
  opacity: 0;
}

.loading-splash-leave-active {
  transition: opacity 0.5s ease 0.5s;
}

.loading-splash-leave-active .loading-content {
  transition:
    opacity 0.28s ease,
    transform 0.28s ease;
}

.loading-splash-leave-active .loading-curtain--left,
.loading-splash-leave-active .loading-curtain--right {
  transition:
    transform 0.7s cubic-bezier(0.65, 0, 0.35, 1) 0.18s;
}

.loading-splash-leave-to {
  opacity: 0;
}

.loading-splash-leave-to .loading-content {
  opacity: 0;
  transform: translateY(-8px) scale(0.985);
}

.loading-splash-leave-to .loading-curtain--left {
  transform: translate3d(-100%, 0, 0);
}

.loading-splash-leave-to .loading-curtain--right {
  transform: translate3d(100%, 0, 0);
}

/* =================================
   Mobile
   ================================= */

@media (max-width: 420px) {
  .loading-title {
    font-size: 34px;
    padding-bottom: 8px;
  }

  .loading-subtitle {
    margin-top: 12px;
    font-size: 12px;
  }

  @keyframes loading-wave {
    0%,
    60%,
    100% {
      transform: translateY(0) scale(1);
      opacity: 0.55;
    }

    30% {
      transform: translateY(-10px) scale(1.06);
      opacity: 1;
    }
  }

  .loading-splash-leave-active {
    transition: opacity 0.4s ease 0.5s;
  }

  .loading-splash-leave-active .loading-content {
    transition:
      opacity 0.24s ease,
      transform 0.24s ease;
  }

  .loading-splash-leave-active .loading-curtain--left,
  .loading-splash-leave-active .loading-curtain--right {
    transition:
      transform 0.6s cubic-bezier(0.65, 0, 0.35, 1) 0.16s;
  }

  .loading-screen {
    backdrop-filter: blur(14px) saturate(130%);
    -webkit-backdrop-filter: blur(14px) saturate(130%);
  }
}

/* =================================
   Reduced Motion
   ================================= */

@media (prefers-reduced-motion: reduce) {
  .loading-letter {
    animation: none;
    transform: none;
    opacity: 1;
  }

  .loading-content {
    transition: none;
    opacity: 1;
    transform: none;
  }

  .loading-splash-leave-active,
  .loading-splash-leave-active .loading-content,
  .loading-splash-leave-active .loading-curtain--left,
  .loading-splash-leave-active .loading-curtain--right {
    transition: opacity 0.3s ease;
  }

  .loading-splash-leave-to {
    opacity: 0;
  }

  .loading-splash-leave-to .loading-curtain--left,
  .loading-splash-leave-to .loading-curtain--right {
    transform: none;
  }
}
</style>