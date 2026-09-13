<script setup lang="ts">
import BackgroundLayer from '@/components/Background/BackgroundLayer.vue'
import LoadingScreen from '@/components/Loading/LoadingScreen.vue'
import ThemeToggle from '@/components/ThemeToggle/ThemeToggle.vue'
import Home from '@/views/Home.vue'
</script>

<template>
  <div class="app">
    <!-- 背景 -->
    <BackgroundLayer />

    <!-- 主题切换 -->
    <ThemeToggle />

    <!-- 页面内容 -->
    <main class="app-main">
      <Home />
    </main>

    <!-- 加载动画 -->
    <LoadingScreen />
  </div>
</template>

<style>
.app {
  position: relative;
  isolation: isolate;

  width: 100%;
  min-height: 100vh;

  color: var(--text-color);

  transition:
    color 0.3s ease;
}

.app-main {
  position: relative;

  z-index: 1;

  width: 100%;
  min-height: 100vh;
}
</style>