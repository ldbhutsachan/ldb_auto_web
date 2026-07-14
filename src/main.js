import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from '@/router'
import vuetify from '@/plugins/vuetify'
import App from './App.vue'
import './styles/main.css'
import '@mdi/font/css/materialdesignicons.css'

const app = createApp(App)

// Initialize Pinia (state management)
const pinia = createPinia()
app.use(pinia)

// Initialize Vuetify (UI framework)
app.use(vuetify)

// Initialize Router
app.use(router)

// Mount the app
app.mount('#app')
