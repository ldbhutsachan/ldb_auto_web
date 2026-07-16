<template>
  <UModal v-model:open="isOpen" :title="title">
    <template #body>
      <UForm :state="state" class="flex flex-col gap-4" @submit="handleSubmit">
        <UFormField
          v-for="field in fields"
          :key="field.name"
          :label="field.label"
          :name="field.name"
          :required="field.required"
        >
          <UInput
            v-if="!field.type || field.type === 'text' || field.type === 'number'"
            v-model="state[field.name]"
            :type="field.type === 'number' ? 'number' : 'text'"
            :placeholder="field.placeholder"
            class="w-full"
          />
          <USelect
            v-else-if="field.type === 'select'"
            v-model="state[field.name]"
            :items="field.options || []"
            :placeholder="field.placeholder"
            class="w-full"
          />
          <USelectMenu
            v-else-if="field.type === 'combobox'"
            v-model="state[field.name]"
            :items="field.options || []"
            value-key="value"
            :placeholder="field.placeholder"
            class="w-full"
          />
          <UTextarea
            v-else-if="field.type === 'textarea'"
            v-model="state[field.name]"
            :placeholder="field.placeholder"
            class="w-full"
          />
          <UInput
            v-else-if="field.type === 'date'"
            v-model="state[field.name]"
            type="date"
            class="w-full"
          />
          <input
            v-else-if="field.type === 'file'"
            type="file"
            :accept="field.accept"
            class="block w-full text-sm text-muted file:mr-3 file:rounded-md file:border-0 file:bg-elevated file:px-3 file:py-1.5 file:text-sm"
            @change="onFileChange($event, field.name)"
          />
        </UFormField>

        <UAlert v-if="error" color="error" variant="subtle" :title="error" />

        <div class="flex justify-end gap-2 pt-2">
          <UButton color="neutral" variant="ghost" @click="isOpen = false">{{ t('common.cancel') }}</UButton>
          <UButton type="submit" :loading="loading">{{ t('common.save') }}</UButton>
        </div>
      </UForm>
    </template>
  </UModal>
</template>

<script setup>
import { computed } from 'vue'
import { t } from '@/i18n'

const props = defineProps({
  open: Boolean,
  title: { type: String, default: '' },
  fields: { type: Array, default: () => [] },
  state: { type: Object, required: true },
  loading: Boolean,
  error: { type: String, default: null },
})
const emit = defineEmits(['update:open', 'submit'])

const isOpen = computed({
  get: () => props.open,
  set: (v) => emit('update:open', v),
})

function handleSubmit() {
  emit('submit', props.state)
}

function onFileChange(event, fieldName) {
  props.state[fieldName] = event.target.files?.[0] || null
}
</script>
