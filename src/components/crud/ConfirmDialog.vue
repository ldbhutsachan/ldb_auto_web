<template>
  <UModal v-model:open="isOpen" :title="title">
    <template #body>
      <p class="text-sm text-muted">{{ message }}</p>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2 w-full">
        <UButton color="neutral" variant="ghost" @click="isOpen = false">{{ t('common.cancel') }}</UButton>
        <UButton :color="danger ? 'error' : 'primary'" :loading="loading" @click="$emit('confirm')">
          {{ confirmLabel || t('common.confirm') }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup>
import { computed } from 'vue'
import { t } from '@/i18n'

const props = defineProps({
  open: Boolean,
  title: { type: String, default: '' },
  message: { type: String, default: '' },
  confirmLabel: { type: String, default: '' },
  danger: Boolean,
  loading: Boolean,
})
const emit = defineEmits(['update:open', 'confirm'])

const isOpen = computed({
  get: () => props.open,
  set: (v) => emit('update:open', v),
})
</script>
