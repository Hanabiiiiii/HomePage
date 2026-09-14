<script setup lang="ts">
import BackgroundLayer from '@/components/Background/BackgroundLayer.vue'
import LoadingScreen from '@/components/Loading/LoadingScreen.vue'
import ThemeToggle from '@/components/ThemeToggle/ThemeToggle.vue'
import Home from '@/views/Home.vue'
</script>

<template>
  <!-- =================================
       全屏背景
       ================================= -->

  <BackgroundLayer />

  <!-- =================================
       页面内容层
       ================================= -->

  <div class="app">
    <!-- 主题切换 -->

    <ThemeToggle />

    <!-- 页面主体 -->

    <main class="app-main">
      <Home />
    </main>

    <!-- 加载动画 -->

    <LoadingScreen />
  </div>
</template>

<style>
/* =================================
   App
   ================================= */

.app {
  position: relative;

  z-index: 1;

  width: 100%;

  min-height: 100vh;

  color:
    var(--text-color);

  /*
   * 不使用 isolation: isolate。
   *
   * 背景已经独立为 #app 下的兄弟节点，
   * 让 backdrop-filter 可以直接采样背景。
   */

  transition:
    color 0.3s ease;
}

/* =================================
   Main
   ================================= */

.app-main {
  position: relative;

  z-index: 1;

  width: 100%;

  min-height: 100vh;
}
</style>