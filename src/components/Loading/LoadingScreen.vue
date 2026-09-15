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

/*
 * 波浪文字：把 Loading 拆成字母数组。
 *
 * 用常量而不是在模板里 split，
 * 避免每次渲染都重新创建数组。
 */
const loadingText = 'Loading'

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
  <!--
    关键：显式告诉 Vue 这次 leave 需要 1000ms 才移除元素。

    否则 Vue 会读根元素的 transition-duration，
    读到 0s 就立刻把整屏从 DOM 移除，
    子元素的过渡根本来不及播放。
  -->
  <Transition name="loading-splash" :duration="{ enter: 400, leave: 1000 }">
    <div v-if="visible" class="loading-screen" aria-label="页面正在加载" aria-live="polite">
      <!-- =================================
           左右两块幕布

           纯色，不透明，无 backdrop-filter。
           两块颜色完全一致，不可能出现分界。
           ================================= -->

      <div class="loading-curtain loading-curtain--left" aria-hidden="true" />

      <div class="loading-curtain loading-curtain--right" aria-hidden="true" />

      <!-- =================================
           内容层
           ================================= -->

      <div class="loading-content">
        <!-- 波浪文字 -->

        <p class="loading-title" aria-label="Loading">
          <span v-for="(char, index) in loadingText" :key="index" class="loading-letter" aria-hidden="true" :style="{
            animationDelay: `${index * 0.09}s`,
          }">
            {{ char }}
          </span>
        </p>

        <!-- 副标题 -->

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

/*
 * 屏幕本身负责"整块模糊"。
 *
 * 全屏一次采样，没有分界。
 * 幕布拉开后，看到的就是这一层。
 */

.loading-screen {
  position: fixed;

  inset: 0;

  z-index: 1000;

  overflow: hidden;

  /*
   * 建立独立层叠上下文，
   * 避免幕布拉开时和主页的玻璃层叠关系冲突。
   */
  isolation: isolate;

  /*
   * 整块屏幕做模糊。
   *
   * 因为是一整块元素做 backdrop-filter，
   * 采样区域覆盖全屏，
   * 不可能出现"左右两半色差"的问题。
   */
  backdrop-filter:
    blur(20px) saturate(140%);

  -webkit-backdrop-filter:
    blur(20px) saturate(140%);

  will-change: opacity;
}

/* =================================
   Curtain
   ================================= */

/*
 * 幕布是"半透明叠加色"。
 *
 * 不再自己做 backdrop-filter，
 * 只是叠加在屏幕的模糊层之上。
 *
 * 两块幕布用的是同一个 color-mix 表达式，
 * 值完全一致，中间不会有分界线。
 */

.loading-curtain {
  position: absolute;

  top: 0;
  bottom: 0;

  /*
   * 精确 50%，不重叠。
   */
  width: 50%;

  /*
   * 半透明叠加色。
   *
   * 60% 让幕布看起来"够实"，
   * 剩下的 40% 透出屏幕的模糊层。
   */
  background:
    color-mix(in srgb,
      var(--page-background) 60%,
      transparent);

  /*
   * 让 transform 动画跑在合成层。
   */
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

  will-change:
    transform,
    opacity;
}

/* =================================
   Title
   ================================= */

.loading-title {
  display: flex;

  align-items: center;

  justify-content: center;

  /* 让字母之间的位移有富余空间 */
  padding-bottom: 10px;

  margin: 0;

  color:
    var(--text-color);

  font-size:
    42px;

  font-weight:
    700;

  line-height:
    1;

  letter-spacing:
    0.02em;

  text-shadow:
    var(--text-shadow);

  transition:
    color 0.35s ease,
    text-shadow 0.35s ease;
}

/* =================================
   Letter
   ================================= */

.loading-letter {
  display: inline-block;

  /*
   * 每个字母独立做波浪，
   * 通过 animationDelay 错开时间。
   */
  animation:
    loading-wave 1.5s ease-in-out infinite;

  will-change:
    transform,
    opacity;

  transform-origin:
    center bottom;
}

/* =================================
   Subtitle
   ================================= */

.loading-subtitle {
  margin:
    14px 0 0;

  color:
    var(--text-secondary);

  font-size:
    13px;

  line-height:
    1.6;

  letter-spacing:
    0.05em;

  text-shadow:
    var(--text-shadow-secondary);

  transition:
    color 0.35s ease,
    text-shadow 0.35s ease;
}

/* =================================
   Keyframes — Letter Wave
   ================================= */

@keyframes loading-wave {

  0%,
  60%,
  100% {
    transform:
      translateY(0) scale(1);

    opacity:
      0.55;
  }

  30% {
    transform:
      translateY(-12px) scale(1.06);

    opacity:
      1;
  }
}

/* =================================
   Splash Transition — Enter
   ================================= */

/*
 * 首屏 visible 初始就是 true，
 * 一般不会走 enter。
 *
 * 保留一份，以防某些场景重新挂载。
 */

.loading-splash-enter-active {
  transition:
    opacity 0.4s ease;
}

.loading-splash-enter-from {
  opacity:
    0;
}

/* =================================
   Splash Transition — Leave
   ================================= */

/*
 * 退场时间轴：
 *
 * 0.00s ─┬─ 内容开始淡出 + 轻微上浮（0.28s）
 *        │
 * 0.18s ─┼─ 左右幕布向两侧滑走（0.7s）
 *        │
 * 0.28s ─┤  内容完全消失
 *        │
 * 0.50s ─┼─ 整块屏幕（含模糊层）开始淡出（0.5s）
 *        │
 * 0.88s ─┤  幕布完全滑出，露出完整模糊层
 *        │
 * 1.00s ─┴─ 屏幕完全淡出，露出主页
 */

.loading-splash-leave-active {
  /*
   * 屏幕自身的淡出，延迟 0.5s 开始。
   */
  transition:
    opacity 0.5s ease 0.5s;
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
  opacity:
    0;
}

.loading-splash-leave-to .loading-content {
  opacity:
    0;

  transform:
    translateY(-8px) scale(0.985);
}

.loading-splash-leave-to .loading-curtain--left {
  transform:
    translate3d(-100%, 0, 0);
}

.loading-splash-leave-to .loading-curtain--right {
  transform:
    translate3d(100%, 0, 0);
}

/* =================================
   Mobile
   ================================= */

@media (max-width: 420px) {
  .loading-title {
    font-size:
      34px;

    padding-bottom:
      8px;
  }

  .loading-subtitle {
    margin-top:
      12px;

    font-size:
      12px;
  }

  @keyframes loading-wave {

    0%,
    60%,
    100% {
      transform:
        translateY(0) scale(1);

      opacity:
        0.55;
    }

    30% {
      transform:
        translateY(-10px) scale(1.06);

      opacity:
        1;
    }
  }

  /* 小屏：时长稍短一点，节奏更紧凑 */
  .loading-splash-leave-active {
    transition:
      opacity 0.4s ease 0.5s;
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

  /* 移动端 blur 减小，避免低端机掉帧 */
  .loading-screen {
    backdrop-filter:
      blur(14px) saturate(130%);

    -webkit-backdrop-filter:
      blur(14px) saturate(130%);
  }
}

/* =================================
   Reduced Motion
   ================================= */

@media (prefers-reduced-motion: reduce) {

  .loading-letter {
    animation:
      none;

    transform:
      none;

    opacity:
      1;
  }

  /*
   * 关掉动效时，不再"左右拉开"，
   * 直接整体淡出。
   */
  .loading-splash-leave-active,
  .loading-splash-leave-active .loading-content,
  .loading-splash-leave-active .loading-curtain--left,
  .loading-splash-leave-active .loading-curtain--right {
    transition:
      opacity 0.3s ease;
  }

  .loading-splash-leave-to {
    opacity:
      0;
  }

  .loading-splash-leave-to .loading-curtain--left,
  .loading-splash-leave-to .loading-curtain--right {
    transform:
      none;
  }
}
</style>