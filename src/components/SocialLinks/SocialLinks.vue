
<script setup lang="ts">
import { siteConfig } from '@/config/site'
</script>

<template>
  <nav class="social-links" aria-label="社交链接">
    <a
      v-for="social in siteConfig.socials"
      :key="social.url"
      class="social-link liquid-glass-button"
      :href="social.url"
      :aria-label="social.title"
      :title="social.title"
      target="_blank"
      rel="noopener noreferrer"
    >
      <span aria-hidden="true">
        {{ social.icon || '↗' }}
      </span>
    </a>
  </nav>
</template>

<style scoped lang="scss">
.social-links {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
}

.social-link {
  width: 42px;
  height: 42px;
  color: var(--text-color);
  font-size: 18px;
  text-decoration: none;
}

.social-link:hover {
  color: var(--accent-color);
}

@media (max-width: 420px) {
  .social-link {
    width: 38px;
    height: 38px;
    font-size: 16px;
  }
}
</style>