<template>
  <UPopover mode="click" :content="{ side: 'top', align: 'start' }">
    <UButton
      color="neutral"
      variant="ghost"
      block
      :square="collapsed"
      class="justify-start"
    >
      <UAvatar :text="initials" size="sm" />
      <div v-if="!collapsed" class="flex flex-col items-start min-w-0">
        <span class="text-sm font-medium truncate">{{ authStore.userName }}</span>
        <span class="text-xs text-muted truncate">{{ authStore.userRole }}</span>
      </div>
    </UButton>

    <template #content>
      <div class="w-64 p-2">
        <div class="px-2 py-1.5 mb-1">
          <p class="text-sm font-medium truncate">{{ authStore.userName }}</p>
          <p class="text-xs text-muted truncate">{{ authStore.user?.username }}</p>
        </div>
        <USeparator class="mb-1" />

        <UButton
          color="neutral"
          variant="ghost"
          block
          class="justify-start"
          icon="i-lucide-key-round"
          @click="showChangePwd = true"
        >
          {{ t('auth.changePassword') }}
        </UButton>

        <USeparator class="my-1" />

        <p class="px-2 pt-1 pb-1.5 text-xs font-medium text-muted uppercase tracking-wide">
          {{ t('theme.appearance') }}
        </p>
        <div class="flex gap-1 px-2 pb-2">
          <UButton
            :color="colorMode === 'light' ? 'primary' : 'neutral'"
            :variant="colorMode === 'light' ? 'soft' : 'ghost'"
            size="xs"
            icon="i-lucide-sun"
            block
            @click="setColorMode('light')"
          >
            {{ t('theme.light') }}
          </UButton>
          <UButton
            :color="colorMode === 'dark' ? 'primary' : 'neutral'"
            :variant="colorMode === 'dark' ? 'soft' : 'ghost'"
            size="xs"
            icon="i-lucide-moon"
            block
            @click="setColorMode('dark')"
          >
            {{ t('theme.dark') }}
          </UButton>
        </div>

        <!-- Tone tinting is a light-surface concept only, hidden in dark mode -->
        <div v-if="colorMode === 'light'" class="px-2 pb-2">
          <div class="grid grid-cols-4 gap-2">
            <button
              v-for="preset in BG_TONE_PRESETS"
              :key="preset.hex"
              type="button"
              class="aspect-square rounded-lg border border-black/10 cursor-pointer transition hover:-translate-y-0.5"
              :class="isActiveTone(preset.hex) ? 'ring-2 ring-primary ring-offset-2 ring-offset-default' : ''"
              :style="{ background: preset.hex }"
              :title="preset.name"
              @click="themeStore.setBgTone(preset.hex)"
            />
          </div>
        </div>

        <USeparator class="my-1" />

        <UButton
          color="error"
          variant="ghost"
          block
          class="justify-start"
          icon="i-lucide-log-out"
          @click="authStore.logout()"
        >
          {{ t('nav.logout') }}
        </UButton>
      </div>
    </template>
  </UPopover>

  <ChangePasswordModal v-if="showChangePwd" @close="showChangePwd = false" />
</template>

<script setup>
import { ref, computed } from 'vue'
import { useColorMode } from '@vueuse/core'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import { t } from '@/i18n'
import { BG_TONE_PRESETS } from '@/utils/constants'
import ChangePasswordModal from './ChangePasswordModal.vue'

defineProps({ collapsed: Boolean })

const authStore = useAuthStore()
const themeStore = useThemeStore()
const colorMode = useColorMode()
const showChangePwd = ref(false)

const initials = computed(() => {
  const name = authStore.userName
  if (!name) return 'U'
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
})

function isActiveTone(hex) {
  return themeStore.bgTone.toLowerCase() === hex.toLowerCase()
}

function setColorMode(mode) {
  colorMode.value = mode
  themeStore.syncColorMode(mode)
}
</script>
