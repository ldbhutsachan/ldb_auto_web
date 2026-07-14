<template>
  <div class="mapper-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">{{ t('mapper.title') }}</h1>
        <span class="page-badge">{{ mappers.length }} {{ t('common.total') }}</span>
      </div>
      <button class="btn-primary" @click="openCreateModal">
        <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd"
            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
            clip-rule="evenodd" />
        </svg>
        <span>{{ t('mapper.add') }}</span>
      </button>
    </div>

    <!-- Error Alert -->
    <div class="alert-error" v-if="store.error">
      <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clip-rule="evenodd" />
      </svg>
      <span>{{ store.error }}</span>
      <button class="alert-close" @click="store.clearError()">&times;</button>
    </div>

    <!-- Table Card -->
    <div class="table-card">
      <!-- Loading State -->
      <div class="table-loading" v-if="store.loading && !mappers.length">
        <div class="loading-row" v-for="i in 5" :key="i"></div>
      </div>

      <!-- Empty State -->
      <div class="empty-state" v-else-if="!store.loading && !mappers.length">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 3h18v2H3V3m0 4h12v2H3V7m0 4h18v2H3v-2m0 4h12v2H3v-2m0 4h18v2H3v-2z" />
        </svg>
        <p>{{ t('mapper.noData') }}</p>
      </div>

      <!-- Data Table -->
      <div class="table-container" v-else>
        <table class="data-table">
          <thead>
            <tr>
              <th class="th-num">#</th>
              <th>{{ t('mapper.accountNo') }}</th>
              <th>{{ t('mapper.accountName') }}</th>
              <th>{{ t('mapper.accountCcy') }}</th>
              <th>{{ t('mapper.accountType') }}</th>
              <th>{{ t('mapper.partnerName') }}</th>
              <th>{{ t('mapper.status') }}</th>
              <th class="th-actions">{{ t('mapper.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in paginatedMappers" :key="item.keyId || item.id || index">
              <td class="td-num">{{ index + 1 }}</td>
              <td class="td-id">
                <span class="id-badge">{{ item.fromAcctNo || item.accountNo || '—' }}</span>
              </td>
              <td class="td-name">
                <span class="mapper-name-text">{{ item.fromAcctName || item.accountName || '—' }}</span>
              </td>
              <td class="td-muted">{{ item.fromAcctCcy || item.accountCcy || '—' }}</td>
              <td class="td-muted">{{ item.fromAcctType || '—' }}</td>
              <td class="td-muted">{{ item.partnerName || item.companyName || '—' }}</td>
              <td>
                {{ item.status }}
              </td>
              <!-- open -->
              <td class="td-actions">
                <button class="btn-icon btn-edit" @click="openEditModal(item)" :title="t('common.edit')">
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
                <button class="btn-icon" :class="item.status === 0 ? 'btn-deactive' : 'btn-active'"
                  @click="confirmStatusToggle(item)"
                  :title="item.status === 0 ? t('mapper.activate') : t('mapper.deactivate')">
                  <svg v-if="item.status === 0" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clip-rule="evenodd" />
                  </svg>
                  <svg v-else width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clip-rule="evenodd" />
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create / Edit Modal -->
    <div class="modal-overlay" v-if="showModal" @click.self="closeModal">
      <div class="modal-card modal-card-wide">
        <div class="modal-header">
          <h2 class="modal-title">{{ isEditing ? t('mapper.edit') : t('mapper.add') }}</h2>
          <button class="modal-close" @click="closeModal">&times;</button>
        </div>
        <form class="modal-body" @submit.prevent="handleSubmit">
          <div class="form-row">
            <div class="form-group form-group-half">
              <label for="fromAcctNo">{{ t('mapper.accountNo') }} <span class="required">*</span></label>
              <input id="fromAcctNo" v-model="form.fromAcctNo" type="text"
                :placeholder="t('mapper.placeholderAccountNo')" required :disabled="store.loading" />
            </div>
            <div class="form-group form-group-half">
              <label for="fromAcctCcy">{{ t('mapper.accountCcy') }}</label>
              <select id="fromAcctCcy" v-model="form.fromAcctCcy" :disabled="store.loading">
                <option value="">{{ t('mapper.placeholderCcy') }}</option>
                <option v-for="ccy in currencies" :key="ccy.code" :value="ccy.code">{{ ccy.code }} — {{ ccy.name }}
                </option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label for="fromAcctName">{{ t('mapper.accountName') }} <span class="required">*</span></label>
            <input id="fromAcctName" v-model="form.fromAcctName" type="text"
              :placeholder="t('mapper.placeholderAccountName')" required :disabled="store.loading" />
          </div>
          <div class="form-group">
            <label for="fromAcctType">{{ t('mapper.accountType') }}</label>
            <input id="fromAcctType" v-model="form.fromAcctType" type="text"
              :placeholder="t('mapper.placeholderAccountType')" :disabled="store.loading" />
          </div>
          <div class="form-row">
            <div class="form-group form-group-half">
              <label for="partnerName">{{ t('mapper.partnerName') }} <span class="required">*</span></label>
              <select id="partnerName" v-model="form.partnerName" required :disabled="store.loading">
                <option value="">{{ t('mapper.placeholderPartnerName') }}</option>
                <option v-for="company in companies" :key="company.companyCode" :value="String(company.companyCode)">
                  {{ company.companyCode }} — {{ company.companyName }}
                </option>
              </select>
            </div>
            <div class="form-group form-group-half">
              <label for="branchCode">{{ t('mapper.branchCode') }}</label>
              <input id="branchCode" v-model="form.branchCode" type="text"
                :placeholder="t('mapper.placeholderBranchCode')" :disabled="store.loading" />
            </div>
          </div>
          <div class="form-group">
            <label for="remark">{{ t('mapper.remark') }}</label>
            <textarea id="remark" v-model="form.remark" rows="3" :placeholder="t('mapper.placeholderRemark')"
              :disabled="store.loading"></textarea>
          </div>
          <div class="form-row">
            <div class="form-group form-group-half">
              <label for="status">{{ t('mapper.status') }}</label>
              <select id="status" v-model.number="form.status" :disabled="store.loading">
                <option :value="1">{{ t('mapper.pending') }}</option>
                <option :value="0">{{ t('mapper.activeStatus') }}</option>
              </select>
            </div>
            <div class="form-group form-group-half">
              <label for="userDate">{{ t('mapper.userDate') }}</label>
              <input id="userDate" v-model="form.userDate" type="date" :disabled="store.loading" />
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn-secondary" @click="closeModal" :disabled="store.loading">
              {{ t('common.cancel') }}
            </button>
            <button type="submit" class="btn-primary"
              :disabled="store.loading || !form.fromAcctNo || !form.fromAcctName || !form.partnerName">
              <span v-if="!store.loading">{{ isEditing ? t('common.save') : t('mapper.add') }}</span>
              <span v-else class="loading-text">
                <svg class="spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2.5">
                  <path
                    d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
                {{ t('common.saving') }}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Status Confirm Modal -->
    <div class="modal-overlay" v-if="showStatusModal" @click.self="showStatusModal = false">
      <div class="modal-card modal-confirm">
        <div class="confirm-icon" :class="statusTarget?.status === 0 ? 'confirm-icon-success' : 'confirm-icon-danger'">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
        </div>
        <h3>{{ t('mapper.confirmStatusChange') }}</h3>
        <p v-if="statusTarget" class="confirm-detail">
          <strong>{{ statusTarget.fromAcctName || statusTarget.accountName }}</strong> —
          {{ statusTarget.status === 0 ? t('mapper.pending') : t('mapper.activeStatus') }}
          &rarr;
          {{ statusTarget.status === 0 ? t('mapper.activeStatus') : t('mapper.pending') }}
        </p>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showStatusModal = false" :disabled="store.loading">
            {{ t('common.cancel') }}
          </button>
          <button class="btn-primary" :class="statusTarget?.status === 0 ? 'btn-success' : 'btn-danger'"
            @click="handleStatusToggle" :disabled="store.loading">
            <span v-if="!store.loading">{{ t('common.confirm') }}</span>
            <span v-else class="loading-text">
              <svg class="spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2.5">
                <path
                  d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
              {{ t('common.saving') }}
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <AppPagination v-if="mappers.length > pageSize" v-model="currentPage" :total-items="mappers.length"
      :page-size="pageSize" />

    <!-- Success Toast -->
    <transition name="toast">
      <div class="toast-success" v-if="toast">
        <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clip-rule="evenodd" />
        </svg>
        <span>{{ toast }}</span>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useMapperStore } from '@/stores/mapper'
import { useAuthStore } from '@/stores/auth'
import { t } from '@/i18n'
import { CURRENCIES } from '@/utils/constants'
import { fetchCompanies } from '@/services/api'
import AppPagination from '@/components/AppPagination.vue'

const store = useMapperStore()
const authStore = useAuthStore()

const pageSize = 10
const currentPage = ref(1)

const mappers = computed(() => store.mappers)

const paginatedMappers = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return mappers.value.slice(start, start + pageSize)
})

watch(() => mappers.value.length, () => {
  currentPage.value = 1
})

const companies = ref([])
const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref(null)
const showStatusModal = ref(false)
const statusTarget = ref(null)
const toast = ref('')
const currencies = CURRENCIES

const form = ref({
  fromAcctNo: '',
  fromAcctName: '',
  fromAcctCcy: '',
  fromAcctType: '',
  remark: '',
  partnerName: '',
  branchCode: '',
  status: 0,
  userDate: '',
  userBy: '',
})

onMounted(() => {
  store.loadMappers()
  loadCompanies()
})

async function loadCompanies() {
  try {
    const result = await fetchCompanies()
    if (result.respCode === '00') {
      companies.value = result.respData || []
    }
  } catch {
    companies.value = []
  }
}

function openCreateModal() {
  isEditing.value = false
  editingId.value = null
  resetForm()
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
    status: item.status != null ? Number(item.status) : 0,
    userDate: item.userDate ? item.userDate.split('T')[0] : '',
    userBy: item.userBy || item.userId || '',
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

function resetForm() {
  const today = new Date().toISOString().split('T')[0]
  form.value = {
    fromAcctNo: '',
    fromAcctName: '',
    fromAcctCcy: '',
    fromAcctType: '',
    remark: '',
    partnerName: '',
    branchCode: '',
    status: 0,
    userDate: today,
    userBy: authStore.user?.username || '',
  }
}

function getStatusClass(item) {
  const s = Number(item.status)
  if (s === 'open') return 'status-open'
  return 'status-disabled'
}

function getStatusLabel(item) {
  const s = Number(item.status)
  if (s === 'open')
    return t('mapper.activeStatus')
  return t('mapper.pending')
}

async function handleSubmit() {
  const data = {
    fromAcctNo: form.value.fromAcctNo.trim(),
    fromAcctName: form.value.fromAcctName.trim(),
    partnerName: form.value.partnerName,
    status: form.value.status,
  }

  if (form.value.fromAcctCcy) data.fromAcctCcy = form.value.fromAcctCcy
  if (form.value.fromAcctType.trim()) data.fromAcctType = form.value.fromAcctType.trim()
  if (form.value.remark.trim()) data.remark = form.value.remark.trim()
  if (form.value.branchCode.trim()) data.branchCode = form.value.branchCode.trim()
  if (form.value.userDate) data.userDate = form.value.userDate
  if (form.value.userBy.trim()) data.userBy = form.value.userBy.trim()

  let success = false
  if (isEditing.value) {
    success = await store.updateMapper(editingId.value, data)
  } else {
    success = await store.createMapper(data)
  }

  if (success) {
    showModal.value = false
    resetForm()
    showToast(isEditing.value ? t('mapper.updateSuccess') : t('mapper.createSuccess'))
  }
}

function confirmStatusToggle(item) {
  statusTarget.value = item
  showStatusModal.value = true
}

async function handleStatusToggle() {
  if (!statusTarget.value) return
  const newStatus = Number(statusTarget.value.status) === 0 ? 1 : 0
  const id = statusTarget.value.keyId || statusTarget.value.id
  const success = await store.updateMapperStatus(id, newStatus)
  if (success) {
    showStatusModal.value = false
    statusTarget.value = null
    showToast(t('mapper.statusUpdated'))
  }
}

function showToast(message) {
  toast.value = message
  setTimeout(() => {
    toast.value = ''
  }, 3000)
}
</script>

<style scoped>
.mapper-page {
  animation: fadeIn 0.4s ease;
  position: relative;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-title {
  font-size: 22px;
  font-weight: 800;
  color: var(--text);
  margin: 0;
}

.alert-error {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  color: #dc2626;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 20px;
}

.alert-close {
  margin-left: auto;
  background: none;
  border: none;
  color: #dc2626;
  font-size: 20px;
  cursor: pointer;
  padding: 0 4px;
  opacity: 0.7;
}

.alert-close:hover {
  opacity: 1;
}

.table-card {
  background: white;
  border-radius: 16px;
  border: 1px solid #f0f0f5;
  overflow: hidden;
}

.th-num {
  width: 48px;
  text-align: center;
}

.th-actions {
  text-align: center;
  width: 100px;
}

.td-num {
  text-align: center;
  color: #9ca3af;
  font-size: 12px;
}

.td-id {
  width: 100px;
}

.id-badge {
  display: inline-flex;
  padding: 3px 10px;
  background: #f0f0f5;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #4b5563;
}

.td-name {
  min-width: 160px;
}

.mapper-name-text {
  font-weight: 600;
  color: #111827;
}

.td-actions {
  display: flex;
  gap: 6px;
  justify-content: center;
}

.td-muted {
  color: #6b7280;
  font-weight: 400;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.status-open {
  background: #ecfdf5;
  color: #059669;
}

.status-disabled {
  background: #fef2f2;
  color: #dc2626;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.table-loading {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.loading-row {
  height: 44px;
  background: linear-gradient(90deg, #f0f0f5 25%, #e5e7eb 50%, #f0f0f5 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 8px;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #9ca3af;
  gap: 12px;
}

.empty-state svg {
  opacity: 0.4;
}

.empty-state p {
  font-size: 14px;
  margin: 0;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 500;
  padding: 20px;
  animation: overlayIn 0.2s ease;
}

@keyframes overlayIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.modal-card {
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 560px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
  animation: modalIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modalIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }

  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-confirm {
  max-width: 420px;
  text-align: center;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 24px 0;
}

.modal-title {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 28px;
  color: #9ca3af;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.modal-close:hover {
  color: #6b7280;
}

.modal-body {
  padding: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 18px;
}

.form-row {
  display: flex;
  gap: 14px;
}

.form-group-half {
  flex: 1;
}

.form-group label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.required {
  color: #ef4444;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 10px 14px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  color: #111827;
  background: #f9fafb;
  transition: all 0.2s;
  font-family: inherit;
  outline: none;
  width: 100%;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: #4f46e5;
  background: white;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: #9ca3af;
}

.form-group input:disabled,
.form-group select:disabled,
.form-group textarea:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-group textarea {
  resize: vertical;
  min-height: 60px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 24px;
  padding-top: 18px;
  border-top: 1px solid #f0f0f5;
}

.modal-confirm .modal-footer {
  justify-content: center;
}

.confirm-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 8px;
  color: #f59e0b;
}

.confirm-icon-success {
  color: #10b981;
}

.confirm-icon-danger {
  color: #ef4444;
}

.modal-confirm h3 {
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px;
}

.confirm-detail {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 4px;
}

.confirm-detail strong {
  color: #374151;
}

.loading-text {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.toast-success {
  position: fixed;
  bottom: 32px;
  right: 32px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 24px;
  background: #059669;
  color: white;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 8px 24px rgba(5, 150, 105, 0.3);
  z-index: 600;
}

.toast-enter-active {
  animation: toastIn 0.3s ease;
}

.toast-leave-active {
  animation: toastOut 0.3s ease;
}

@keyframes toastIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes toastOut {
  from {
    opacity: 1;
    transform: translateY(0) scale(1);
  }

  to {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
}
</style>
