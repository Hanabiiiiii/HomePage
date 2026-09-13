<script setup lang="ts">
import ProfileCard from '@/components/Profile/ProfileCard.vue'
import SiteLinks from '@/components/SiteLinks/SiteLinks.vue'
import SocialLinks from '@/components/SocialLinks/SocialLinks.vue'
import HitokotoCard from '@/components/Hitokoto/HitokotoCard.vue'
import WeatherCard from '@/components/Weather/WeatherCard.vue'
import MusicPlayer from '@/components/Music/MusicPlayer.vue'
import { siteConfig } from '@/config/site'
</script>

<template>
  <div class="home-page">
    <div class="home-container">
      <section class="home-profile-column">
        <ProfileCard />

        <section class="profile-description liquid-glass">
          <p class="liquid-glass-text">
            {{ siteConfig.description }}
          </p>
        </section>

        <WeatherCard />

        <SocialLinks />
      </section>

      <section class="home-content-column">
        <MusicPlayer />
        <SiteLinks />
        <HitokotoCard />

        <footer class="home-footer liquid-glass-text">
          <span>
            © {{ new Date().getFullYear() }} {{ siteConfig.profile.name }}
          </span>

          <span class="footer-divider">·</span>

          <span>Made with Vue</span>
        </footer>
      </section>
    </div>
  </div>
</template>

<style scoped>
.home-page {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 100vh;
  padding: 32px 24px;
}

.home-container {
  display: grid;
  grid-template-columns: minmax(260px, 0.85fr) minmax(0, 1.35fr);
  align-items: center;
  gap: 28px;
  width: min(1120px, 100%);
  margin: 0 auto;
}

.home-profile-column,
.home-content-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
}

.profile-description {
  padding: 20px 22px;
}

.profile-description p {
  margin: 0;
  color: var(--text-color);
  font-size: 14px;
  line-height: 1.9;
  text-align: center;
  overflow-wrap: anywhere;
  text-shadow: var(--text-shadow);
  transition:
    color 0.35s ease,
    text-shadow 0.35s ease;
}

.home-footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 4px 8px 0;
  color: var(--text-secondary);
  font-size: 12px;
  line-height: 1.6;
  text-align: center;
}

.footer-divider {
  opacity: 0.5;
}

@media (max-width: 900px) {
  .home-container {
    grid-template-columns: minmax(220px, 0.8fr) minmax(0, 1.2fr);
    gap: 20px;
  }

  .home-page {
    padding-inline: 18px;
  }
}

@media (max-width: 760px) {
  .home-page {
    display: block;
    min-height: auto;
    padding: 28px 16px 22px;
  }

  .home-container {
    grid-template-columns: minmax(0, 1fr);
    gap: 20px;
    max-width: 560px;
  }

  .home-profile-column,
  .home-content-column {
    gap: 16px;
  }

  .home-footer {
    padding-top: 2px;
  }
}
</style>
