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
   Loading 状态
   ===================================================== */

const visible = ref(true)

/* =====================================================
   全局请求监听
   ===================================================== */

/*
 * 不主动发起接口请求。
 *
 * 这里只监听页面原本已经发起的 fetch，
 * 避免 LoadingScreen 自己再次请求 API。
 */

const originalFetch =
  window.fetch.bind(window)

let pendingRequests = 0

let isTracking = true

/*
 * 是否为天气接口。
 *
 * 天气明确不参与首屏 Loading。
 */

function isWeatherRequest(
  input: RequestInfo | URL,
) {
  let url = ''

  if (typeof input === 'string') {
    url = input
  } else if (input instanceof URL) {
    url = input.href
  } else {
    url = input.url
  }

  return url.startsWith(
    siteConfig.weather.api,
  )
}

/*
 * 判断是否仍有页面初始化请求。
 */

function hasPendingRequests() {
  return pendingRequests > 0
}

/*
 * 替换 fetch。
 *
 * LoadingScreen 在 setup 阶段就执行，
 * 因此可以捕获后续组件 onMounted 中
 * 发起的 Hitokoto / Music / Lyrics 请求。
 */

window.fetch = (
  async function (
    input: RequestInfo | URL,
    init?: RequestInit,
  ) {
    /*
     * Loading 已经结束后，
     * 不再继续统计请求。
     */

    if (
      !isTracking ||
      isWeatherRequest(input)
    ) {
      return originalFetch(
        input,
        init,
      )
    }

    pendingRequests++

    try {
      return await originalFetch(
        input,
        init,
      )
    } finally {
      pendingRequests--

      /*
       * 防止异常情况下出现负数。
       */

      if (pendingRequests < 0) {
        pendingRequests = 0
      }
    }
  } as typeof window.fetch
)

/* =====================================================
   图片加载
   ===================================================== */

/*
 * 等待当前页面已经进入 DOM 的图片。
 *
 * lazy 图片不参与首屏阻塞，
 * 避免社交图标等懒加载资源导致 Loading 永远不消失。
 */

async function waitForImages() {
  const images =
    Array.from(
      document.images,
    ).filter(
      (image) =>
        image.loading !== 'lazy',
    )

  if (images.length === 0) {
    return
  }

  await Promise.all(
    images.map(
      (image) =>
        new Promise<void>(
          (resolve) => {
            /*
             * 已完成加载。
             */

            if (
              image.complete
            ) {
              resolve()
              return
            }

            /*
             * 正常加载完成。
             */

            const handleLoad = () => {
              cleanup()
              resolve()
            }

            /*
             * 图片加载失败也不能让 Loading 永久卡住。
             */

            const handleError = () => {
              cleanup()
              resolve()
            }

            const cleanup = () => {
              image.removeEventListener(
                'load',
                handleLoad,
              )

              image.removeEventListener(
                'error',
                handleError,
              )
            }

            image.addEventListener(
              'load',
              handleLoad,
              {
                once: true,
              },
            )

            image.addEventListener(
              'error',
              handleError,
              {
                once: true,
              },
            )
          },
        ),
    ),
  )
}

/* =====================================================
   浏览器布局稳定
   ===================================================== */

/*
 * 等待 Vue DOM 更新 + 浏览器完成布局。
 */

async function waitForLayout() {
  await nextTick()

  /*
   * 第一帧：
   * 让 Vue / DOM 更新进入浏览器渲染周期。
   */

  await new Promise<void>(
    (resolve) => {
      requestAnimationFrame(() => {
        resolve()
      })
    },
  )

  /*
   * 第二帧：
   * 给图片、字体、CSS 和布局变化
   * 留出一个完整渲染周期。
   */

  await new Promise<void>(
    (resolve) => {
      requestAnimationFrame(() => {
        resolve()
      })
    },
  )
}

/* =====================================================
   字体
   ===================================================== */

/*
 * 等待字体加载完成。
 *
 * 如果浏览器不支持 document.fonts，
 * 直接跳过。
 */

async function waitForFonts() {
  if (
    !document.fonts ||
    !document.fonts.ready
  ) {
    return
  }

  try {
    await document.fonts.ready
  } catch {
    /*
     * 字体失败不阻塞首屏。
     */
  }
}

/* =====================================================
   首屏稳定检查
   ===================================================== */

/*
 * 不能看到 pendingRequests === 0
 * 就立刻关闭 Loading。
 *
 * 例如：
 *
 * Music Playlist 请求结束
 *          ↓
 * Vue watch 响应
 *          ↓
 * 开始请求歌词
 *
 * 所以这里必须再等待几个渲染周期确认。
 */

async function waitForStablePage() {
  /*
   * 等待 Vue 更新。
   */

  await nextTick()

  /*
   * 等待字体。
   */

  await waitForFonts()

  /*
   * 等待图片。
   */

  await waitForImages()

  /*
   * 等待浏览器布局。
   */

  await waitForLayout()

  /*
   * 再检查一次请求。
   */

  if (
    hasPendingRequests()
  ) {
    return false
  }

  /*
   * 再延迟一个微任务，
   * 防止 watch / Promise.then
   * 在当前任务末尾继续发起请求。
   */

  await Promise.resolve()

  if (
    hasPendingRequests()
  ) {
    return false
  }

  /*
   * 再等待一帧。
   *
   * 这样可以捕获：
   *
   * API 完成
   * → Vue 更新
   * → watch
   * → 新请求
   */

  await new Promise<void>(
    (resolve) => {
      requestAnimationFrame(() => {
        resolve()
      })
    },
  )

  return !hasPendingRequests()
}

/* =====================================================
   结束 Loading
   ===================================================== */

let finishTimer:
  number | undefined

let destroyed = false

async function finishLoadingWhenReady() {
  /*
   * 最多检查几轮。
   *
   * 防止某个组件因为异常不断创建请求，
   * 导致 Loading 一直死循环。
   */

  for (
    let attempt = 0;
    attempt < 20;
    attempt++
  ) {
    if (destroyed) {
      return
    }

    const stable =
      await waitForStablePage()

    if (stable) {
      /*
       * 再给浏览器一个极短的稳定窗口。
       */

      await new Promise<void>(
        (resolve) => {
          finishTimer =
            window.setTimeout(
              resolve,
              50,
            )
        },
      )

      if (
        destroyed ||
        hasPendingRequests()
      ) {
        continue
      }

      /*
       * 正式结束 Loading。
       */

      isTracking = false

      visible.value = false

      /*
       * 同步更新原来的 Pinia 状态，
       * 这样其他地方如果使用 isLoading
       * 也会得到正确状态。
       */

      appStore.finishLoading()

      return
    }

    /*
     * 当前还有请求，
     * 下一轮继续检查。
     */

    await new Promise<void>(
      (resolve) => {
        requestAnimationFrame(() => {
          resolve()
        })
      },
    )
  }

  /*
   * 理论上的兜底。
   *
   * 即使某个接口持续异常，
   * 也不会让整个页面永远卡在 Loading。
   */

  if (
    !destroyed
  ) {
    isTracking = false

    visible.value = false

    appStore.finishLoading()
  }
}

/* =====================================================
   Mounted
   ===================================================== */

onMounted(() => {
  void finishLoadingWhenReady()
})

/* =====================================================
   Unmounted
   ===================================================== */

onUnmounted(() => {
  destroyed = true

  isTracking = false

  /*
   * 恢复原始 fetch。
   */

  window.fetch =
    originalFetch

  if (
    finishTimer !== undefined
  ) {
    window.clearTimeout(
      finishTimer,
    )

    finishTimer = undefined
  }
})
</script>

<template>
  <Transition name="loading-fade">
    <div v-if="visible" class="loading-screen" aria-label="页面正在加载" aria-live="polite">
      <div class="loading-backdrop" />

      <div class="loading-content liquid-glass">
        <div class="loading-dots">
          <span />
          <span />
          <span />
        </div>

        <p class="loading-title">
          Loading
        </p>

        <p class="loading-subtitle">
          正在准备页面资源
        </p>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.loading-screen {
  position: fixed;

  inset: 0;

  z-index: 1000;

  display: grid;

  place-items: center;

  overflow: hidden;

  background:
    var(--page-background);
}

.loading-backdrop {
  position: absolute;

  inset: 0;

  pointer-events: none;

  background:
    linear-gradient(180deg,
      rgb(255 255 255 / 8%),
      rgb(255 255 255 / 3%));

  backdrop-filter:
    blur(8px);

  -webkit-backdrop-filter:
    blur(8px);
}

.loading-content {
  position: relative;

  z-index: 2;

  display: flex;

  flex-direction: column;

  align-items: center;

  justify-content: center;

  width:
    min(calc(100% - 40px),
      320px);

  min-height:
    180px;

  padding:
    28px 30px;

  box-sizing:
    border-box;

  text-align:
    center;

  color:
    var(--text-color);

  animation:
    loading-card-in 0.45s ease-out both;
}

/* =================================
   Loading Dots
   ================================= */

.loading-dots {
  display:
    flex;

  align-items:
    center;

  justify-content:
    center;

  gap:
    8px;

  margin-bottom:
    18px;
}

.loading-dots span {
  width:
    9px;

  height:
    9px;

  border-radius:
    50%;

  background:
    var(--accent-color);

  animation:
    loading-bounce 1.2s infinite ease-in-out;
}

.loading-dots span:nth-child(2) {
  animation-delay:
    0.15s;
}

.loading-dots span:nth-child(3) {
  animation-delay:
    0.3s;
}

/* =================================
   Title
   ================================= */

.loading-title {
  margin:
    0;

  color:
    var(--text-color);

  font-size:
    20px;

  font-weight:
    700;

  line-height:
    1.4;

  letter-spacing:
    0.04em;

  text-shadow:
    var(--text-shadow);
}

/* =================================
   Subtitle
   ================================= */

.loading-subtitle {
  margin:
    8px 0 0;

  color:
    var(--text-secondary);

  font-size:
    13px;

  line-height:
    1.6;

  text-shadow:
    var(--text-shadow-secondary);
}

/* =================================
   Card Enter
   ================================= */

@keyframes loading-card-in {
  from {
    opacity:
      0;

    transform:
      translateY(10px) scale(0.98);
  }

  to {
    opacity:
      1;

    transform:
      translateY(0) scale(1);
  }
}

/* =================================
   Dot Animation
   ================================= */

@keyframes loading-bounce {

  0%,
  80%,
  100% {
    transform:
      scale(0.65);

    opacity:
      0.45;
  }

  40% {
    transform:
      scale(1);

    opacity:
      1;
  }
}

/* =================================
   Fade
   ================================= */

.loading-fade-enter-active,
.loading-fade-leave-active {
  transition:
    opacity 0.35s ease;
}

.loading-fade-enter-from,
.loading-fade-leave-to {
  opacity:
    0;
}

/* =================================
   Mobile
   ================================= */

@media (max-width: 420px) {
  .loading-content {
    width:
      calc(100% - 32px);

    min-height:
      160px;

    padding:
      24px;
  }

  .loading-title {
    font-size:
      19px;
  }

  .loading-subtitle {
    font-size:
      12px;
  }
}

/* =================================
   Reduced Motion
   ================================= */

@media (prefers-reduced-motion: reduce) {
  .loading-content {
    animation:
      none;
  }

  .loading-dots span {
    animation:
      none;

    opacity:
      0.8;
  }

  .loading-fade-enter-active,
  .loading-fade-leave-active {
    transition:
      none;
  }
}
</style>