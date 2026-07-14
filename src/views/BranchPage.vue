<template>
  <div class="flex flex-col gap-4">
    <CrudTablePage
      :rows="store.branches"
      :columns="columns"
      :loading="store.loading"
      :error="store.error"
      :add-label="t('branch.add')"
      :empty-label="t('branch.noData')"
      @add="openCreateModal"
      @retry="store.clearError()"
    />

    <CrudFormModal
      v-model:open="showModal"
      :title="isEditing ? t('branch.edit') : t('branch.add')"
      :fields="fields"
      :state="form"
      :loading="store.loading"
      :error="store.error"
      @submit="handleSubmit"
    />

    <ConfirmDialog
      v-model:open="showStatusModal"
      :title="t('branch.confirmStatusChange')"
      :message="statusMessage"
      :confirm-label="t('common.confirm')"
      :loading="store.loading"
      @confirm="handleStatusToggle"
    />
  </div>
</template>

<script setup>
import { ref, computed, h, onMounted } from 'vue'
import { useBranchStore } from '@/stores/branch'
import { t } from '@/i18n'
import { fetchCompanies } from '@/services/api'
import { useToast } from '@nuxt/ui/composables'
import UButton from '@nuxt/ui/components/Button.vue'
import CrudTablePage from '@/components/crud/CrudTablePage.vue'
import CrudFormModal from '@/components/crud/CrudFormModal.vue'
import ConfirmDialog from '@/components/crud/ConfirmDialog.vue'

const store = useBranchStore()
const toast = useToast()

const companies = ref([])
const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref(null)
const showStatusModal = ref(false)
const statusTarget = ref(null)

const form = ref({ branchName: '', status: 'OPEN', partnerId: '' })

onMounted(() => {
  store.loadBranches()
  loadCompanies()
})

async function loadCompanies() {
  try {
    const result = await fetchCompanies()
    if (result.respCode === '00') companies.value = result.respData || []
  } catch {
    companies.value = []
  }
}

const fields = computed(() => [
  { name: 'branchName', label: t('branch.branchName'), required: true, placeholder: t('branch.placeholderName') },
  {
    name: 'status',
    label: t('branch.status'),
    type: 'select',
    options: [
      { label: t('branch.open'), value: 'OPEN' },
      { label: t('branch.close'), value: 'CLOSE' },
    ],
  },
  {
    name: 'partnerId',
    label: t('branch.partnerId'),
    type: 'select',
    placeholder: t('branch.placeholderPartnerId'),
    options: companies.value.map((c) => ({ label: `${c.companyCode} — ${c.companyName}`, value: String(c.companyCode) })),
  },
])

const statusMessage = computed(() => {
  if (!statusTarget.value) return ''
  const from = statusTarget.value.status === 'OPEN' ? t('branch.open') : t('branch.close')
  const to = statusTarget.value.status === 'OPEN' ? t('branch.close') : t('branch.open')
  return `${statusTarget.value.branchName} — ${from} → ${to}`
})

function openCreateModal() {
  isEditing.value = false
  editingId.value = null
  form.value = { branchName: '', status: 'OPEN', partnerId: '' }
  showModal.value = true
}

function openEditModal(item) {
  isEditing.value = true
  editingId.value = item.branchNo
  form.value = {
    branchName: item.branchName,
    status: item.status,
    partnerId: item.partnerId || '',
  }
  showModal.value = true
}

async function handleSubmit(state) {
  const data = {
    branchName: state.branchName.trim(),
    status: state.status,
    partnerId: state.partnerId?.trim() || null,
  }

  const success = isEditing.value
    ? await store.updateBranch(editingId.value, data)
    : await store.createBranch(data)

  if (success) {
    showModal.value = false
    toast.add({ title: isEditing.value ? t('branch.updateSuccess') : t('branch.createSuccess'), color: 'success' })
  }
}

function confirmToggleStatus(item) {
  statusTarget.value = item
  showStatusModal.value = true
}

async function handleStatusToggle() {
  if (!statusTarget.value) return
  const newStatus = statusTarget.value.status === 'OPEN' ? 'CLOSE' : 'OPEN'
  const success = await store.toggleBranchStatus(statusTarget.value.branchNo, newStatus)
  if (success) {
    showStatusModal.value = false
    statusTarget.value = null
    toast.add({ title: t('branch.statusUpdated'), color: 'success' })
  }
}

const columns = [
  { accessorKey: 'branchNo', header: t('branch.branchNo') },
  { accessorKey: 'branchName', header: t('branch.branchName') },
  {
    accessorKey: 'status',
    header: t('branch.status'),
    cell: ({ row }) =>
      h(
        'span',
        {
          class: [
            'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold',
            row.original.status === 'OPEN' ? 'bg-success/10 text-success' : 'bg-error/10 text-error',
          ],
        },
        row.original.status === 'OPEN' ? t('branch.open') : t('branch.close')
      ),
  },
  { accessorKey: 'companyName', header: t('branch.companyName'), cell: ({ row }) => row.original.companyName || '—' },
  { accessorKey: 'makeBy', header: t('branch.createBy'), cell: ({ row }) => row.original.makeBy || '—' },
  { accessorKey: 'makeByAt', header: t('branch.createAt'), cell: ({ row }) => row.original.makeByAt || '—' },
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
        h(UButton, {
          icon: row.original.status === 'OPEN' ? 'i-lucide-ban' : 'i-lucide-check',
          color: row.original.status === 'OPEN' ? 'error' : 'success',
          variant: 'ghost',
          size: 'sm',
          onClick: () => confirmToggleStatus(row.original),
        }),
      ]),
  },
]
</script>
