import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'

import './assets/styles/variables.scss'
import './assets/styles/animations.scss'
import './assets/styles/global.scss'

/* =================================
   初始化主题

   默认：暗色
   ================================= */

const savedTheme =
    localStorage.getItem('theme')

const initialTheme =
    savedTheme === 'light' ||
        savedTheme === 'dark'
        ? savedTheme
        : 'dark'

document.documentElement.dataset.theme =
    initialTheme

document.documentElement.style.colorScheme =
    initialTheme

/* =================================
   Vue
   ================================= */

const app = createApp(App)

const pinia = createPinia()

app.use(pinia)

app.mount('#app')