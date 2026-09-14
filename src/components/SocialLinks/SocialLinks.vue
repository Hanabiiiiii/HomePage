<!-- src/components/SocialLinks/SocialLinks.vue -->

<script setup lang="ts">
import { siteConfig } from '@/config/site'

function isSvgIcon(icon?: string) {
  if (!icon) {
    return false
  }

  const value = icon.toLowerCase()

  return (
    value.endsWith('.svg') ||
    value.includes('.svg?') ||
    value.includes('.svg#')
  )
}

function isImageIcon(icon?: string) {
  if (!icon) {
    return false
  }

  return (
    icon.startsWith('/') ||
    icon.startsWith('http://') ||
    icon.startsWith('https://')
  )
}
</script>

<template>
  <nav class="social-links" aria-label="社交链接">
    <a v-for="social in siteConfig.socials" :key="social.url" class="social-link liquid-glass-button" :href="social.url"
      :aria-label="social.title" :title="social.title" target="_blank" rel="noopener noreferrer">
      <span class="social-link__icon" aria-hidden="true">
        <!-- SVG -->

        <span v-if="isSvgIcon(social.icon)" class="social-link__svg" :style="{
          '--social-icon': `url('${social.icon}')`,
        }"></span>

        <!-- PNG / JPG / WebP -->

        <img v-else-if="isImageIcon(social.icon)" class="social-link__image" :src="social.icon" :alt="social.title"
          loading="lazy" decoding="async" />

        <!-- Emoji / Text -->

        <span v-else class="social-link__text">
          {{ social.icon || '↗' }}
        </span>
      </span>
    </a>
  </nav>
</template>

<style scoped lang="scss">
/* =================================
   Container
   ================================= */

.social-links {
  display:
    flex;

  align-items:
    center;

  justify-content:
    space-between;

  width:
    100%;

  min-width:
    0;

  /*
   * 不再使用固定 gap。
   *
   * 由 space-between 自动计算按钮之间
   * 的剩余空间。
   */
}

/* =================================
   Button
   ================================= */

.social-link {
  display:
    inline-flex;

  align-items:
    center;

  justify-content:
    center;

  flex:
    0 0 42px;

  width:
    42px;

  height:
    42px;

  min-width:
    42px;

  min-height:
    42px;

  margin:
    0;

  padding:
    0;

  box-sizing:
    border-box;

  color:
    var(--text-secondary);

  text-decoration:
    none;

  transition:
    color 0.35s ease,
    background 0.35s ease,
    border-color 0.35s ease,
    box-shadow 0.35s ease,
    transform 0.25s ease;
}

/* =================================
   Icon Container
   ================================= */

.social-link__icon {
  position:
    relative;

  z-index:
    2;

  display:
    flex;

  align-items:
    center;

  justify-content:
    center;

  width:
    100%;

  height:
    100%;

  overflow:
    hidden;

  border-radius:
    inherit;

  color:
    currentColor;

  line-height:
    1;
}

/* =================================
   SVG
   ================================= */

.social-link__svg {
  display:
    block;

  width:
    22px;

  height:
    22px;

  flex:
    0 0 22px;

  background:
    currentColor;

  mask-image:
    var(--social-icon);

  mask-position:
    center;

  mask-repeat:
    no-repeat;

  mask-size:
    contain;

  -webkit-mask-image:
    var(--social-icon);

  -webkit-mask-position:
    center;

  -webkit-mask-repeat:
    no-repeat;

  -webkit-mask-size:
    contain;

  pointer-events:
    none;

  user-select:
    none;

  transition:
    background-color 0.35s ease,
    transform 0.25s ease;
}

/* =================================
   Image
   ================================= */

.social-link__image {
  display:
    block;

  width:
    22px;

  height:
    22px;

  max-width:
    22px;

  max-height:
    22px;

  object-fit:
    contain;

  object-position:
    center;

  pointer-events:
    none;

  user-select:
    none;

  transition:
    transform 0.25s ease,
    opacity 0.25s ease;
}

/* =================================
   Text
   ================================= */

.social-link__text {
  display:
    block;

  color:
    currentColor;

  font-size:
    18px;

  line-height:
    1;

  text-align:
    center;

  text-shadow:
    var(--text-shadow-secondary);

  transition:
    color 0.35s ease,
    transform 0.25s ease,
    text-shadow 0.35s ease;
}

/* =================================
   Hover
   ================================= */

.social-link:hover {
  color:
    var(--accent-color);
}

.social-link:hover .social-link__svg {
  transform:
    scale(1.08);
}

.social-link:hover .social-link__image {
  transform:
    scale(1.08);
}

.social-link:hover .social-link__text {
  color:
    var(--accent-color);

  transform:
    scale(1.08);

  text-shadow:
    var(--text-shadow);
}

/* =================================
   Active
   ================================= */

.social-link:active {
  transform:
    scale(0.94) !important;
}

/* =================================
   Mobile
   ================================= */

@media (max-width: 420px) {
  .social-links {
    /*
     * 手机端仍然使用自动分配空间，
     * 不设置固定 gap。
     */
    justify-content:
      space-between;
  }

  .social-link {
    flex:
      0 0 38px;

    width:
      38px;

    height:
      38px;

    min-width:
      38px;

    min-height:
      38px;
  }

  .social-link__svg {
    width:
      20px;

    height:
      20px;

    flex-basis:
      20px;
  }

  .social-link__image {
    width:
      20px;

    height:
      20px;

    max-width:
      20px;

    max-height:
      20px;
  }

  .social-link__text {
    font-size:
      16px;
  }
}

/* =================================
   Reduced Motion
   ================================= */

@media (prefers-reduced-motion: reduce) {

  .social-link,
  .social-link__svg,
  .social-link__image,
  .social-link__text {
    transition:
      none;
  }

  .social-link:hover {
    transform:
      none;
  }

  .social-link:hover .social-link__svg,
  .social-link:hover .social-link__image,
  .social-link:hover .social-link__text {
    transform:
      none;
  }

  .social-link:active {
    transform:
      none !important;
  }
}
</style>