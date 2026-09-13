<script setup lang="ts">
import { siteConfig } from '@/config/site'
</script>

<template>
  <nav class="site-links" aria-label="网站链接">
    <a v-for="link in siteConfig.links" :key="link.url" class="site-link liquid-glass" :href="link.url" target="_blank"
      rel="noopener noreferrer">
      <!-- =========================
           Icon
           ========================= -->

      <span class="site-link__icon" aria-hidden="true">
        {{ link.icon || '↗' }}
      </span>

      <!-- =========================
           Content
           ========================= -->

      <span class="site-link__content">
        <strong class="site-link__title">
          {{ link.title }}
        </strong>

        <span v-if="link.description" class="site-link__description">
          {{ link.description }}
        </span>
      </span>

      <!-- =========================
           Arrow
           ========================= -->

      <span class="site-link__arrow" aria-hidden="true">
        ↗
      </span>
    </a>
  </nav>
</template>

<style scoped lang="scss">
/* =================================
   Container
   ================================= */

.site-links {
  display: flex;

  flex-direction: column;

  gap: 12px;

  width: 100%;
}

/* =================================
   Link
   ================================= */

.site-link {
  display: flex;

  align-items: center;

  gap: 14px;

  min-width: 0;

  padding:
    16px 18px;

  color:
    var(--text-color);

  text-decoration: none;

  transition:
    color 0.35s ease;
}

/* =================================
   Icon
   ================================= */

.site-link__icon {
  display: grid;

  flex:
    0 0 42px;

  width: 42px;
  height: 42px;

  place-items: center;

  color:
    var(--accent-color);

  font-size: 20px;

  background:
    rgb(255 255 255 / 9%);

  border:
    1px solid rgb(255 255 255 / 22%);

  border-radius:
    13px;

  box-shadow:
    inset 1px -1px 1px rgb(255 255 255 / 55%),

    inset -1px 1px 1px rgb(255 255 255 / 18%);

  transition:
    color 0.35s ease,
    background 0.35s ease,
    border-color 0.35s ease,
    box-shadow 0.35s ease;
}

/* =================================
   Content
   ================================= */

.site-link__content {
  display: flex;

  flex:
    1;

  flex-direction: column;

  min-width: 0;

  gap: 4px;
}

/* =================================
   Title
   ================================= */

.site-link__title {
  overflow: hidden;

  color:
    var(--text-color);

  font-size: 15px;

  font-weight: 700;

  line-height: 1.5;

  text-overflow:
    ellipsis;

  white-space:
    nowrap;

  text-shadow:
    var(--text-shadow);

  transition:
    color 0.35s ease,
    text-shadow 0.35s ease;
}

/* =================================
   Description
   ================================= */

.site-link__description {
  overflow: hidden;

  color:
    var(--text-secondary);

  font-size: 12px;

  line-height: 1.5;

  text-overflow:
    ellipsis;

  white-space:
    nowrap;

  text-shadow:
    var(--text-shadow-secondary);

  transition:
    color 0.35s ease,
    text-shadow 0.35s ease;
}

/* =================================
   Arrow
   ================================= */

.site-link__arrow {
  flex:
    0 0 auto;

  color:
    var(--text-secondary);

  font-size: 18px;

  line-height: 1;

  text-shadow:
    var(--text-shadow-secondary);

  transition:
    color 0.35s ease,
    text-shadow 0.35s ease,
    transform 0.25s ease;
}

/* =================================
   Hover
   ================================= */

.site-link:hover .site-link__icon {
  background:
    rgb(255 255 255 / 14%);

  border-color:
    rgb(255 255 255 / 34%);
}

.site-link:hover .site-link__arrow {
  color:
    var(--accent-color);

  transform:
    translate(2px,
      -2px);
}

/* =================================
   Mobile
   ================================= */

@media (max-width: 420px) {
  .site-link {
    gap: 12px;

    padding:
      14px;
  }

  .site-link__icon {
    flex-basis: 38px;

    width: 38px;
    height: 38px;

    font-size: 18px;
  }

  .site-link__title {
    font-size: 14px;
  }
}

/* =================================
   Reduced Motion
   ================================= */

@media (prefers-reduced-motion: reduce) {

  .site-link,
  .site-link__icon,
  .site-link__title,
  .site-link__description,
  .site-link__arrow {
    transition: none;
  }

  .site-link:hover .site-link__arrow {
    transform: none;
  }
}
</style>