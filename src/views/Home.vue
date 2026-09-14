<!-- src/views/Home.vue -->

<script setup lang="ts">
import ProfileCard from '@/components/Profile/ProfileCard.vue'
import SiteLinks from '@/components/SiteLinks/SiteLinks.vue'
import SocialLinks from '@/components/SocialLinks/SocialLinks.vue'
import HitokotoCard from '@/components/Hitokoto/HitokotoCard.vue'
import MusicPlayer from '@/components/Music/MusicPlayer.vue'

import { siteConfig } from '@/config/site'
</script>

<template>
  <div class="home-page">
    <div class="home-wrapper">
      <!-- =================================
           Main Content
           ================================= -->

      <main class="home-container">
        <!-- =================================
             Left
             ================================= -->

        <section class="home-left">
          <ProfileCard />

          <HitokotoCard />

          <!--
            将 SocialLinks 推到左侧底部。
          -->

          <div class="home-left-spacer"></div>

          <div class="home-social">
            <SocialLinks />
          </div>
        </section>

        <!-- =================================
             Right
             ================================= -->

        <section class="home-right">
          <MusicPlayer />

          <div class="home-site-links">
            <SiteLinks />
          </div>
        </section>
      </main>

      <!-- =================================
           Footer
           ================================= -->

      <footer class="home-footer liquid-glass-text">
        <span>
          ©
          {{ new Date().getFullYear() }}
          {{ siteConfig.profile.name }}
        </span>

        <span class="footer-divider">
          ·
        </span>

        <a
          class="footer-record"
          href="https://icp.gov.moe/?keyword=20250196"
          target="_blank"
          rel="noopener noreferrer"
        >
          萌ICP备20250196号
        </a>
      </footer>
    </div>
  </div>
</template>

<style scoped>
/* =================================
   Page
   ================================= */

.home-page {
  display:
    flex;

  align-items:
    center;

  justify-content:
    center;

  width:
    100%;

  min-height:
    100vh;

  padding:
    28px 24px 24px;

  box-sizing:
    border-box;
}

/* =================================
   Wrapper
   ================================= */

.home-wrapper {
  width:
    min(1120px, 100%);

  margin:
    0 auto;

  /*
   * 桌面端整体稍微向下。
   */

  transform:
    translateY(45px);
}

/* =================================
   Main
   ================================= */

.home-container {
  display:
    grid;

  grid-template-columns:
    minmax(260px, 0.85fr)
    minmax(0, 1.35fr);

  column-gap:
    28px;

  width:
    100%;

  align-items:
    stretch;
}

/* =================================
   Left
   ================================= */

.home-left {
  display:
    flex;

  flex-direction:
    column;

  min-width:
    0;

  min-height:
    0;

  gap:
    20px;
}

/*
 * 自动占据左侧剩余高度。
 *
 * SocialLinks 会被推到左列底部。
 */

.home-left-spacer {
  flex:
    1 1 auto;

  min-height:
    0;
}

.home-social {
  width:
    100%;

  min-width:
    0;

  flex:
    0 0 auto;
}

/* =================================
   Right
   ================================= */

.home-right {
  display:
    flex;

  flex-direction:
    column;

  min-width:
    0;

  min-height:
    0;

  /*
   * MusicPlayer 和 SiteLinks 紧凑排列。
   */

  gap:
    10px;
}

.home-site-links {
  width:
    100%;

  min-width:
    0;

  flex:
    0 0 auto;
}

/* =================================
   Footer
   ================================= */

.home-footer {
  display:
    flex;

  align-items:
    center;

  justify-content:
    center;

  flex-wrap:
    wrap;

  gap:
    7px;

  width:
    100%;

  margin:
    22px auto 0;

  padding:
    0 8px;

  box-sizing:
    border-box;

  color:
    var(--text-secondary);

  font-size:
    11px;

  line-height:
    1.5;

  text-align:
    center;

  text-shadow:
    var(--text-shadow-secondary);

  transition:
    color 0.35s ease,
    text-shadow 0.35s ease;
}

/* =================================
   Footer Divider
   ================================= */

.footer-divider {
  opacity:
    0.45;
}

/* =================================
   ICP
   ================================= */

.footer-record {
  color:
    var(--text-secondary);

  text-decoration:
    none;

  white-space:
    nowrap;

  transition:
    color 0.25s ease,
    text-shadow 0.25s ease;
}

.footer-record:hover {
  color:
    var(--accent-color);

  text-decoration:
    underline;

  text-shadow:
    var(--text-shadow);
}

/* =================================
   Tablet
   ================================= */

@media (max-width: 900px) {
  .home-page {
    padding:
      24px 18px 20px;
  }

  .home-wrapper {
    transform:
      translateY(30px);
  }

  .home-container {
    grid-template-columns:
      minmax(220px, 0.8fr)
      minmax(0, 1.2fr);

    column-gap:
      20px;
  }

  .home-right {
    gap:
      10px;
  }
}

/* =================================
   Mobile
   ================================= */

@media (max-width: 760px) {
  .home-page {
    display:
      block;

    min-height:
      auto;

    padding:
      24px 16px 18px;
  }

  .home-wrapper {
    width:
      100%;

    max-width:
      560px;

    margin:
      0 auto;

    /*
     * 手机端取消整体下移。
     */

    transform:
      none;
  }

  /*
   * 变成普通纵向布局。
   */

  .home-container {
    display:
      flex;

    flex-direction:
      column;

    gap:
      16px;

    width:
      100%;
  }

  .home-left {
    display:
      flex;

    flex-direction:
      column;

    width:
      100%;

    min-height:
      auto;

    gap:
      16px;
  }

  .home-right {
    display:
      flex;

    flex-direction:
      column;

    width:
      100%;

    min-height:
      auto;

    gap:
      10px;
  }

  /*
   * 手机上不需要弹性占位。
   */

  .home-left-spacer {
    display:
      none;
  }

  .home-social,
  .home-site-links {
    width:
      100%;
  }

  /*
   * Mobile 顺序：
   *
   * ProfileCard
   * HitokotoCard
   * MusicPlayer
   * SiteLinks
   * SocialLinks
   */

  .home-right {
    order:
      2;
  }

  .home-social {
    order:
      3;
  }

  /*
   * Footer
   */

  .home-footer {
    margin:
      18px auto 0;

    padding:
      0 6px;

    font-size:
      10px;
  }
}

/* =================================
   Reduced Motion
   ================================= */

@media (prefers-reduced-motion: reduce) {
  .home-footer,
  .footer-record {
    transition:
      none;
  }

  .home-wrapper {
    transform:
      none;
  }
}
</style>