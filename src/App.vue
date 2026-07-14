<template>
  <UApp>
    <router-view />
  </UApp>
</template>

<script setup>
import { onMounted } from 'vue'
import { useColorMode } from '@vueuse/core'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'

const authStore = useAuthStore()
const themeStore = useThemeStore()

// Applying the `.dark` class here (synchronously, before children mount)
// ensures themeStore.init() below can correctly detect the active color
// mode and never overrides the dark background with a light tone.
useColorMode()

onMounted(() => {
  authStore.init()
  themeStore.init()
})
</script>
