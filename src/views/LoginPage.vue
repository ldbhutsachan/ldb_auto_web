<template>
  <div class="login-page">
    <div class="login-container">
      <!-- Brand Side -->
      <div class="brand-section">
        <div class="brand-content">
          <div class="brand-logo">
            <img :src="logoUrl" alt="Logo" />
          </div>
          <h1 class="brand-title">{{ t('auth.welcomeBack') }}</h1>
          <p class="brand-subtitle">{{ t('auth.loginSubtitle') }}</p>
          <div class="brand-features">
            <div class="feature-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              <span>Auto Debit Payment</span>
            </div>
            <div class="feature-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              <span>Secure Transactions</span>
            </div>
            <div class="feature-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              <span>Real-time Monitoring</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Login Card -->
      <div class="login-card">
        <div class="card-header">
          <div class="mobile-logo">
            <img :src="logoUrl" alt="Logo" />
          </div>
          <h2 class="card-title">{{ t('auth.login') }}</h2>
          <p class="card-desc">{{ t('auth.loginSubtitle') }}</p>
        </div>

        <form class="login-form" @submit.prevent="handleLogin">
          <div class="form-group">
            <label for="username">{{ t('auth.username') }}</label>
            <div class="input-wrapper" :class="{ focused: focusedField === 'username', filled: username }">
              <svg class="input-icon" width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
              </svg>
              <input id="username" v-model="username" type="text" :placeholder="t('auth.placeholderUsername')"
                @focus="focusedField = 'username'" @blur="focusedField = null" autocomplete="username"
                :disabled="authStore.loading" />
            </div>
          </div>

          <div class="form-group">
            <label for="password">{{ t('auth.password') }}</label>
            <div class="input-wrapper" :class="{ focused: focusedField === 'password', filled: password }">
              <svg class="input-icon" width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clip-rule="evenodd" />
              </svg>
              <input id="password" v-model="password" :type="showPassword ? 'text' : 'password'"
                :placeholder="t('auth.placeholderPassword')" @focus="focusedField = 'password'"
                @blur="focusedField = null" autocomplete="current-password" :disabled="authStore.loading" />
              <button type="button" class="toggle-password" @click="showPassword = !showPassword">
                <svg v-if="!showPassword" width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fill-rule="evenodd"
                    d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                    clip-rule="evenodd" />
                </svg>
                <svg v-else width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd"
                    d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                    clip-rule="evenodd" />
                  <path
                    d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                </svg>
              </button>
            </div>
          </div>

          <div class="error-message" v-if="authStore.error">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clip-rule="evenodd" />
            </svg>
            {{ t('auth.invalidCredentials') }}
          </div>

          <button type="submit" class="login-button" :disabled="authStore.loading || !username || !password">
            <span v-if="!authStore.loading">{{ t('auth.loginButton') }}</span>
            <span v-else class="loading-spinner">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path
                  d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
              {{ t('auth.loggingIn') }}
            </span>
          </button>
        </form>

        <div class="card-footer">
          <div class="lang-switch">
            <button :class="{ active: isLang === 'en' }" @click="switchLang('en')">EN</button>
            <button :class="{ active: isLang === 'lo' }" @click="switchLang('lo')">ລາວ</button>
          </div>
          <p class="demo-hint">Demo: admin / admin123</p>
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

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const showPassword = ref(false)
const focusedField = ref(null)
const isLang = ref(getLanguage())

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

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(circle at 1px 1px, #cfe0f7 1px, transparent 0) 0 0 / 24px 24px,
    #eaf3fd;
  padding: 20px;
}

/* ===== LOGIN CONTAINER ===== */
.login-container {
  display: flex;
  width: 100%;
  max-width: 900px;
  min-height: 540px;
  border-radius: var(--radius-xl, 18px);
  overflow: hidden;
  border: 1px solid var(--border, #e4e4e7);
  box-shadow: var(--shadow-lg);
  animation: slideUp 0.4s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ===== BRAND SECTION — subtle photo behind a flat dark scrim ===== */
.brand-section {
  flex: 1;
  background:
    linear-gradient(rgba(30, 58, 95, 0.85), rgba(30, 58, 95, 0.85)),
    url('@/assets/icon-bg/bg-ldb.jpg') center / cover no-repeat;
  padding: 48px 40px;
  display: flex;
  align-items: center;
}

.brand-content {
  width: 100%;
}

.brand-logo {
  width: 64px;
  height: 64px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 28px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.brand-logo img {
  width: 38px;
  height: 38px;
  object-fit: contain;
}

.brand-title {
  font-size: 26px;
  font-weight: 700;
  color: white;
  margin: 0 0 10px;
  line-height: 1.2;
}

.brand-subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.55);
  margin: 0 0 36px;
  line-height: 1.6;
}

.brand-features {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  color: rgba(255, 255, 255, 0.75);
  font-size: 14px;
  font-weight: 500;
}

.feature-item svg {
  color: rgba(255, 255, 255, 0.4);
  flex-shrink: 0;
}

/* ===== LOGIN CARD ===== */
.login-card {
  width: 400px;
  background: white;
  padding: 48px 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.mobile-logo {
  display: none;
  width: 52px;
  height: 52px;
  background: var(--gray-100, #f4f4f5);
  border-radius: 14px;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.mobile-logo img {
  width: 30px;
  height: 30px;
  object-fit: contain;
}

.card-header {
  text-align: center;
  margin-bottom: 32px;
}

.card-title {
  font-size: 21px;
  font-weight: 700;
  color: var(--text, #18181b);
  margin: 0 0 6px;
}

.card-desc {
  font-size: 14px;
  color: var(--text-muted, #a1a1aa);
  margin: 0;
}

/* ===== FORM ===== */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary, #52525b);
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  background: var(--gray-50, #fafafa);
  border: 1.5px solid var(--border, #e4e4e7);
  border-radius: var(--radius-sm, 8px);
  transition: all 0.2s;
}

.input-wrapper.focused,
.input-wrapper.filled {
  border-color: var(--accent, #2563eb);
  background: white;
}

.input-wrapper.focused {
  box-shadow: 0 0 0 3px var(--accent-bg, #eff6ff);
}

.input-icon {
  color: var(--text-muted, #a1a1aa);
  flex-shrink: 0;
  transition: color 0.2s;
}

.input-wrapper.focused .input-icon {
  color: var(--accent, #2563eb);
}

.input-wrapper input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 14px;
  color: var(--text, #18181b);
  outline: none;
  font-family: inherit;
}

.input-wrapper input::placeholder {
  color: var(--text-muted, #a1a1aa);
}

.input-wrapper input:disabled {
  opacity: 0.6;
}

.toggle-password {
  background: none;
  border: none;
  color: var(--text-muted, #a1a1aa);
  cursor: pointer;
  padding: 4px;
  display: flex;
  transition: color 0.2s;
}

.toggle-password:hover {
  color: var(--text-secondary, #52525b);
}

.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  background: var(--danger-bg, #fef2f2);
  border: 1px solid #fecaca;
  border-radius: var(--radius-sm, 8px);
  color: #dc2626;
  font-size: 13px;
  font-weight: 500;
  animation: shake 0.4s ease;
}

@keyframes shake {

  0%,
  100% {
    transform: translateX(0);
  }

  20% {
    transform: translateX(-4px);
  }

  40% {
    transform: translateX(4px);
  }

  60% {
    transform: translateX(-4px);
  }

  80% {
    transform: translateX(4px);
  }
}

.login-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 13px 24px;
  background: var(--primary-800, #18181b);
  color: white;
  border: none;
  border-radius: var(--radius-sm, 8px);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  font-family: inherit;
  margin-top: 4px;
}

.login-button:hover:not(:disabled) {
  background: var(--primary-900, #09090b);
}

.login-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading-spinner {
  display: flex;
  align-items: center;
  gap: 8px;
}

.loading-spinner svg {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ===== FOOTER ===== */
.card-footer {
  margin-top: 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

.lang-switch {
  display: flex;
  gap: 4px;
  padding: 4px;
  background: var(--gray-100, #f4f4f5);
  border-radius: var(--radius-sm, 8px);
}

.lang-switch button {
  padding: 6px 18px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--text-secondary, #52525b);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.lang-switch button.active {
  background: white;
  color: var(--text, #18181b);
  box-shadow: var(--shadow-xs);
}

.demo-hint {
  font-size: 12px;
  color: var(--text-muted, #a1a1aa);
  margin: 0;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  .brand-section {
    display: none;
  }

  .login-card {
    width: 100%;
    max-width: 400px;
    padding: 36px 28px;
    border-radius: var(--radius-lg, 14px);
  }

  .mobile-logo {
    display: flex;
  }

  .login-container {
    border-radius: var(--radius-lg, 14px);
    min-height: auto;
  }
}

@media (max-width: 480px) {
  .login-card {
    padding: 28px 20px;
  }

  .card-title {
    font-size: 19px;
  }
}
</style>
