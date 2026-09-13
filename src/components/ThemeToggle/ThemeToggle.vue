<script setup lang="ts">
import { computed, ref } from 'vue'

type Theme = 'dark' | 'light'

const theme = ref<Theme>(
    document.documentElement.dataset.theme === 'light'
        ? 'light'
        : 'dark',
)

const isDark = computed(() => {
    return theme.value === 'dark'
})

function setTheme(value: Theme) {
    theme.value = value

    document.documentElement.dataset.theme =
        value

    document.documentElement.style.colorScheme =
        value

    localStorage.setItem('theme', value)
}

function toggleTheme() {
    setTheme(
        theme.value === 'dark'
            ? 'light'
            : 'dark',
    )
}
</script>

<template>
    <button class="theme-toggle liquid-glass-button" type="button" :aria-label="isDark
            ? '切换到浅色主题'
            : '切换到深色主题'
        " :title="isDark
            ? '浅色主题'
            : '深色主题'
        " @click="toggleTheme">
        <!-- =================================
         暗色主题：月亮
         ================================= -->

        <svg v-if="isDark" class="theme-icon moon-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="
          M20.5 14.4
          A8.5 8.5 0 0 1
          9.6 3.5
          A8.5 8.5 0 1 0
          20.5 14.4
          Z
        " stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />

            <path d="M17.5 5.5h.01" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />

            <path d="M20 8h.01" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
        </svg>

        <!-- =================================
         浅色主题：太阳
         ================================= -->

        <svg v-else class="theme-icon sun-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.8" />

            <path d="M12 2v2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />

            <path d="M12 20v2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />

            <path d="m4.93 4.93 1.42 1.42" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />

            <path d="m17.65 17.65 1.42 1.42" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />

            <path d="M2 12h2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />

            <path d="M20 12h2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />

            <path d="m4.93 19.07 1.42-1.42" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />

            <path d="m17.65 6.35 1.42-1.42" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
        </svg>
    </button>
</template>

<style scoped>
.theme-toggle {
    position: fixed;

    top: 22px;
    right: 22px;

    z-index: 900;

    width: 44px;
    height: 44px;

    padding: 0;

    display: inline-flex;
    align-items: center;
    justify-content: center;

    border-radius: 50%;

    color: var(--text-color);

    cursor: pointer;
}

.theme-icon {
    width: 19px;
    height: 19px;

    flex: none;

    transition:
        transform 0.28s ease,
        color 0.28s ease;
}

.theme-toggle:hover .theme-icon {
    transform:
        rotate(15deg) scale(1.08);
}

.theme-toggle:active .theme-icon {
    transform: scale(0.92);
}

/* =================================
   Mobile
   ================================= */

@media (max-width: 760px) {
    .theme-toggle {
        top: 14px;
        right: 14px;

        width: 40px;
        height: 40px;
    }

    .theme-icon {
        width: 18px;
        height: 18px;
    }
}

/* =================================
   Reduced Motion
   ================================= */

@media (prefers-reduced-motion: reduce) {
    .theme-icon {
        transition: none;
    }

    .theme-toggle:hover .theme-icon,
    .theme-toggle:active .theme-icon {
        transform: none;
    }
}
</style>