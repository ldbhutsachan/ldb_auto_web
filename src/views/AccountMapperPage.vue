<template>
  <div class="flex flex-col gap-4">
    <UCard>
      <div class="flex flex-wrap items-end gap-3">
        <UFormField :label="t('mapper.branchName')">
          <USelectMenu
            v-if="branchesReady"
            v-model="branchFilter"
            :items="branchFilterItems"
            value-key="value"
            :placeholder="t('common.all')"
            class="w-56"
          />
          <USelect v-else disabled :items="[]" :placeholder="t('common.loading')" class="w-56" />
        </UFormField>
        <UButton color="neutral" variant="soft" :disabled="!branchFilter" @click="branchFilter = ''">{{ t('common.clear') }}</UButton>
      </div>
    </UCard>

    <CrudTablePage
      :rows="filteredMappers"
      :columns="columns"
      :loading="store.loading"
      :error="store.error"
      :add-label="t('mapper.add')"
      :empty-label="t('mapper.noData')"
      @add="openCreateModal"
      @retry="store.clearError()"
    />

    <CrudFormModal
      v-model:open="showModal"
      :title="isEditing ? t('mapper.edit') : t('mapper.add')"
      :fields="fields"
      :state="form"
      :loading="store.loading"
      :error="store.error"
      @submit="handleSubmit"
    />

    <ConfirmDialog
      v-model:open="showStatusModal"
      :title="t('mapper.confirmStatusChange')"
      :message="statusMessage"
      :confirm-label="t('common.confirm')"
      :loading="store.loading"
      @confirm="handleStatusToggle"
    />
  </div>
</template>

<script setup>
import { ref, computed, h, onMounted } from 'vue'
import { useMapperStore } from '@/stores/mapper'
import { useAuthStore } from '@/stores/auth'
import { t } from '@/i18n'
import { CURRENCIES } from '@/utils/constants'
import { fetchCompanies, fetchBranches } from '@/services/api'
import { useToast } from '@nuxt/ui/composables'
import UButton from '@nuxt/ui/components/Button.vue'
import CrudTablePage from '@/components/crud/CrudTablePage.vue'
import CrudFormModal from '@/components/crud/CrudFormModal.vue'
import ConfirmDialog from '@/components/crud/ConfirmDialog.vue'

const store = useMapperStore()
const authStore = useAuthStore()
const toast = useToast()

const companies = ref([])
const branches = ref([])
const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref(null)
const showStatusModal = ref(false)
const statusTarget = ref(null)
const branchFilter = ref('')
const branchesReady = ref(false)

const branchFilterItems = computed(() =>
  branches.value.map((b) => ({ label: `${b.branchName} (${b.branchNo})`, value: String(b.branchNo) }))
)

const filteredMappers = computed(() => {
  if (!branchFilter.value) return store.mappers
  const selected = branches.value.find((b) => String(b.branchNo) === branchFilter.value)
  const name = selected?.branchName
  return store.mappers.filter(
    (m) => String(m.branchCode ?? m.sectionNo ?? '') === branchFilter.value || (name && m.branchName === name)
  )
})

function blankForm() {
  const today = new Date().toISOString().split('T')[0]
  return {
    fromAcctNo: '',
    fromAcctName: '',
    fromAcctCcy: '',
    fromAcctType: '',
    remark: '',
    partnerName: '',
    branchCode: '',
    status: 'open',
    userDate: today,
    userBy: authStore.user?.username || '',
  }
}

const form = ref(blankForm())

onMounted(() => {
  store.loadMappers()
  loadCompanies()
  loadBranches()
})

async function loadCompanies() {
  try {
    const result = await fetchCompanies()
    if (result.respCode === '00') companies.value = result.respData || []
  } catch {
    companies.value = []
  }
}

async function loadBranches() {
  try {
    const result = await fetchBranches()
    if (result.respCode === '00') branches.value = result.respData || []
  } catch {
    branches.value = []
  } finally {
    branchesReady.value = true
  }
}

const fields = computed(() => [
  { name: 'fromAcctNo', label: t('mapper.accountNo'), required: true, placeholder: t('mapper.placeholderAccountNo') },
  {
    name: 'fromAcctCcy',
    label: t('mapper.accountCcy'),
    type: 'select',
    placeholder: t('mapper.placeholderCcy'),
    options: CURRENCIES.map((c) => ({ label: `${c.code} — ${c.name}`, value: c.code })),
  },
  { name: 'fromAcctName', label: t('mapper.accountName'), required: true, placeholder: t('mapper.placeholderAccountName') },
  { name: 'fromAcctType', label: t('mapper.accountType'), placeholder: t('mapper.placeholderAccountType') },
  {
    name: 'partnerName',
    label: t('mapper.partnerName'),
    type: 'select',
    required: true,
    placeholder: t('mapper.placeholderPartnerName'),
    options: companies.value.map((c) => ({ label: `${c.companyCode} — ${c.companyName}`, value: String(c.companyCode) })),
  },
  {
    name: 'branchCode',
    label: t('mapper.branchCode'),
    type: 'combobox',
    placeholder: t('mapper.placeholderBranchCode'),
    options: branches.value.map((b) => ({ label: `${b.branchName} (${b.branchNo})`, value: String(b.branchNo) })),
  },
  { name: 'remark', label: t('mapper.remark'), type: 'textarea', placeholder: t('mapper.placeholderRemark') },
  {
    name: 'status',
    label: t('mapper.status'),
    type: 'select',
    options: [
      { label: t('mapper.activeStatus'), value: 'open' },
      { label: t('mapper.pending'), value: 'close' },
    ],
  },
  { name: 'userDate', label: t('mapper.userDate'), type: 'date' },
])

const statusMessage = computed(() => {
  if (!statusTarget.value) return ''
  const name = statusTarget.value.fromAcctName || statusTarget.value.accountName
  const from = statusTarget.value.status === 'open' ? t('mapper.activeStatus') : t('mapper.pending')
  const to = statusTarget.value.status === 'open' ? t('mapper.pending') : t('mapper.activeStatus')
  return `${name} — ${from} → ${to}`
})

function openCreateModal() {
  isEditing.value = false
  editingId.value = null
  form.value = blankForm()
  showModal.value = true
}

function openEditModal(item) {
  isEditing.value = true
  editingId.value = item.keyId || item.id
  form.value = {
    fromAcctNo: item.fromAcctNo || item.accountNo || '',
    fromAcctName: item.fromAcctName || item.accountName || '',
    fromAcctCcy: item.fromAcctCcy || item.accountCcy || '',
    fromAcctType: item.fromAcctType || '',
    remark: item.remark || '',
    partnerName: item.partnerName || item.companyId || '',
    branchCode: item.branchCode || item.sectionNo || '',
    status: item.status || 'open',
    userDate: item.userDate ? item.userDate.split('T')[0] : '',
    userBy: item.userBy || item.userId || '',
  }
  showModal.value = true
}

async function handleSubmit(state) {
  const data = {
    fromAcctNo: state.fromAcctNo.trim(),
    fromAcctName: state.fromAcctName.trim(),
    partnerName: state.partnerName,
    status: state.status,
  }
  if (state.fromAcctCcy) data.fromAcctCcy = state.fromAcctCcy
  if (state.fromAcctType?.trim()) data.fromAcctType = state.fromAcctType.trim()
  if (state.remark?.trim()) data.remark = state.remark.trim()
  if (state.branchCode?.trim()) data.branchCode = state.branchCode.trim()
  if (state.userDate) data.userDate = state.userDate
  if (state.userBy?.trim()) data.userBy = state.userBy.trim()

  const success = isEditing.value
    ? await store.updateMapper(editingId.value, data)
    : await store.createMapper(data)

  if (success) {
    showModal.value = false
    toast.add({ title: isEditing.value ? t('mapper.updateSuccess') : t('mapper.createSuccess'), color: 'success' })
  }
}

function confirmStatusToggle(item) {
  statusTarget.value = item
  showStatusModal.value = true
}

async function handleStatusToggle() {
  if (!statusTarget.value) return
  const newStatus = statusTarget.value.status === 'open' ? 'close' : 'open'
  const id = statusTarget.value.keyId || statusTarget.value.id
  const success = await store.updateMapperStatus(id, newStatus)
  if (success) {
    showStatusModal.value = false
    statusTarget.value = null
    toast.add({ title: t('mapper.statusUpdated'), color: 'success' })
  }
}

const columns = [
  { accessorKey: 'fromAcctNo', header: t('mapper.accountNo'), cell: ({ row }) => row.original.fromAcctNo || row.original.accountNo || '—' },
  { accessorKey: 'fromAcctName', header: t('mapper.accountName'), cell: ({ row }) => row.original.fromAcctName || row.original.accountName || '—' },
  { accessorKey: 'fromAcctCcy', header: t('mapper.accountCcy'), cell: ({ row }) => row.original.fromAcctCcy || row.original.accountCcy || '—' },
  { accessorKey: 'partnerName', header: t('mapper.partnerCode'), cell: ({ row }) => row.original.partnerName || row.original.partnerName || row.original.partnerName || '—' },
  { accessorKey: 'partnerNames', header: t('mapper.partnerName'), cell: ({ row }) => row.original.partnerNames || row.original.partnerNames || row.original.companyName || '—' },
  { accessorKey: 'branchName', header: t('mapper.branchName'), cell: ({ row }) => row.original.branchName || '—' },
  {
    accessorKey: 'status',
    header: t('mapper.status'),
    cell: ({ row }) =>
      h(
        'span',
        {
          class: [
            'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold',
            row.original.status === 'open' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning',
          ],
        },
        row.original.status === 'open' ? t('mapper.activeStatus') : t('mapper.pending')
      ),
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
          icon: row.original.status === 'open' ? 'i-lucide-ban' : 'i-lucide-check',
          color: row.original.status === 'open' ? 'error' : 'success',
          variant: 'ghost',
          size: 'sm',
          onClick: () => confirmStatusToggle(row.original),
        }),
      ]),
  },
]
</script>
