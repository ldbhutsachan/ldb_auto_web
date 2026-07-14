<template>
  <div class="min-h-screen flex items-center justify-center p-5 bg-elevated">
    <div class="flex w-full max-w-4xl min-h-[540px] rounded-2xl overflow-hidden border border-default shadow-lg">
      <!-- Brand Side -->
      <div
        class="hidden md:flex flex-1 items-center p-12 bg-cover bg-center"
        :style="{ backgroundImage: `linear-gradient(rgba(30,58,95,.85), rgba(30,58,95,.85)), url(${bgUrl})` }"
      >
        <div class="w-full">
          <div class="flex items-center justify-center size-16 rounded-2xl bg-white/8 border border-white/10 mb-7">
            <img :src="logoUrl" alt="Logo" class="size-9 object-contain" />
          </div>
          <h1 class="text-2xl font-bold text-white mb-2.5 leading-tight">{{ t('auth.welcomeBack') }}</h1>
          <p class="text-sm text-white/55 mb-9 leading-relaxed">{{ t('auth.loginSubtitle') }}</p>
          <div class="flex flex-col gap-3.5">
            <div v-for="feature in features" :key="feature" class="flex items-center gap-3 text-white/75 text-sm font-medium">
              <UIcon name="i-lucide-check-circle" class="size-4.5 text-white/40 shrink-0" />
              <span>{{ feature }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Login Card -->
      <div class="w-full md:w-[400px] bg-default flex flex-col justify-center p-9 md:p-12">
        <div class="text-center mb-8">
          <div class="md:hidden flex items-center justify-center size-13 rounded-2xl bg-elevated mb-5 mx-auto">
            <img :src="logoUrl" alt="Logo" class="size-8 object-contain" />
          </div>
          <h2 class="text-xl font-bold mb-1.5">{{ t('auth.login') }}</h2>
          <p class="text-sm text-muted">{{ t('auth.loginSubtitle') }}</p>
        </div>

        <form class="flex flex-col gap-4.5" @submit.prevent="handleLogin">
          <UFormField :label="t('auth.username')">
            <UInput
              v-model="username"
              icon="i-lucide-user"
              :placeholder="t('auth.placeholderUsername')"
              autocomplete="username"
              :disabled="authStore.loading"
              class="w-full"
            />
          </UFormField>

          <UFormField :label="t('auth.password')">
            <UInput
              v-model="password"
              icon="i-lucide-lock"
              :type="showPassword ? 'text' : 'password'"
              :placeholder="t('auth.placeholderPassword')"
              autocomplete="current-password"
              :disabled="authStore.loading"
              class="w-full"
              :ui="{ trailing: 'pe-1' }"
            >
              <template #trailing>
                <UButton
                  color="neutral"
                  variant="link"
                  size="sm"
                  :icon="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                  :aria-label="showPassword ? 'Hide password' : 'Show password'"
                  @click="showPassword = !showPassword"
                />
              </template>
            </UInput>
          </UFormField>

          <UAlert v-if="authStore.error" color="error" variant="subtle" icon="i-lucide-alert-triangle" :title="t('auth.invalidCredentials')" />

          <UButton
            type="submit"
            block
            size="lg"
            color="neutral"
            :loading="authStore.loading"
            :disabled="authStore.loading || !username || !password"
          >
            {{ authStore.loading ? t('auth.loggingIn') : t('auth.loginButton') }}
          </UButton>
        </form>

        <div class="mt-7 flex flex-col items-center gap-3.5">
          <div class="flex gap-1 p-1 rounded-lg bg-elevated">
            <button
              class="px-4.5 py-1.5 rounded-md text-xs font-semibold transition-colors"
              :class="isLang === 'en' ? 'bg-default text-highlighted shadow-xs' : 'text-muted'"
              @click="switchLang('en')"
            >EN</button>
            <button
              class="px-4.5 py-1.5 rounded-md text-xs font-semibold transition-colors"
              :class="isLang === 'lo' ? 'bg-default text-highlighted shadow-xs' : 'text-muted'"
              @click="switchLang('lo')"
            >ລາວ</button>
          </div>
          <p class="text-xs text-muted">Demo: admin / admin123</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { t, getLanguage, setLanguage } from '@/i18n'
import logoUrl from '@/assets/icon-bg/logo.png'
import bgUrl from '@/assets/icon-bg/bg-ldb.jpg'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const showPassword = ref(false)
const isLang = ref(getLanguage())

const features = ['Auto Debit Payment', 'Secure Transactions', 'Real-time Monitoring']

onMounted(() => {
  if (authStore.isAuthenticated) {
    router.push('/dashboard')
  }
})

async function handleLogin() {
  const success = await authStore.login(username.value, password.value)
  if (success) {
    router.push('/dashboard')
  }
}

function switchLang(lang) {
  setLanguage(lang)
  isLang.value = lang
}
</script>
