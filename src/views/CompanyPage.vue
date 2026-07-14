<template>
  <div class="flex flex-col gap-4">
    <CrudTablePage
      :rows="store.companies"
      :columns="columns"
      :loading="store.loading"
      :error="store.error"
      :add-label="t('company.add')"
      :empty-label="t('company.noData')"
      @add="openCreateModal"
      @retry="store.clearError()"
    />

    <CrudFormModal
      v-model:open="showModal"
      :title="isEditing ? t('company.edit') : t('company.add')"
      :fields="fields"
      :state="form"
      :loading="store.loading"
      :error="store.error"
      @submit="handleSubmit"
    />

    <ConfirmDialog
      v-model:open="showStatusModal"
      :title="t('company.confirmStatusChange')"
      :message="statusMessage"
      :confirm-label="t('common.confirm')"
      :loading="store.loading"
      @confirm="handleStatusToggle"
    />
  </div>
</template>

<script setup>
import { ref, computed, h, onMounted } from 'vue'
import { useCompanyStore } from '@/stores/company'
import { t } from '@/i18n'
import { useToast } from '@nuxt/ui/composables'
import UButton from '@nuxt/ui/components/Button.vue'
import CrudTablePage from '@/components/crud/CrudTablePage.vue'
import CrudFormModal from '@/components/crud/CrudFormModal.vue'
import ConfirmDialog from '@/components/crud/ConfirmDialog.vue'

const store = useCompanyStore()
const toast = useToast()

const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref(null)
const showStatusModal = ref(false)
const statusTarget = ref(null)

const form = ref({ companyName: '', status: 'open', percent: '', batRunningDate: '', file: null })

onMounted(() => {
  store.loadCompanies()
})

const fields = [
  { name: 'companyName', label: t('company.companyName'), required: true, placeholder: t('company.placeholderName') },
  {
    name: 'status',
    label: t('company.status'),
    type: 'select',
    options: [
      { label: t('company.open'), value: 'open' },
      { label: t('company.disabled'), value: 'disabled' },
    ],
  },
  { name: 'percent', label: t('company.percent'), type: 'number', placeholder: t('company.placeholderPercent') },
  { name: 'batRunningDate', label: t('company.batRunningDate'), type: 'date' },
  { name: 'file', label: t('company.uploadFile'), type: 'file', accept: '.pdf,.jpg,.jpeg,.png' },
]

const statusMessage = computed(() => {
  if (!statusTarget.value) return ''
  return `${statusTarget.value.companyName} — ${t('company.open')} → ${t('company.disabled')}`
})

function formatPercent(value) {
  if (value == null) return '—'
  return `${Number(value).toFixed(2)}%`
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return dateStr.split('T')[0]
}

function openCreateModal() {
  isEditing.value = false
  editingId.value = null
  form.value = { companyName: '', status: 'open', percent: '', batRunningDate: '', file: null }
  showModal.value = true
}

function openEditModal(item) {
  isEditing.value = true
  editingId.value = item.companyCode
  form.value = {
    companyName: item.companyName,
    status: item.status,
    percent: item.percent != null ? String(item.percent) : '',
    batRunningDate: item.batRunningDate ? item.batRunningDate.split('T')[0] : '',
    file: null,
  }
  showModal.value = true
}

async function handleSubmit(state) {
  const data = {
    companyName: state.companyName.trim(),
    status: state.status,
  }
  if (state.percent) data.percent = state.percent
  if (state.batRunningDate) data.batRunningDate = state.batRunningDate + 'T00:00:00'
  if (state.file) data.file = state.file

  const success = isEditing.value
    ? await store.updateCompany(editingId.value, data)
    : await store.createCompany(data)

  if (success) {
    showModal.value = false
    toast.add({ title: isEditing.value ? t('company.updateSuccess') : t('company.createSuccess'), color: 'success' })
  }
}

function confirmToggleStatus(item) {
  statusTarget.value = item
  showStatusModal.value = true
}

async function handleStatusToggle() {
  if (!statusTarget.value) return
  const success = await store.disableCompany(statusTarget.value.companyCode)
  if (success) {
    showStatusModal.value = false
    statusTarget.value = null
    toast.add({ title: t('company.statusUpdated'), color: 'success' })
  }
}

const columns = [
  { accessorKey: 'companyCode', header: t('company.companyCode') },
  { accessorKey: 'companyName', header: t('company.companyName') },
  {
    accessorKey: 'status',
    header: t('company.status'),
    cell: ({ row }) =>
      h(
        'span',
        {
          class: [
            'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold',
            row.original.status === 'open' ? 'bg-success/10 text-success' : 'bg-error/10 text-error',
          ],
        },
        row.original.status === 'open' ? t('company.open') : t('company.disabled')
      ),
  },
  { accessorKey: 'percent', header: t('company.percent'), cell: ({ row }) => formatPercent(row.original.percent) },
  { accessorKey: 'batRunningDate', header: t('company.batRunningDate'), cell: ({ row }) => formatDate(row.original.batRunningDate) },
  {
    accessorKey: 'imagePath',
    header: t('company.image'),
    cell: ({ row }) =>
      row.original.imagePath
        ? h('a', { href: row.original.imagePath, target: '_blank', class: 'text-primary hover:underline text-xs font-medium' }, row.original.imageName || t('company.viewFile'))
        : '—',
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) =>
      h('div', { class: 'flex justify-end gap-1' }, [
        h(UButton, {
          icon: 'i-lucide-pencil',
          color: 'neutral',
          variant: 'ghost',
          size: 'sm',
          onClick: () => openEditModal(row.original),
        }),
        row.original.status === 'open'
          ? h(UButton, {
              icon: 'i-lucide-ban',
              color: 'error',
              variant: 'ghost',
              size: 'sm',
              onClick: () => confirmToggleStatus(row.original),
            })
          : null,
      ]),
  },
]
</script>
