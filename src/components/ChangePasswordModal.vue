<template>
  <UModal :open="true" :title="t('auth.changePassword')" @update:open="(v) => !v && $emit('close')">
    <template #body>
      <form class="flex flex-col gap-4" @submit.prevent="handleChangePassword">
        <UFormField :label="t('auth.currentPassword')">
          <UInput
            v-model="oldPassword"
            type="password"
            icon="i-lucide-lock"
            :placeholder="t('auth.enterCurrentPassword')"
            :disabled="submitting"
            autocomplete="current-password"
            class="w-full"
          />
        </UFormField>

        <UFormField :label="t('auth.newPassword')">
          <UInput
            v-model="newPassword"
            type="password"
            icon="i-lucide-lock"
            :placeholder="t('auth.enterNewPassword')"
            :disabled="submitting"
            autocomplete="new-password"
            class="w-full"
          />
        </UFormField>

        <UFormField :label="t('auth.confirmNewPassword')">
          <UInput
            v-model="confirmPassword"
            type="password"
            icon="i-lucide-lock"
            :placeholder="t('auth.confirmNewPassword')"
            :disabled="submitting"
            autocomplete="new-password"
            class="w-full"
          />
        </UFormField>

        <UAlert v-if="errorMsg" color="error" variant="subtle" icon="i-lucide-alert-triangle" :title="errorMsg" />
        <UAlert v-if="successMsg" color="success" variant="subtle" icon="i-lucide-check-circle" :title="successMsg" />

        <div class="flex gap-2 pt-1">
          <UButton color="neutral" variant="soft" block :disabled="submitting" @click="$emit('close')">
            {{ t('common.cancel') }}
          </UButton>
          <UButton type="submit" block :loading="submitting" :disabled="submitting || !isValid">
            {{ t('common.save') }}
          </UButton>
        </div>
      </form>
    </template>
  </UModal>
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
