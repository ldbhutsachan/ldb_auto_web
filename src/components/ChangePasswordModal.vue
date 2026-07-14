<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-card">
        <div class="modal-header">
          <h3 class="modal-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1a5 5 0 00-5 5v2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V10a2 2 0 00-2-2h-2V6a5 5 0 00-5-5zm-3 5a3 3 0 116 0v2H9V6zm3 6a2 2 0 011 3.732V18h-2v-2.268A2 2 0 0112 12z"/>
            </svg>
            {{ t('auth.changePassword') }}
          </h3>
          <button class="modal-close" @click="$emit('close')">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
          </button>
        </div>

        <form class="modal-body" @submit.prevent="handleChangePassword">
          <div class="form-group">
            <label>{{ t('auth.currentPassword') }}</label>
            <div class="input-wrapper">
              <svg class="input-icon" width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/>
              </svg>
              <input
                v-model="oldPassword"
                type="password"
                :placeholder="t('auth.enterCurrentPassword')"
                :disabled="submitting"
                autocomplete="current-password"
              />
            </div>
          </div>

          <div class="form-group">
            <label>{{ t('auth.newPassword') }}</label>
            <div class="input-wrapper">
              <svg class="input-icon" width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/>
              </svg>
              <input
                v-model="newPassword"
                type="password"
                :placeholder="t('auth.enterNewPassword')"
                :disabled="submitting"
                autocomplete="new-password"
              />
            </div>
          </div>

          <div class="form-group">
            <label>{{ t('auth.confirmNewPassword') }}</label>
            <div class="input-wrapper">
              <svg class="input-icon" width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/>
              </svg>
              <input
                v-model="confirmPassword"
                type="password"
                :placeholder="t('auth.confirmNewPassword')"
                :disabled="submitting"
                autocomplete="new-password"
              />
            </div>
          </div>

          <div v-if="errorMsg" class="error-message">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
            </svg>
            {{ errorMsg }}
          </div>

          <div v-if="successMsg" class="success-message">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            {{ successMsg }}
          </div>

          <div class="modal-actions">
            <button type="button" class="btn-cancel" @click="$emit('close')" :disabled="submitting">
              {{ t('common.cancel') }}
            </button>
            <button type="submit" class="btn-submit" :disabled="submitting || !isValid">
              <span v-if="!submitting">{{ t('common.save') }}</span>
              <span v-else class="loading-spinner">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
                {{ t('common.saving') }}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { changePassword } from '@/services/api'
import { t } from '@/i18n'

const emit = defineEmits(['close', 'success'])
const authStore = useAuthStore()

const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const submitting = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

const isValid = computed(() => {
  return oldPassword.value.length > 0
    && newPassword.value.length > 0
    && confirmPassword.value.length > 0
    && newPassword.value === confirmPassword.value
})

async function handleChangePassword() {
  if (newPassword.value !== confirmPassword.value) {
    errorMsg.value = t('auth.passwordsDoNotMatch')
    return
  }

  submitting.value = true
  errorMsg.value = ''
  successMsg.value = ''

  try {
    const result = await changePassword(
      authStore.user?.username || '',
      oldPassword.value,
      newPassword.value
    )

    if (result.status === '00') {
      successMsg.value = result.message || t('auth.passwordChangedSuccess')
      setTimeout(() => {
        emit('success')
        emit('close')
      }, 1500)
    } else {
      errorMsg.value = result.message || t('auth.passwordChangeFailed')
    }
  } catch (err) {
    errorMsg.value = err.message || t('auth.passwordChangeFailed')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-card {
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 28px 0;
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.modal-title svg {
  color: #4F46E5;
  width: 22px;
  height: 22px;
}

.modal-close {
  background: #f3f4f6;
  border: none;
  color: #6b7280;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-close:hover {
  background: #e5e7eb;
  color: #111827;
}

.modal-body {
  padding: 20px 28px 28px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 14px;
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  transition: all 0.2s;
}

.input-wrapper:focus-within {
  border-color: #4F46E5;
  background: white;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.input-icon {
  color: #9ca3af;
  flex-shrink: 0;
}

.input-wrapper:focus-within .input-icon {
  color: #4F46E5;
}

.input-wrapper input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 14px;
  color: #111827;
  outline: none;
  font-family: inherit;
}

.input-wrapper input::placeholder {
  color: #9ca3af;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 10px;
  color: #dc2626;
  font-size: 13px;
  font-weight: 500;
  animation: shake 0.4s ease;
}

.success-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  border-radius: 10px;
  color: #059669;
  font-size: 13px;
  font-weight: 500;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-4px); }
  40% { transform: translateX(4px); }
  60% { transform: translateX(-4px); }
  80% { transform: translateX(4px); }
}

.modal-actions {
  display: flex;
  gap: 10px;
  margin-top: 4px;
}

.btn-cancel,
.btn-submit {
  flex: 1;
  padding: 12px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
}

.btn-cancel {
  background: #f3f4f6;
  color: #6b7280;
}

.btn-cancel:hover:not(:disabled) {
  background: #e5e7eb;
  color: #374151;
}

.btn-submit {
  background: var(--primary-800, #18181b);
  color: white;
}

.btn-submit:hover:not(:disabled) {
  background: var(--primary-900, #09090b);
}

.btn-submit:disabled,
.btn-cancel:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-spinner {
  display: flex;
  align-items: center;
  gap: 6px;
}

.loading-spinner svg {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
