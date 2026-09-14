import {
    computed,
    nextTick,
    onMounted,
    onUnmounted,
    ref,
    watch,
} from 'vue'

import { siteConfig } from '@/config/site'

export interface MetingTrack {
    name?: string
    title?: string
    artist?: string
    author?: string
    url?: string
    cover?: string
    pic?: string
    lrc?: string
    id?: string | number
}

export interface PlayerTrack {
    name: string
    artist: string
    url: string
    cover?: string
    lrc?: string
    id?: string
}

export interface LyricLine {
    time: number
    text: string
}

export function useMusicPlayer() {
    const audio =
        ref<HTMLAudioElement | null>(null)

    const tracks =
        ref<PlayerTrack[]>([])

    const currentIndex =
        ref(0)

    const playing =
        ref(false)

    const loading =
        ref(true)

    const musicListShow =
        ref(false)

    const volumeShow =
        ref(false)

    const volume =
        ref(0.7)

    const previousVolume =
        ref(0.7)

    const currentTime =
        ref(0)

    const duration =
        ref(0)

    const error =
        ref('')

    const lyricError =
        ref('')

    const lyricLoading =
        ref(false)

    const currentLyric =
        ref('歌词加载中')

    const lyricLines =
        ref<LyricLine[]>([])

    let lyricRequestController:
        AbortController | null = null

    /* =====================================================
       计算属性
       ===================================================== */

    const currentTrack =
        computed<
            PlayerTrack | undefined
        >(() => {
            return tracks.value[
                currentIndex.value
            ]
        })

    const hasTracks =
        computed(() => {
            return tracks.value.length > 0
        })

    const isMuted =
        computed(() => {
            return volume.value <= 0
        })

    const progress =
        computed(() => {
            if (!duration.value) {
                return 0
            }

            return Math.min(
                100,
                (currentTime.value /
                    duration.value) *
                100,
            )
        })

    const currentCover =
        computed(() => {
            return (
                currentTrack.value?.cover ||
                ''
            )
        })

    const volumePercent =
        computed(() => {
            return Math.round(
                volume.value * 100,
            )
        })

    /* =====================================================
       工具
       ===================================================== */

    function formatTime(
        value: number,
    ) {
        if (
            !Number.isFinite(value)
        ) {
            return '0:00'
        }

        const minutes =
            Math.floor(value / 60)

        const seconds =
            Math.floor(value % 60)

        return `${minutes}:${String(
            seconds,
        ).padStart(2, '0')}`
    }

    function isUrl(
        value: string,
    ) {
        return /^https?:\/\//i.test(
            value.trim(),
        )
    }

    /* =====================================================
       LRC 解析
       ===================================================== */

    function parseLyrics(
        lrc = '',
    ): LyricLine[] {
        const result: LyricLine[] = []

        if (!lrc.trim()) {
            return result
        }

        for (
            const rawLine of lrc.split(
                /\r?\n/,
            )
        ) {
            const line =
                rawLine.trim()

            if (!line) {
                continue
            }

            const tags =
                line.match(
                    /\[\d{1,3}:\d{1,2}(?:\.\d+)?\]/g,
                )

            if (!tags) {
                continue
            }

            const text =
                line
                    .replace(
                        /\[\d{1,3}:\d{1,2}(?:\.\d+)?\]/g,
                        '',
                    )
                    .trim()

            if (!text) {
                continue
            }

            for (
                const tag of tags
            ) {
                const match =
                    tag.match(
                        /\[(\d{1,3}):(\d{1,2}(?:\.\d+)?)\]/,
                    )

                if (!match) {
                    continue
                }

                result.push({
                    time:
                        Number(match[1]) * 60 +
                        Number(match[2]),

                    text,
                })
            }
        }

        result.sort(
            (a, b) =>
                a.time - b.time,
        )

        return result
    }

    /* =====================================================
       获取歌词
       ===================================================== */

    async function fetchLyricText(
        track: PlayerTrack,
        signal: AbortSignal,
    ): Promise<string> {
        const lrc =
            track.lrc?.trim()

        if (
            !lrc ||
            lrc === 'Not available'
        ) {
            return ''
        }

        /*
         * 已经是歌词文本
         */
        if (!isUrl(lrc)) {
            return lrc
        }

        /*
         * 优先使用自己的歌词 API
         */
        const musicConfig =
            siteConfig.music as typeof siteConfig.music & {
                lyricApi?: string
            }

        if (
            musicConfig.lyricApi &&
            track.id
        ) {
            const lyricUrl =
                `${musicConfig.lyricApi}?id=` +
                encodeURIComponent(
                    track.id,
                )

            const response =
                await fetch(
                    lyricUrl,
                    {
                        method: 'GET',

                        signal,

                        headers: {
                            Accept:
                                'application/json, text/plain, */*',
                        },
                    },
                )

            if (!response.ok) {
                throw new Error(
                    `歌词代理请求失败：HTTP ${response.status}`,
                )
            }

            const contentType =
                response.headers.get(
                    'content-type',
                ) || ''

            if (
                contentType.includes(
                    'application/json',
                )
            ) {
                const data =
                    (await response.json()) as {
                        status?: number
                        message?: string
                        lyric?: string
                        lrc?: string
                        data?: {
                            lyric?: string
                            lrc?: string
                        }
                    }

                if (
                    data.status !== undefined &&
                    data.status !== 0 &&
                    !data.lyric &&
                    !data.lrc &&
                    !data.data?.lyric &&
                    !data.data?.lrc
                ) {
                    throw new Error(
                        data.message ||
                        '歌词代理返回失败',
                    )
                }

                return (
                    data.lyric ||
                    data.lrc ||
                    data.data?.lyric ||
                    data.data?.lrc ||
                    ''
                )
            }

            return await response.text()
        }

        /*
         * 没有歌词代理，直接请求
         */
        const response =
            await fetch(
                lrc,
                {
                    method: 'GET',

                    signal,

                    headers: {
                        Accept:
                            'text/plain, */*',
                    },
                },
            )

        if (!response.ok) {
            throw new Error(
                `歌词请求失败：HTTP ${response.status}`,
            )
        }

        return await response.text()
    }

    /* =====================================================
       加载当前歌词
       ===================================================== */

    async function loadCurrentLyric() {
        lyricRequestController?.abort()

        const controller =
            new AbortController()

        lyricRequestController =
            controller

        lyricLines.value = []

        lyricError.value = ''

        currentLyric.value =
            '歌词加载中'

        lyricLoading.value =
            true

        const track =
            currentTrack.value

        if (!track?.lrc) {
            lyricLoading.value =
                false

            currentLyric.value =
                '暂无歌词'

            return
        }

        if (
            track.lrc ===
            'Not available'
        ) {
            lyricLoading.value =
                false

            currentLyric.value =
                '暂无歌词'

            return
        }

        try {
            const lyricText =
                await fetchLyricText(
                    track,
                    controller.signal,
                )

            if (
                controller.signal.aborted
            ) {
                return
            }

            const parsed =
                parseLyrics(
                    lyricText,
                )

            lyricLines.value =
                parsed

            if (!parsed.length) {
                currentLyric.value =
                    '暂无歌词'

                lyricError.value =
                    '歌词内容为空'

                return
            }

            updateLyric(
                currentTime.value,
            )
        } catch (loadError) {
            if (
                controller.signal.aborted
            ) {
                return
            }

            console.error(
                '歌词加载失败：',
                loadError,
            )

            lyricLines.value = []

            lyricError.value =
                loadError instanceof Error
                    ? loadError.message
                    : '歌词加载失败'

            currentLyric.value =
                '歌词加载失败'
        } finally {
            if (
                !controller.signal.aborted
            ) {
                lyricLoading.value =
                    false
            }
        }
    }

    /* =====================================================
       同步歌词
       ===================================================== */

    function updateLyric(
        time: number,
    ) {
        if (
            !lyricLines.value.length
        ) {
            if (lyricLoading.value) {
                currentLyric.value =
                    '歌词加载中'
            } else if (
                lyricError.value
            ) {
                currentLyric.value =
                    '歌词加载失败'
            } else {
                currentLyric.value =
                    '暂无歌词'
            }

            return
        }

        let active =
            lyricLines.value[0]

        for (
            const line of lyricLines.value
        ) {
            if (line.time <= time) {
                active = line
            } else {
                break
            }
        }

        currentLyric.value =
            active.text
    }

    /* =====================================================
       当前歌曲
       ===================================================== */

    function applyCurrentTrack() {
        currentTime.value = 0

        duration.value = 0

        lyricLines.value = []

        lyricError.value = ''

        currentLyric.value =
            '歌词加载中'

        void loadCurrentLyric()
    }

    /* =====================================================
       播放
       ===================================================== */

    async function playCurrent() {
        if (
            !audio.value ||
            !currentTrack.value
        ) {
            return
        }

        try {
            await audio.value.play()

            playing.value = true

            error.value = ''
        } catch {
            playing.value = false

            error.value =
                '浏览器阻止了自动播放，请点击播放'
        }
    }

    function pause() {
        audio.value?.pause()

        playing.value = false
    }

    async function togglePlay() {
        if (!hasTracks.value) {
            return
        }

        error.value = ''

        if (playing.value) {
            pause()
        } else {
            await playCurrent()
        }
    }

    /* =====================================================
       切歌
       ===================================================== */

    async function changeSong(
        type: 'prev' | 'next',
    ) {
        if (
            !tracks.value.length
        ) {
            return
        }

        if (type === 'next') {
            currentIndex.value =
                (currentIndex.value + 1) %
                tracks.value.length
        } else {
            currentIndex.value =
                (currentIndex.value -
                    1 +
                    tracks.value.length) %
                tracks.value.length
        }

        await nextTick()

        await playCurrent()
    }

    async function selectTrack(
        index: number,
    ) {
        if (
            index < 0 ||
            index >= tracks.value.length
        ) {
            return
        }

        currentIndex.value =
            index

        musicListShow.value =
            false

        document.body.style.overflow =
            ''

        await nextTick()

        await playCurrent()
    }

    /* =====================================================
       进度
       ===================================================== */

    function handleTimeUpdate() {
        if (!audio.value) {
            return
        }

        currentTime.value =
            audio.value.currentTime

        updateLyric(
            currentTime.value,
        )
    }

    function handleLoadedMetadata() {
        if (!audio.value) {
            return
        }

        duration.value =
            Number.isFinite(
                audio.value.duration,
            )
                ? audio.value.duration
                : 0
    }

    function handleEnded() {
        void changeSong('next')
    }

    function handleError() {
        playing.value = false

        error.value =
            '歌曲加载失败'
    }

    function seek(
        event: Event,
    ) {
        if (
            !audio.value ||
            !duration.value
        ) {
            return
        }

        const target =
            event.target as HTMLInputElement

        const value =
            Number(target.value)

        audio.value.currentTime =
            value

        currentTime.value =
            value

        updateLyric(value)
    }

    /* =====================================================
       音量
       ===================================================== */

    function changeVolume(
        event: Event,
    ) {
        const target =
            event.target as HTMLInputElement

        const value =
            Number(target.value)

        if (value > 0) {
            previousVolume.value =
                value
        }

        volume.value =
            value
    }

    /**
     * 静音 / 恢复
     */
    function toggleMute() {
        if (volume.value > 0) {
            previousVolume.value =
                volume.value

            volume.value = 0

            return
        }

        volume.value =
            previousVolume.value > 0
                ? previousVolume.value
                : 0.7
    }

    /* =====================================================
       歌单
       ===================================================== */

    async function loadPlaylist() {
        loading.value = true

        error.value = ''

        try {
            const params =
                new URLSearchParams({
                    server:
                        siteConfig.music
                            .server,

                    type:
                        siteConfig.music
                            .type,

                    id:
                        siteConfig.music
                            .id,
                })

            const response =
                await fetch(
                    `${siteConfig.music.api}?${params.toString()}`,
                    {
                        method: 'GET',

                        headers: {
                            Accept:
                                'application/json',
                        },
                    },
                )

            if (!response.ok) {
                throw new Error(
                    `HTTP ${response.status}`,
                )
            }

            const data =
                (await response.json()) as
                | MetingTrack[]
                | {
                    data?: MetingTrack[]
                }

            const list =
                Array.isArray(data)
                    ? data
                    : data.data || []

            tracks.value =
                list
                    .map(
                        (item) => ({
                            name:
                                item.name ||
                                item.title ||
                                'Unknown',

                            artist:
                                item.artist ||
                                item.author ||
                                'Unknown Artist',

                            url:
                                item.url || '',

                            cover:
                                item.cover ||
                                item.pic,

                            lrc:
                                item.lrc,

                            id:
                                item.id !== undefined
                                    ? String(item.id)
                                    : undefined,
                        }),
                    )
                    .filter(
                        (item) =>
                            item.url.length > 0,
                    )

            if (
                !tracks.value.length
            ) {
                throw new Error(
                    'empty playlist',
                )
            }

            currentIndex.value =
                0

            applyCurrentTrack()
        } catch (loadError) {
            console.error(
                '音乐歌单获取失败：',
                loadError,
            )

            tracks.value = []

            error.value =
                '音乐服务暂时无法使用'
        } finally {
            loading.value = false
        }
    }

    /* =====================================================
       音乐列表
       ===================================================== */

    function openMusicList() {
        musicListShow.value =
            true

        document.body.style.overflow =
            'hidden'
    }

    function closeMusicList() {
        musicListShow.value =
            false

        document.body.style.overflow =
            ''
    }

    /* =====================================================
       键盘
       ===================================================== */

    function handleKeydown(
        event: KeyboardEvent,
    ) {
        if (
            event.code === 'Escape' &&
            musicListShow.value
        ) {
            closeMusicList()

            return
        }

        if (
            event.code !== 'Space'
        ) {
            return
        }

        const target =
            event.target as HTMLElement | null

        if (
            target &&
            [
                'INPUT',
                'TEXTAREA',
                'SELECT',
                'BUTTON',
            ].includes(
                target.tagName,
            )
        ) {
            return
        }

        event.preventDefault()

        void togglePlay()
    }

    /* =====================================================
       监听
       ===================================================== */

    watch(
        currentTrack,
        () => {
            applyCurrentTrack()

            if (
                !audio.value ||
                !currentTrack.value
            ) {
                return
            }

            audio.value.load()

            if (playing.value) {
                void playCurrent()
            }
        },
    )

    watch(
        volume,
        (value) => {
            if (audio.value) {
                audio.value.volume =
                    value
            }
        },
    )

    /* =====================================================
       生命周期
       ===================================================== */

    onMounted(() => {
        if (audio.value) {
            audio.value.volume =
                volume.value
        }

        window.addEventListener(
            'keydown',
            handleKeydown,
        )

        void loadPlaylist()
    })

    onUnmounted(() => {
        lyricRequestController?.abort()

        audio.value?.pause()

        document.body.style.overflow =
            ''

        window.removeEventListener(
            'keydown',
            handleKeydown,
        )
    })

    return {
        audio,

        tracks,
        currentIndex,

        playing,
        loading,

        musicListShow,
        volumeShow,

        volume,
        previousVolume,

        currentTime,
        duration,

        error,

        lyricError,
        lyricLoading,

        currentLyric,
        lyricLines,

        currentTrack,
        hasTracks,
        isMuted,
        progress,
        currentCover,
        volumePercent,

        formatTime,

        togglePlay,
        pause,

        changeSong,
        selectTrack,

        seek,
        changeVolume,
        toggleMute,

        openMusicList,
        closeMusicList,

        loadPlaylist,
        loadCurrentLyric,

        handleTimeUpdate,
        handleLoadedMetadata,
        handleEnded,
        handleError,
    }
}