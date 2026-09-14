<script setup lang="ts">
import {
    onMounted,
    onUnmounted,
    ref,
} from 'vue'

import { siteConfig } from '@/config/site'

interface HitokotoResponse {
    hitokoto?: string
    from?: string
    from_who?: string | null
}

interface CachedHitokoto {
    text: string
    source?: string
    createdAt?: number
}

/* =================================
   本地备用句子
   ================================= */

const fallbackSentences: CachedHitokoto[] = [
    {
        text: '保持热爱，奔赴山海。',
    },
    {
        text: '愿你走出半生，归来仍是少年。',
    },
    {
        text: '生活明朗，万物可爱。',
    },
    {
        text: '慢慢变好，才是给自己最好的礼物。',
    },
    {
        text: '心之所向，素履以往。',
    },
]

/* =================================
   当前一言
   ================================= */

const currentHitokoto = ref<CachedHitokoto>({
    text: fallbackSentences[0].text,
})

const isLoading = ref(false)
const isChanging = ref(false)
const isOffline = ref(false)

/* =================================
   Timer
   ================================= */

let refreshInterval: number | undefined
let changeTimer: number | undefined
let requestController: AbortController | null = null

let isUnmounted = false

/* =================================
   获取缓存
   ================================= */

function getCache(): CachedHitokoto[] {
    try {
        const rawCache = localStorage.getItem(
            siteConfig.hitokoto.cacheKey,
        )

        if (!rawCache) {
            return []
        }

        const parsedCache: unknown = JSON.parse(rawCache)

        if (!Array.isArray(parsedCache)) {
            return []
        }

        return parsedCache.filter(
            (item): item is CachedHitokoto => {
                return (
                    typeof item === 'object' &&
                    item !== null &&
                    'text' in item &&
                    typeof item.text === 'string' &&
                    item.text.trim().length > 0
                )
            },
        )
    } catch {
        return []
    }
}

/* =================================
   保存缓存
   ================================= */

function saveCache(item: CachedHitokoto) {
    try {
        const cache = getCache()

        const newItem: CachedHitokoto = {
            ...item,
            createdAt: item.createdAt ?? Date.now(),
        }

        const filteredCache = cache.filter(
            cachedItem => cachedItem.text !== newItem.text,
        )

        const nextCache = [
            newItem,
            ...filteredCache,
        ].slice(
            0,
            siteConfig.hitokoto.cacheLimit,
        )

        localStorage.setItem(
            siteConfig.hitokoto.cacheKey,
            JSON.stringify(nextCache),
        )
    } catch {
        // localStorage 不可用时静默降级
    }
}

/* =================================
   随机缓存
   ================================= */

function getRandomCachedHitokoto(): CachedHitokoto | null {
    const cache = getCache()

    if (cache.length === 0) {
        return null
    }

    const randomIndex = Math.floor(
        Math.random() * cache.length,
    )

    return cache[randomIndex]
}

/* =================================
   随机备用句子
   ================================= */

function getRandomFallback(): CachedHitokoto {
    const randomIndex = Math.floor(
        Math.random() * fallbackSentences.length,
    )

    return fallbackSentences[randomIndex]
}

/* =================================
   设置当前一言
   ================================= */

function setCurrentHitokoto(
    item: CachedHitokoto,
    offline = false,
) {
    if (isUnmounted) {
        return
    }

    currentHitokoto.value = item
    isOffline.value = offline
}

/* =================================
   切换动画
   ================================= */

function animateChange(
    item: CachedHitokoto,
    offline = false,
) {
    if (isUnmounted) {
        return
    }

    isChanging.value = true

    if (changeTimer !== undefined) {
        window.clearTimeout(changeTimer)
    }

    changeTimer = window.setTimeout(() => {
        if (isUnmounted) {
            return
        }

        setCurrentHitokoto(item, offline)

        isChanging.value = false
        changeTimer = undefined
    }, 180)
}

/* =================================
   获取一言
   ================================= */

async function fetchHitokoto() {
    if (isLoading.value || isUnmounted) {
        return
    }

    isLoading.value = true

    requestController?.abort()

    const controller = new AbortController()

    requestController = controller

    const timeoutTimer = window.setTimeout(() => {
        controller.abort()
    }, 8000)

    try {
        const response = await fetch(
            siteConfig.hitokoto.api,
            {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                },
                signal: controller.signal,
            },
        )

        if (!response.ok) {
            throw new Error(
                `一言接口请求失败：${response.status}`,
            )
        }

        const data =
            (await response.json()) as HitokotoResponse

        if (
            !data.hitokoto ||
            data.hitokoto.trim().length === 0
        ) {
            throw new Error(
                '一言接口返回内容为空',
            )
        }

        const sourceParts = [
            data.from_who,
            data.from,
        ]
            .filter(
                (item): item is string =>
                    Boolean(item),
            )
            .map(item => item.trim())

        const item: CachedHitokoto = {
            text: data.hitokoto.trim(),
            source: sourceParts.join(' · '),
            createdAt: Date.now(),
        }

        saveCache(item)

        animateChange(item, false)
    } catch {
        if (isUnmounted) {
            return
        }

        const cachedItem =
            getRandomCachedHitokoto()

        if (cachedItem) {
            animateChange(cachedItem, true)
        } else {
            animateChange(
                getRandomFallback(),
                true,
            )
        }
    } finally {
        window.clearTimeout(timeoutTimer)

        if (requestController === controller) {
            requestController = null
        }

        if (!isUnmounted) {
            isLoading.value = false
        }
    }
}

/* =================================
   手动刷新
   ================================= */

function handleRefresh() {
    if (isLoading.value) {
        return
    }

    void fetchHitokoto()
}

/* =================================
   生命周期
   ================================= */

onMounted(() => {
    void fetchHitokoto()

    refreshInterval = window.setInterval(() => {
        void fetchHitokoto()
    }, 60 * 1000)
})

onUnmounted(() => {
    isUnmounted = true

    if (refreshInterval !== undefined) {
        window.clearInterval(refreshInterval)
    }

    if (changeTimer !== undefined) {
        window.clearTimeout(changeTimer)
    }

    requestController?.abort()
})
</script>

<template>
    <section class="hitokoto-card liquid-glass">
        <div class="hitokoto-header">
            <span class="hitokoto-label">
                {{
                    isOffline
                        ? '一言 · 本地缓存'
                        : '一言'
                }}
            </span>

            <button class="hitokoto-refresh liquid-glass-button" type="button" :disabled="isLoading" aria-label="刷新一言"
                title="刷新一言" @click="handleRefresh">
                <span :class="{
                    rotating: isLoading,
                }">
                    ↻
                </span>
            </button>
        </div>

        <div class="hitokoto-content" :class="{
            changing: isChanging,
        }">
            <p class="hitokoto-text">
                {{ currentHitokoto.text }}
            </p>

            <p v-if="currentHitokoto.source" class="hitokoto-source">
                ——
                {{ currentHitokoto.source }}
            </p>
        </div>
    </section>
</template>

<style scoped>
/* =================================
   Card
   ================================= */

.hitokoto-card {
    width: 100%;

    /*
   * 固定卡片高度
   */
    height: 154px;
    min-height: 154px;
    max-height: 154px;

    padding: 20px 22px;

    color: var(--text-color);

    box-sizing: border-box;

    overflow: hidden;
}

/* =================================
   Header
   ================================= */

.hitokoto-header {
    display: flex;

    align-items: center;
    justify-content: space-between;

    gap: 12px;

    height: 34px;
    flex: 0 0 34px;

    margin-bottom: 10px;
}

/* =================================
   Label
   ================================= */

.hitokoto-label {
    color: var(--text-secondary);

    font-size: 13px;

    letter-spacing: 0.08em;

    line-height: 1.5;

    text-shadow: var(--text-shadow-secondary);

    transition:
        color 0.35s ease,
        text-shadow 0.35s ease;
}

/* =================================
   Refresh
   ================================= */

.hitokoto-refresh {
    display: inline-flex;

    align-items: center;
    justify-content: center;

    flex: 0 0 34px;

    width: 34px;
    height: 34px;

    padding: 0;

    border-radius: 50%;

    color: var(--text-color);

    cursor: pointer;

    transition:
        color 0.35s ease,
        transform 0.25s ease;
}

.hitokoto-refresh:hover:not(:disabled) {
    transform: rotate(15deg);
}

.hitokoto-refresh:disabled {
    cursor: wait;
    opacity: 0.65;
}

.hitokoto-refresh span {
    display: inline-block;

    font-size: 19px;

    line-height: 1;
}

/* =================================
   Content
   ================================= */

.hitokoto-content {
    /*
   * 154px 卡片：
   *
   * 上下 padding = 40px
   * Header = 34px
   * Header margin = 10px
   * 剩余 = 70px
   *
   * 所以这里严格控制在 70px
   */
    height: 70px;

    overflow: hidden;

    transition:
        opacity 0.18s ease,
        transform 0.18s ease;
}

.hitokoto-content.changing {
    opacity: 0;
    transform: translateY(5px);
}

/* =================================
   Text
   ================================= */

.hitokoto-text {
    display: -webkit-box;

    margin: 0;

    overflow: hidden;

    color: var(--text-color);

    font-size: 15px;

    /*
   * 原来的 1.9 太高，
   * 两行会把来源挤出卡片。
   *
   * 现在改成 1.6：
   * 15 × 1.6 × 2 = 48px
   */
    line-height: 1.6;

    font-weight: 500;

    word-break: break-word;

    text-shadow: var(--text-shadow);

    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;

    transition:
        color 0.35s ease,
        text-shadow 0.35s ease;
}

/* =================================
   Source
   ================================= */

.hitokoto-source {
    display: block;

    overflow: hidden;

    margin: 4px 0 0;

    color: var(--text-secondary);

    font-size: 12px;

    line-height: 1.5;

    text-align: right;

    text-overflow: ellipsis;

    white-space: nowrap;

    text-shadow: var(--text-shadow-secondary);

    transition:
        color 0.35s ease,
        text-shadow 0.35s ease;
}

/* =================================
   Loading
   ================================= */

.rotating {
    animation:
        hitokoto-rotate 0.8s linear infinite;
}

@keyframes hitokoto-rotate {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

/* =================================
   Mobile
   ================================= */

@media (max-width: 760px) {
    .hitokoto-card {
        height: 140px;
        min-height: 140px;
        max-height: 140px;

        padding: 18px;
    }

    .hitokoto-header {
        height: 32px;
        flex: 0 0 32px;

        margin-bottom: 8px;
    }

    .hitokoto-content {
        height: 64px;
    }

    .hitokoto-text {
        font-size: 14px;

        /*
     * 14 × 1.55 × 2 ≈ 43.4px
     */
        line-height: 1.55;
    }

    .hitokoto-source {
        margin-top: 3px;

        font-size: 11px;

        line-height: 1.4;
    }
}

/* =================================
   超小屏幕
   ================================= */

@media (max-width: 420px) {
    .hitokoto-card {
        height: 140px;
        min-height: 140px;
        max-height: 140px;

        padding: 18px;
    }

    .hitokoto-text {
        font-size: 14px;
        line-height: 1.55;
    }

    .hitokoto-source {
        font-size: 11px;
    }
}

/* =================================
   Reduced Motion
   ================================= */

@media (prefers-reduced-motion: reduce) {

    .hitokoto-label,
    .hitokoto-text,
    .hitokoto-source,
    .hitokoto-refresh,
    .hitokoto-content {
        transition: none;
    }

    .rotating {
        animation: none;
    }
}
</style>