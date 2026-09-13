
<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()

const visible = computed(() => appStore.isLoading)
</script>

<template>
  <Transition name="loading-fade">
    <div
      v-if="visible"
      class="loading-screen"
      aria-label="页面正在加载"
    >
      <div class="loading-content">
        <div class="loading-dots">
          <span />
          <span />
          <span />
        </div>

        <p class="loading-title">Loading</p>
        <p class="loading-subtitle">正在准备页面资源</p>
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
  background: var(--page-background);
}

.loading-content {
  text-align: center;
}

.loading-dots {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 18px;
}

.loading-dots span {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--accent-color);
  animation: loading-bounce 1.2s infinite ease-in-out;
}

.loading-dots span:nth-child(2) {
  animation-delay: 0.15s;
}

.loading-dots span:nth-child(3) {
  animation-delay: 0.3s;
}

.loading-title {
  margin: 0;
  color: var(--text-color);
  font-size: 20px;
  font-weight: 700;
}

.loading-subtitle {
  margin: 8px 0 0;
  color: var(--text-secondary);
  font-size: 13px;
}

.loading-fade-enter-active,
.loading-fade-leave-active {
  transition: opacity 0.35s ease;
}

.loading-fade-enter-from,
.loading-fade-leave-to {
  opacity: 0;
}

@keyframes loading-bounce {
  0%,
  80%,
  100% {
    transform: scale(0.65);
    opacity: 0.45;
  }

  40% {
    transform: scale(1);
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
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