<script setup lang="ts">
import { computed } from 'vue'

import { useAppStore } from '@/stores/app'

const appStore = useAppStore()

const visible = computed(
  () => appStore.isLoading,
)
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

  min-height: 180px;

  padding:
    28px 30px;

  box-sizing: border-box;

  text-align: center;

  color:
    var(--text-color);

  animation:
    loading-card-in 0.45s ease-out both;
}

/* =================================
   Loading Dots
   ================================= */

.loading-dots {
  display: flex;

  align-items: center;

  justify-content: center;

  gap: 8px;

  margin-bottom: 18px;
}

.loading-dots span {
  width: 9px;

  height: 9px;

  border-radius: 50%;

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
  margin: 0;

  color:
    var(--text-color);

  font-size: 20px;

  font-weight: 700;

  line-height: 1.4;

  letter-spacing: 0.04em;

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

  font-size: 13px;

  line-height: 1.6;

  text-shadow:
    var(--text-shadow-secondary);
}

/* =================================
   Card Enter
   ================================= */

@keyframes loading-card-in {
  from {
    opacity: 0;

    transform:
      translateY(10px) scale(0.98);
  }

  to {
    opacity: 1;

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

    opacity: 0.45;
  }

  40% {
    transform:
      scale(1);

    opacity: 1;
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
  opacity: 0;
}

/* =================================
   Mobile
   ================================= */

@media (max-width: 420px) {
  .loading-content {
    width:
      calc(100% - 32px);

    min-height: 160px;

    padding: 24px;
  }

  .loading-title {
    font-size: 19px;
  }

  .loading-subtitle {
    font-size: 12px;
  }
}

/* =================================
   Reduced Motion
   ================================= */

@media (prefers-reduced-motion: reduce) {
  .loading-content {
    animation: none;
  }

  .loading-dots span {
    animation: none;

    opacity: 0.8;
  }

  .loading-fade-enter-active,
  .loading-fade-leave-active {
    transition: none;
  }
}
</style>