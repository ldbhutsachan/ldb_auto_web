import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from '@/router'
import ui from '@nuxt/ui/vue-plugin'
import App from '@/App.vue'
import '@/assets/css/main.css'

const app = createApp(App)

// Initialize Pinia (state management)
const pinia = createPinia()
app.use(pinia)

// Initialize Nuxt UI (component library + toast/tooltip/overlay providers)
app.use(ui)

// Initialize Router
app.use(router)

// Mount the app
app.mount('#app')
