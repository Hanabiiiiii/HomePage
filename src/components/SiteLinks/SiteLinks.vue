<script setup lang="ts">
import { computed, ref } from 'vue'
import { siteConfig } from '@/config/site'

const pageSize = 5

const currentPage = ref(0)

const direction = ref<'next' | 'previous'>('next')

const totalPages = computed(() => {
  return Math.ceil(
    siteConfig.links.length / pageSize,
  )
})

const currentLinks = computed(() => {
  const start =
    currentPage.value * pageSize

  return siteConfig.links.slice(
    start,
    start + pageSize,
  )
})

const canGoPrevious = computed(() => {
  return currentPage.value > 0
})

const canGoNext = computed(() => {
  return (
    currentPage.value <
    totalPages.value - 1
  )
})

function previousPage() {
  if (!canGoPrevious.value) {
    return
  }

  direction.value = 'previous'
  currentPage.value -= 1
}

function nextPage() {
  if (!canGoNext.value) {
    return
  }

  direction.value = 'next'
  currentPage.value += 1
}

function goToPage(page: number) {
  if (
    page < 0 ||
    page >= totalPages.value ||
    page === currentPage.value
  ) {
    return
  }

  direction.value =
    page > currentPage.value
      ? 'next'
      : 'previous'

  currentPage.value = page
}
</script>

<template>
  <nav class="site-links" aria-label="网站链接">
    <!-- =================================
         Link Area
         ================================= -->

    <div class="site-links__body">
      <div :key="currentPage" class="site-links__page" :class="{
        'site-links__page--next':
          direction === 'next',

        'site-links__page--previous':
          direction === 'previous',
      }">
        <!--
          每页固定 5 个位置。
          后续继续增加网站时自动分页。
        -->

        <div v-for="index in pageSize" :key="index" class="site-links__slot">
          <a v-if="currentLinks[index - 1]" class="site-link liquid-glass" :href="currentLinks[index - 1].url
            " target="_blank" rel="noopener noreferrer">
            <!-- Icon -->

            <span class="site-link__icon" aria-hidden="true">
              {{
                currentLinks[index - 1].icon ||
                '↗'
              }}
            </span>

            <!-- Content -->

            <span class="site-link__content">
              <strong class="site-link__title">
                {{
                  currentLinks[index - 1].title
                }}
              </strong>

              <span v-if="
                currentLinks[index - 1]
                  .description
              " class="site-link__description">
                {{
                  currentLinks[index - 1]
                    .description
                }}
              </span>
            </span>

            <!-- Arrow -->

            <span class="site-link__arrow" aria-hidden="true">
              ↗
            </span>
          </a>
        </div>
      </div>
    </div>

    <!-- =================================
         Pagination
         ================================= -->

    <div v-if="totalPages > 1" class="site-pagination" aria-label="网站链接分页">
      <!-- Previous -->

      <button class="site-pagination__button liquid-glass-button" type="button" :disabled="!canGoPrevious"
        aria-label="上一页" title="上一页" @click="previousPage">
        <svg class="site-pagination__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M14.5 5.5L8 12L14.5 18.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"
            stroke-linejoin="round"></path>
        </svg>
      </button>

      <!-- Dots -->

      <div class="site-pagination__dots" aria-live="polite">
        <button v-for="page in totalPages" :key="page" class="site-pagination__dot" :class="{
          active:
            currentPage === page - 1,
        }" type="button" :aria-label="`第 ${page} 页`" :aria-current="currentPage === page - 1
          ? 'page'
          : undefined
          " @click="
              goToPage(page - 1)
              ">
        </button>
      </div>

      <!-- Next -->

      <button class="site-pagination__button liquid-glass-button" type="button" :disabled="!canGoNext" aria-label="下一页"
        title="下一页" @click="nextPage">
        <svg class="site-pagination__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M9.5 5.5L16 12L9.5 18.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"
            stroke-linejoin="round"></path>
        </svg>
      </button>
    </div>
  </nav>
</template>

<style scoped lang="scss">
/* =================================
   Container
   ================================= */

.site-links {
  display:
    flex;

  flex-direction:
    column;

  width:
    100%;

  min-width:
    0;
}

/* =================================
   Body
   ================================= */

.site-links__body {
  width:
    100%;

  overflow:
    hidden;
}

/* =================================
   Page
   ================================= */

/*
 * 注意：
 * 1. 这里刻意不写 will-change / backface-visibility，
 *    否则父元素会被提升为合成层，子元素的 backdrop-filter 会采样错位。
 * 2. 动画只做 transform 动画（位移 + 缩放），不做 opacity 动画——
 *    opacity 从 0 开始会让模糊"跟着淡入"，
 *    视觉上就像"从透明变成模糊"，而不是一开始就是模糊的玻璃。
 */

.site-links__page {
  display:
    flex;

  flex-direction:
    column;

  gap:
    12px;

  width:
    100%;
}

/* =================================
   Page Transition
   ================================= */

/* next：从右侧"冲"进来，带一点缩小起步 */
.site-links__page--next {
  transform-origin:
    right center;

  animation:
    site-links-slide-from-right 0.5s cubic-bezier(0.16, 1, 0.3, 1) backwards;
}

/* previous：从左侧"冲"进来 */
.site-links__page--previous {
  transform-origin:
    left center;

  animation:
    site-links-slide-from-left 0.5s cubic-bezier(0.16, 1, 0.3, 1) backwards;
}

@keyframes site-links-slide-from-right {
  from {
    transform:
      translate3d(72px, 0, 0) scale(0.92);
  }

  to {
    transform:
      translate3d(0, 0, 0) scale(1);
  }
}

@keyframes site-links-slide-from-left {
  from {
    transform:
      translate3d(-72px, 0, 0) scale(0.92);
  }

  to {
    transform:
      translate3d(0, 0, 0) scale(1);
  }
}

/* =================================
   Slot
   ================================= */

.site-links__slot {
  width:
    100%;

  height:
    74px;

  flex:
    0 0 74px;
}

/* =================================
   Link

   这里明确复用与其他卡片
   完全一致的液态玻璃参数
   ================================= */

.site-link {
  position:
    relative;

  display:
    flex;

  align-items:
    center;

  gap:
    14px;

  width:
    100%;

  height:
    74px;

  min-width:
    0;

  padding:
    16px 18px;

  box-sizing:
    border-box;

  color:
    var(--text-color);

  text-decoration:
    none;

  /*
   * 与全局 .liquid-glass 保持一致
   */

  background:
    var(--glass-background);

  border:
    1px double var(--glass-border);

  border-radius:
    var(--glass-radius);

  backdrop-filter:
    blur(var(--glass-blur)) saturate(var(--glass-saturation));

  -webkit-backdrop-filter:
    blur(var(--glass-blur)) saturate(var(--glass-saturation));

  box-shadow:
    inset 2px -2px 1px -1px var(--glass-highlight),

    inset -2px 2px 1px -1px var(--glass-highlight),

    inset 6px -6px 1px -6px var(--glass-highlight-soft),

    inset -6px 6px 1px -6px var(--glass-highlight-soft),

    inset 0 0 2px rgb(0 0 0 / 16%),

    0 4px 8px var(--glass-shadow);

  transition:
    color 0.35s ease,
    background 0.35s ease,
    border-color 0.35s ease,
    box-shadow 0.35s ease,
    transform 0.25s ease;
}

/*
 * 强制与全局 liquid-glass 的斜向高光一致。
 */

.site-link::after {
  content:
    '';

  position:
    absolute;

  z-index:
    0;

  inset:
    0;

  border-radius:
    inherit;

  background:
    linear-gradient(45deg,
      rgb(255 255 255 / 24%) 0%,
      transparent 18%,
      transparent 82%,
      rgb(255 255 255 / 24%) 100%);

  filter:
    blur(2px);

  pointer-events:
    none;

  transition:
    opacity 0.35s ease;
}

/*
 * 防止全局内容层规则失效。
 */

.site-link>* {
  position:
    relative;

  z-index:
    2;
}

/* =================================
   Hover
   ================================= */

.site-link:hover {
  border-color:
    var(--glass-border-hover);

  box-shadow:
    inset 2px -2px 1px -1px rgb(255 255 255 / 80%),

    inset -2px 2px 1px -1px rgb(255 255 255 / 80%),

    inset 6px -6px 1px -6px rgb(255 255 255 / 45%),

    inset -6px 6px 1px -6px rgb(255 255 255 / 45%),

    inset 0 0 2px rgb(0 0 0 / 18%),

    0 6px 12px rgb(0 0 0 / 14%);

  transform:
    translateY(-2px);
}

/* =================================
   Icon
   ================================= */

.site-link__icon {
  display:
    grid;

  flex:
    0 0 42px;

  width:
    42px;

  height:
    42px;

  place-items:
    center;

  color:
    var(--accent-color);

  font-size:
    20px;

  line-height:
    1;

  background:
    rgb(255 255 255 / 9%);

  border:
    1px solid rgb(255 255 255 / 22%);

  border-radius:
    13px;

  box-shadow:
    inset 1px -1px 1px rgb(255 255 255 / 55%),

    inset -1px 1px 1px rgb(255 255 255 / 18%);

  transition:
    color 0.35s ease,
    background 0.35s ease,
    border-color 0.35s ease,
    box-shadow 0.35s ease,
    transform 0.25s ease;
}

.site-link:hover .site-link__icon {
  background:
    rgb(255 255 255 / 14%);

  border-color:
    rgb(255 255 255 / 34%);

  transform:
    scale(1.03);
}

/* =================================
   Content
   ================================= */

.site-link__content {
  display:
    flex;

  flex:
    1;

  flex-direction:
    column;

  min-width:
    0;

  gap:
    4px;
}

/* =================================
   Title
   ================================= */

.site-link__title {
  overflow:
    hidden;

  color:
    var(--text-color);

  font-size:
    15px;

  font-weight:
    700;

  line-height:
    1.5;

  text-overflow:
    ellipsis;

  white-space:
    nowrap;

  text-shadow:
    var(--text-shadow);

  transition:
    color 0.35s ease,
    text-shadow 0.35s ease;
}

/* =================================
   Description
   ================================= */

.site-link__description {
  overflow:
    hidden;

  color:
    var(--text-secondary);

  font-size:
    12px;

  line-height:
    1.5;

  text-overflow:
    ellipsis;

  white-space:
    nowrap;

  text-shadow:
    var(--text-shadow-secondary);

  transition:
    color 0.35s ease,
    text-shadow 0.35s ease;
}

/* =================================
   Arrow
   ================================= */

.site-link__arrow {
  flex:
    0 0 auto;

  color:
    var(--text-secondary);

  font-size:
    18px;

  line-height:
    1;

  text-shadow:
    var(--text-shadow-secondary);

  transition:
    color 0.35s ease,
    text-shadow 0.35s ease,
    transform 0.25s ease;
}

.site-link:hover .site-link__arrow {
  color:
    var(--accent-color);

  transform:
    translate(2px,
      -2px);
}

/* =================================
   Pagination
   ================================= */

.site-pagination {
  display:
    flex;

  align-items:
    center;

  justify-content:
    center;

  gap:
    12px;

  width:
    100%;

  height:
    34px;

  margin-top:
    8px;

  flex:
    0 0 34px;
}

/* =================================
   Pagination Button
   ================================= */

.site-pagination__button {
  position:
    relative;

  display:
    inline-flex;

  align-items:
    center;

  justify-content:
    center;

  width:
    30px;

  height:
    30px;

  min-width:
    30px;

  min-height:
    30px;

  margin:
    0;

  padding:
    0;

  border-radius:
    50%;

  color:
    var(--text-secondary);

  line-height:
    0;

  transform:
    none !important;

  transition:
    color 0.25s ease,
    background 0.25s ease,
    border-color 0.25s ease,
    box-shadow 0.25s ease,
    transform 0.2s ease;
}

.site-pagination__button:hover:not(:disabled) {
  color:
    var(--accent-color);

  transform:
    scale(1.06) !important;
}

.site-pagination__button:active:not(:disabled) {
  transform:
    scale(0.94) !important;
}

.site-pagination__button:disabled {
  cursor:
    default;

  opacity:
    0.28;
}

/* =================================
   Pagination Icon
   ================================= */

.site-pagination__icon {
  display:
    block;

  width:
    17px;

  height:
    17px;

  flex:
    0 0 17px;

  margin:
    0;

  padding:
    0;

  pointer-events:
    none;
}

/* =================================
   Dots
   ================================= */

.site-pagination__dots {
  display:
    flex;

  align-items:
    center;

  justify-content:
    center;

  gap:
    6px;

  height:
    100%;
}

.site-pagination__dot {
  display:
    block;

  width:
    6px;

  height:
    6px;

  margin:
    0;

  padding:
    0;

  border:
    1px solid var(--glass-border);

  border-radius:
    50%;

  background:
    var(--glass-background);

  opacity:
    0.6;

  cursor:
    pointer;

  transition:
    width 0.25s ease,
    background 0.25s ease,
    border-color 0.25s ease,
    opacity 0.25s ease,
    transform 0.25s ease;
}

.site-pagination__dot:hover {
  opacity:
    1;

  transform:
    scale(1.15);
}

.site-pagination__dot.active {
  width:
    18px;

  border-radius:
    999px;

  border-color:
    var(--accent-color);

  background:
    var(--accent-color);

  opacity:
    0.85;
}

/* =================================
   Light Theme
   ================================= */

:global(html[data-theme='light']) .site-link {
  background:
    var(--glass-background);
}

:global(html[data-theme='light']) .site-link__icon {
  border-color:
    rgb(255 255 255 / 48%);

  background:
    rgb(255 255 255 / 18%);
}

:global(html[data-theme='light']) .site-pagination__dot {
  border-color:
    rgb(255 255 255 / 52%);

  background:
    rgb(255 255 255 / 22%);
}

:global(html[data-theme='light']) .site-pagination__dot.active {
  border-color:
    var(--accent-color);

  background:
    var(--accent-color);
}

/* =================================
   Mobile
   ================================= */

@media (max-width: 760px) {
  .site-links__page {
    gap:
      10px;
  }

  .site-links__slot {
    height:
      70px;

    flex:
      0 0 70px;
  }

  .site-link {
    height:
      70px;

    gap:
      12px;

    padding:
      14px;
  }

  .site-link__icon {
    flex:
      0 0 38px;

    width:
      38px;

    height:
      38px;

    font-size:
      18px;
  }

  .site-link__title {
    font-size:
      14px;
  }

  .site-link__description {
    font-size:
      11px;
  }

  .site-link__arrow {
    font-size:
      18px;
  }

  .site-pagination {
    margin-top:
      6px;
  }

  /* 移动端：位移减小、缩放幅度减小，避免小屏显得"跳" */
  .site-links__page--next {
    animation:
      site-links-slide-from-right 0.42s cubic-bezier(0.16, 1, 0.3, 1) backwards;
  }

  .site-links__page--previous {
    animation:
      site-links-slide-from-left 0.42s cubic-bezier(0.16, 1, 0.3, 1) backwards;
  }

  @keyframes site-links-slide-from-right {
    from {
      transform:
        translate3d(48px, 0, 0) scale(0.95);
    }

    to {
      transform:
        translate3d(0, 0, 0) scale(1);
    }
  }

  @keyframes site-links-slide-from-left {
    from {
      transform:
        translate3d(-48px, 0, 0) scale(0.95);
    }

    to {
      transform:
        translate3d(0, 0, 0) scale(1);
    }
  }
}

/* =================================
   Small Mobile
   ================================= */

@media (max-width: 420px) {
  .site-link {
    gap:
      10px;

    padding:
      13px;
  }
}

/* =================================
   Reduced Motion
   ================================= */

@media (prefers-reduced-motion: reduce) {

  .site-link,
  .site-link__icon,
  .site-link__title,
  .site-link__description,
  .site-link__arrow,
  .site-pagination__button,
  .site-pagination__dot {
    transition:
      none;
  }

  .site-links__page--next,
  .site-links__page--previous {
    animation:
      none;
  }

  .site-link:hover,
  .site-link:hover .site-link__icon,
  .site-link:hover .site-link__arrow {
    transform:
      none;
  }
}
</style>