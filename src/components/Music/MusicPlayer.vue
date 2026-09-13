<script setup lang="ts">
import '@/components/Styles/Music/music.scss'

import {
  useMusicPlayer,
} from '@/components/Use/Music/Music'

const {
  audio,

  tracks,
  currentIndex,

  playing,
  loading,

  musicListShow,
  volumeShow,

  volume,

  currentTime,
  duration,

  error,

  lyricError,
  lyricLoading,

  currentLyric,

  currentTrack,
  hasTracks,
  isMuted,
  progress,
  currentCover,
  volumePercent,

  formatTime,

  togglePlay,
  changeSong,
  selectTrack,

  seek,
  changeVolume,
  toggleMute,

  openMusicList,
  closeMusicList,

  loadPlaylist,

  handleTimeUpdate,
  handleLoadedMetadata,
  handleEnded,
  handleError,
} = useMusicPlayer()
</script>

<template>
  <section class="music-card liquid-glass" aria-label="音乐播放器">
    <audio ref="audio" :src="currentTrack?.url" preload="metadata" @timeupdate="handleTimeUpdate"
      @loadedmetadata="handleLoadedMetadata" @ended="handleEnded" @play="playing = true" @pause="playing = false"
      @error="handleError" />

    <!-- =================================================
         播放器主体
         ================================================= -->

    <template v-if="
      hasTracks &&
      currentTrack
    ">
      <!-- 歌曲信息 -->

      <div class="music-top">
        <div class="music-cover" :class="{
          spinning: playing,
        }" aria-hidden="true">
          <img v-if="currentCover" :src="currentCover" alt="" />

          <span v-else>
            ♫
          </span>
        </div>

        <div class="music-info">
          <strong class="
              music-title
              liquid-glass-text
            " :title="currentTrack.name">
            {{ currentTrack.name }}
          </strong>

          <span class="music-artist">
            {{ currentTrack.artist }}
          </span>
        </div>
      </div>

      <!-- =================================================
           歌词
           ================================================= -->

      <div class="music-lyric-row">
        <span class="music-lyric-icon" aria-hidden="true">
          ♪
        </span>

        <Transition name="lyric-fade" mode="out-in">
          <span :key="currentLyric" class="music-lyric" :class="{
            'is-loading':
              lyricLoading,

            'is-error':
              lyricError,
          }" :title="currentLyric">
            {{
              lyricLoading
                ? '歌词加载中…'
                : currentLyric
            }}
          </span>
        </Transition>
      </div>

      <!-- =================================================
           底部控制
           ================================================= -->

      <div class="music-bottom">
        <!-- 播放控制 -->

        <div class="music-main-controls">
          <button class="music-control" type="button" aria-label="音乐列表" title="音乐列表" @click="openMusicList">
            ☰
          </button>

          <button class="music-control" type="button" aria-label="上一首" title="上一首" @click="changeSong('prev')">
            ◀
          </button>

          <button class="
              music-play
              liquid-glass-button
            " type="button" :aria-label="playing
                ? '暂停'
                : '播放'
              " :title="playing
                ? '暂停'
                : '播放'
              " @click="togglePlay">
            {{
              playing
                ? 'Ⅱ'
                : '▶'
            }}
          </button>

          <button class="music-control" type="button" aria-label="下一首" title="下一首" @click="changeSong('next')">
            ▶
          </button>
        </div>

        <!-- 播放进度 -->

        <div class="music-progress-area">
          <span class="music-time">
            {{
              formatTime(
                currentTime,
              )
            }}
          </span>

          <input class="music-progress" type="range" min="0" :max="duration || 0
            " :value="currentTime" :style="{
              '--progress':
                `${progress}%`,
            }" aria-label="播放进度" @input="seek" />

          <span class="
              music-time
              music-time-end
            ">
            {{
              formatTime(
                duration,
              )
            }}
          </span>
        </div>

        <!-- =================================================
             音量
             ================================================= -->

        <div class="
            music-volume-wrap
          " @mouseenter="
            volumeShow = true
            " @mouseleave="
            volumeShow = false
            ">
          <!-- 向上展开的音量条 -->

          <Transition name="volume-expand">
            <div v-if="
              volumeShow
            " class="
                music-volume
              ">
              <input type="range" min="0" max="1" step="0.01" :value="volume
                " :style="{
                  '--volume':
                    `${volumePercent}%`,
                }" :aria-label="`音量 ${volumePercent}%`
                  " @input="
                  changeVolume
                " />
            </div>
          </Transition>

          <!-- 单击静音 / 恢复 -->

          <button class="
              music-volume-button
            " type="button" :aria-label="isMuted
                ? '恢复音量'
                : '静音'
              " :title="isMuted
                ? '恢复音量'
                : '静音'
              " @click="
              toggleMute
            ">
            <svg class="
                music-volume-icon-svg
              " viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <!-- 扬声器 -->

              <path d="
                  M4 10
                  H7
                  L11 6
                  V18
                  L7 14
                  H4
                  Z
                " fill="currentColor" />

              <!-- 声波 -->

              <path v-if="!isMuted" d="
                  M14.5 8.5
                  C16 10 16 14 14.5 15.5
                " fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />

              <path v-if="!isMuted" d="
                  M17.5 5.5
                  C20.5 8.5 20.5 15.5 17.5 18.5
                " fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />

              <!-- 静音 -->

              <path v-else d="
                  M15 9
                  L20 15

                  M20 9
                  L15 15
                " fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            </svg>
          </button>
        </div>
      </div>

      <!-- 错误 -->

      <p v-if="error" class="music-error">
        {{ error }}
      </p>
    </template>

    <!-- =================================================
         空状态
         ================================================= -->

    <div v-else class="music-empty">
      <div class="music-empty-icon">
        ♫
      </div>

      <div class="
          music-empty-content
        ">
        <strong class="
            music-title
            liquid-glass-text
          ">
          {{
            loading
              ? '音乐加载中…'
              : '音乐播放器'
          }}
        </strong>

        <p>
          {{
            error ||
            '正在获取歌单…'
          }}
        </p>
      </div>

      <button v-if="!loading" class="
          music-retry
          liquid-glass-button
        " type="button" @click="loadPlaylist">
        重试
      </button>
    </div>

    <!-- =================================================
         独立音乐列表 Modal
         ================================================= -->

    <Teleport to="body">
      <Transition name="music-modal">
        <div v-if="
          musicListShow
        " class="
            music-overlay
          " @click="
            closeMusicList
          ">
          <section class="
              music-dialog
              liquid-glass
            " role="dialog" aria-modal="true" aria-label="音乐列表" @click.stop>
            <!-- =================================================
                 关闭按钮

                 注意：
                 必须直接放在 music-dialog 下面。
                 ================================================= -->

            <button class="
                music-dialog-close
                liquid-glass-button
              " type="button" aria-label="关闭音乐列表" title="关闭" @click="
                closeMusicList
              ">
              <svg class="
                  music-close-icon
                " viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="
                    M6 6
                    L18 18

                    M18 6
                    L6 18
                  " fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" />
              </svg>
            </button>

            <!-- =================================================
                 标题
                 ================================================= -->

            <header class="
                music-dialog-header
              ">
              <div class="
                  music-dialog-title-wrap
                ">
                <span class="
                    music-dialog-icon
                  " aria-hidden="true">
                  ♫
                </span>

                <div class="
                    music-dialog-title-content
                  ">
                  <strong class="
                      music-title
                      liquid-glass-text
                    ">
                    音乐列表
                  </strong>

                  <span class="
                      music-count
                    ">
                    {{ tracks.length }}
                    首歌曲
                  </span>
                </div>
              </div>
            </header>

            <!-- =================================================
                 歌曲列表
                 ================================================= -->

            <div class="
                music-list
              ">
              <button v-for="(
track,
                    index
                ) in tracks" :key="`${track.id || track.url}-${index}`
                  " class="
                  music-item
                " :class="{
                  active:
                    currentIndex ===
                    index,
                }" type="button" @click="
                  selectTrack(
                    index,
                  )
                  ">
                <!-- 序号 -->

                <span class="
                    music-index
                  ">
                  {{
                    String(
                      index + 1,
                    ).padStart(
                      2,
                      '0',
                    )
                  }}
                </span>

                <!-- 封面 -->

                <span class="
                    music-item-cover
                  ">
                  <img v-if="
                    track.cover
                  " :src="track.cover
                      " alt="" />

                  <span v-else>
                    ♫
                  </span>
                </span>

                <!-- 信息 -->

                <span class="
                    music-item-info
                  ">
                  <strong>
                    {{
                      track.name
                    }}
                  </strong>

                  <span>
                    {{
                      track.artist
                    }}
                  </span>
                </span>

                <!-- 当前播放 -->

                <span v-if="
                  currentIndex ===
                  index
                " class="
                    music-playing
                  " aria-label="正在播放">
                  ♪
                </span>
              </button>
            </div>
          </section>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>