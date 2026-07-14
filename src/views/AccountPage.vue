<template>
  <div class="flex flex-col gap-4">
    <CrudTablePage
      :rows="store.accounts"
      :columns="columns"
      :loading="store.loading"
      :error="store.error"
      :add-label="t('account.add')"
      :empty-label="t('account.noData')"
      @add="openCreateModal"
      @retry="store.clearError()"
    />

    <CrudFormModal
      v-model:open="showModal"
      :title="isEditing ? t('account.edit') : t('account.add')"
      :fields="fields"
      :state="form"
      :loading="store.loading"
      :error="store.error"
      @submit="handleSubmit"
    />

    <ConfirmDialog
      v-model:open="showDeleteModal"
      :title="t('account.confirmDelete')"
      :message="deleteTarget ? `${deleteTarget.accountName} (${deleteTarget.accountNo})` : ''"
      :confirm-label="t('common.delete')"
      danger
      :loading="store.loading"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup>
import { ref, computed, h, onMounted } from 'vue'
import { useAccountStore } from '@/stores/account'
import { t } from '@/i18n'
import { fetchCompanies } from '@/services/api'
import { useToast } from '@nuxt/ui/composables'
import UButton from '@nuxt/ui/components/Button.vue'
import CrudTablePage from '@/components/crud/CrudTablePage.vue'
import CrudFormModal from '@/components/crud/CrudFormModal.vue'
import ConfirmDialog from '@/components/crud/ConfirmDialog.vue'

const store = useAccountStore()
const toast = useToast()

const companies = ref([])
const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref(null)
const showDeleteModal = ref(false)
const deleteTarget = ref(null)

const form = ref({ accountNo: '', accountName: '', companyId: '', accountCcy: '', status: 'open' })

onMounted(() => {
  store.loadAccounts()
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
  { name: 'accountNo', label: t('account.accountNo'), required: true, placeholder: t('account.placeholderAccountNo') },
  { name: 'accountName', label: t('account.accountName'), required: true, placeholder: t('account.placeholderAccountName') },
  {
    name: 'companyId',
    label: t('account.companyId'),
    type: 'select',
    placeholder: t('account.placeholderCompany'),
    options: companies.value.map((c) => ({ label: `${c.companyCode} — ${c.companyName}`, value: String(c.companyCode) })),
  },
  {
    name: 'status',
    label: t('account.status'),
    type: 'select',
    options: [
      { label: t('account.open'), value: 'open' },
      { label: t('account.disabled'), value: 'disabled' },
    ],
  },
])

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return dateStr.split('T')[0]
}

function openCreateModal() {
  isEditing.value = false
  editingId.value = null
  form.value = { accountNo: '', accountName: '', companyId: '', accountCcy: '', status: 'open' }
  showModal.value = true
}

function openEditModal(item) {
  isEditing.value = true
  editingId.value = item.id
  form.value = {
    accountNo: item.accountNo || '',
    accountName: item.accountName || '',
    companyId: item.companyId || '',
    accountCcy: item.accountCcy || '',
    status: item.status || 'open',
  }
  showModal.value = true
}

async function handleSubmit(state) {
  const data = {
    accountNo: state.accountNo.trim(),
    accountName: state.accountName.trim(),
    status: state.status,
  }
  if (state.companyId) data.partNerName = state.companyId

  const success = isEditing.value
    ? await store.updateAccount(editingId.value, data)
    : await store.createAccount(data)

  if (success) {
    showModal.value = false
    toast.add({ title: isEditing.value ? t('account.updateSuccess') : t('account.createSuccess'), color: 'success' })
  }
}

function confirmDelete(item) {
  deleteTarget.value = item
  showDeleteModal.value = true
}

async function handleDelete() {
  if (!deleteTarget.value) return
  const success = await store.deleteAccount(deleteTarget.value.id)
  if (success) {
    showDeleteModal.value = false
    deleteTarget.value = null
    toast.add({ title: t('account.deleteSuccess'), color: 'success' })
  }
}

const columns = [
  { accessorKey: 'accountNo', header: t('account.accountNo') },
  { accessorKey: 'accountName', header: t('account.accountName') },
  {
    accessorKey: 'companyName',
    header: t('account.companyName'),
    cell: ({ row }) => row.original.companyName || '—',
  },
  {
    accessorKey: 'status',
    header: t('account.status'),
    cell: ({ row }) =>
      h(
        'span',
        {
          class: [
            'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold',
            row.original.status === 'open' ? 'bg-success/10 text-success' : 'bg-error/10 text-error',
          ],
        },
        row.original.status === 'open' ? t('account.open') : t('account.disabled')
      ),
  },
  {
    accessorKey: 'createdAt',
    header: t('account.createdAt'),
    cell: ({ row }) => formatDate(row.original.createdAt),
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
        h(UButton, {
          icon: 'i-lucide-trash-2',
          color: 'error',
          variant: 'ghost',
          size: 'sm',
          onClick: () => confirmDelete(row.original),
        }),
      ]),
  },
]
</script>
