// src/utils/Weather/weather.ts

import {
    computed,
    onUnmounted,
    ref,
} from 'vue'
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

export interface WeatherState {
    city: string
    text: string
    temperature: number
    windDirection: string
    windPower: string
}

/*
 * Weather 状态做成模块级单例。
 *
 * 这样 ProfileCard 和 WeatherCard
 * 可以共享同一份天气数据，不会重复请求。
 */

const loading = ref(true)
const refreshing = ref(false)
const error = ref('')
const weather = ref<WeatherState | null>(null)

let refreshTimer: number | undefined
let controller: AbortController | undefined
let mountedCount = 0

const weatherIcon = computed(() => {
    if (!weather.value) {
        return '☁️'
    }

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
    return (
        weather.value?.city ||
        siteConfig.weather.city ||
        siteConfig.profile.location
    )
})

function formatWindDirection(direction: string) {
    if (!direction || direction === '--') {
        return '--'
    }

    return direction.endsWith('风')
        ? direction
        : `${direction}风`
}

async function loadWeather() {
    controller?.abort()

    controller = new AbortController()

    loading.value = !weather.value
    refreshing.value = true
    error.value = ''

    const currentController = controller

    const timeout = window.setTimeout(() => {
        currentController.abort()
    }, 8000)

    try {
        const response = await fetch(
            siteConfig.weather.api,
            {
                signal: currentController.signal,

                headers: {
                    Accept: 'application/json',
                },
            },
        )

        if (!response.ok) {
            throw new Error(
                `HTTP ${response.status}`,
            )
        }

        const data =
            (await response.json()) as WeatherResponse

        if (data.status !== 0 || !data.now) {
            throw new Error(
                data.message ||
                '天气获取失败',
            )
        }

        const temperature =
            Number(data.now.temp)

        weather.value = {
            city:
                data.city ||
                siteConfig.weather.city ||
                siteConfig.profile.location,

            text:
                data.now.text ||
                '天气未知',

            temperature:
                Number.isFinite(temperature)
                    ? temperature
                    : 0,

            windDirection:
                formatWindDirection(
                    data.now.wind_dir ||
                    '--',
                ),

            windPower:
                data.now.wind_class?.replace(
                    /\s*级/g,
                    '',
                ) ||
                '--',
        }
    } catch (loadError) {
        if (
            loadError instanceof DOMException &&
            loadError.name === 'AbortError'
        ) {
            error.value = '天气请求超时'
        } else {
            error.value =
                '天气暂时无法获取'
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

function startAutoRefresh() {
    if (refreshTimer !== undefined) {
        return
    }

    refreshTimer =
        window.setInterval(() => {
            void loadWeather()
        }, 10 * 60 * 1000)
}

function stopAutoRefresh() {
    if (refreshTimer !== undefined) {
        window.clearInterval(
            refreshTimer,
        )

        refreshTimer = undefined
    }
}

export function useWeather() {
    mountedCount++

    onUnmounted(() => {
        mountedCount--

        if (mountedCount <= 0) {
            controller?.abort()
            stopAutoRefresh()
        }
    })

    return {
        loading,
        refreshing,
        error,
        weather,
        weatherIcon,
        displayCity,
        loadWeather,
        refreshWeather,
        startAutoRefresh,
        stopAutoRefresh,
    }
}