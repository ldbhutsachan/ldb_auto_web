<template>
  <div class="bg-tone-switcher" v-click-outside="close">
    <button class="header-btn" @click="open = !open" :title="t('theme.backgroundTone')">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10c1.38 0 2.5-1.12 2.5-2.5 0-.61-.23-1.2-.64-1.67-.08-.09-.13-.21-.13-.33 0-.28.22-.5.5-.5H16c3.31 0 6-2.69 6-6 0-4.96-4.49-9-10-9zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 8 6.5 8 8 8.67 8 9.5 7.33 11 6.5 11zm3-4C8.67 7 8 6.33 8 5.5S8.67 4 9.5 4s1.5.67 1.5 1.5S10.33 7 9.5 7zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 4 14.5 4s1.5.67 1.5 1.5S15.33 7 14.5 7zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 8 17.5 8s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
      </svg>
    </button>

    <div class="tone-popover" v-if="open">
      <div class="tone-popover-title">{{ t('theme.backgroundTone') }}</div>
      <div class="tone-grid">
        <button
          v-for="preset in BG_TONE_PRESETS"
          :key="preset.hex"
          class="tone-swatch"
          :class="{ active: isActive(preset.hex) }"
          :style="{ background: preset.hex }"
          :title="preset.name"
          @click="pick(preset.hex)"
        >
          <svg v-if="isActive(preset.hex)" width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>

      <div class="tone-custom-row">
        <label class="tone-custom-swatch" :style="{ background: themeStore.bgTone }">
          <input type="color" :value="themeStore.bgTone" @input="pick($event.target.value)" />
        </label>
        <span class="tone-custom-label">{{ t('theme.custom') }}</span>
        <button class="tone-reset" @click="themeStore.resetBgTone()">{{ t('theme.reset') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { t } from '@/i18n'
import { BG_TONE_PRESETS } from '@/utils/constants'

const themeStore = useThemeStore()
const open = ref(false)

function isActive(hex) {
  return themeStore.bgTone.toLowerCase() === hex.toLowerCase()
}

function pick(hex) {
  themeStore.setBgTone(hex)
}

function close() {
  open.value = false
}

const vClickOutside = {
  mounted(el, binding) {
    el._clickOutside = (event) => {
      if (!el.contains(event.target)) binding.value()
    }
    document.addEventListener('click', el._clickOutside, true)
  },
  unmounted(el) {
    document.removeEventListener('click', el._clickOutside, true)
  },
}
</script>

<style scoped>
.bg-tone-switcher {
  position: relative;
}

.header-btn {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #64748b;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.header-btn:hover {
  background: var(--gray-100, #f4f4f5);
  color: var(--text, #18181b);
  border-color: var(--border-hover, #d4d4d8);
}

.tone-popover {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 240px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
  padding: 16px;
  z-index: 200;
  animation: popIn 0.18s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes popIn {
  from { opacity: 0; transform: translateY(-6px) scale(0.97); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.tone-popover-title {
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 12px;
}

.tone-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 14px;
}

.tone-swatch {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1e293b;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.tone-swatch:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.tone-swatch.active {
  box-shadow: 0 0 0 2px white, 0 0 0 3.5px var(--accent, #2563eb);
}

.tone-custom-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
}

.tone-custom-swatch {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
  cursor: pointer;
  overflow: hidden;
  position: relative;
}

.tone-custom-swatch input[type='color'] {
  position: absolute;
  inset: -4px;
  width: calc(100% + 8px);
  height: calc(100% + 8px);
  border: none;
  padding: 0;
  cursor: pointer;
  opacity: 0;
}

.tone-custom-label {
  font-size: 12px;
  font-weight: 600;
  color: #475569;
  flex: 1;
}

.tone-reset {
  background: none;
  border: none;
  color: var(--accent, #2563eb);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 6px;
}

.tone-reset:hover {
  background: var(--accent-bg, #eff6ff);
}
</style>
