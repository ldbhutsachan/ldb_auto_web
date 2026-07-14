<template>
  <div class="company-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">{{ t('company.title') }}</h1>
        <span class="page-badge">{{ companies.length }} {{ t('common.total') }}</span>
      </div>
      <button class="btn-primary" @click="openCreateModal">
        <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd"
            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
            clip-rule="evenodd" />
        </svg>
        <span>{{ t('company.add') }}</span>
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
      <div class="table-loading" v-if="store.loading && !companies.length">
        <div class="loading-row" v-for="i in 5" :key="i"></div>
      </div>

      <!-- Empty State -->
      <div class="empty-state" v-else-if="!store.loading && !companies.length">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M3 3h18v2H3V3m0 4h12v2H3V7m0 4h18v2H3v-2m0 4h12v2H3v-2m0 4h18v2H3v-2z" />
        </svg>
        <p>{{ t('company.noData') }}</p>
      </div>

      <!-- Data Table -->
      <div class="table-container" v-else>
        <table class="data-table">
          <thead>
            <tr>
              <th class="th-num">#</th>
              <th>{{ t('company.companyCode') }}</th>
              <th>{{ t('company.companyName') }}</th>
              <th>{{ t('company.status') }}</th>
              <th>{{ t('company.percent') }}</th>
              <th>{{ t('company.batRunningDate') }}</th>
              <th>{{ t('company.image') }}</th>
              <th class="th-actions">{{ t('company.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in paginatedCompanies" :key="item.companyCode">
              <td class="td-num">{{ index + 1 }}</td>
              <td class="td-id">
                <span class="id-badge">{{ item.companyCode }}</span>
              </td>
              <td class="td-name">
                <span class="company-name-text">{{ item.companyName }}</span>
              </td>
              <td>
                <span class="status-badge" :class="item.status === 'open' ? 'status-open' : 'status-disabled'">
                  <span class="status-dot"></span>
                  {{ item.status === 'open' ? t('company.open') : t('company.disabled') }}
                </span>
              </td>
              <td class="td-muted">{{ formatPercent(item.percent) }}</td>
              <td class="td-muted">{{ formatDate(item.batRunningDate) }}</td>
              <td class="td-muted">
                <a v-if="item.imagePath" :href="item.imagePath" target="_blank" class="file-link">
                  {{ item.imageName || t('company.viewFile') }}
                </a>
                <span v-else>&mdash;</span>
              </td>
              <td class="td-actions">
                <button class="btn-icon btn-edit" @click="openEditModal(item)" :title="t('common.edit')">
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
                <button v-if="item.status === 'open'" class="btn-icon btn-deactive"
                  @click="confirmToggleStatus(item)"
                  :title="t('company.disable')">
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
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
      <div class="modal-card">
        <div class="modal-header">
          <h2 class="modal-title">{{ isEditing ? t('company.edit') : t('company.add') }}</h2>
          <button class="modal-close" @click="closeModal">&times;</button>
        </div>
        <form class="modal-body" @submit.prevent="handleSubmit" enctype="multipart/form-data">
          <div class="form-group">
            <label for="companyName">{{ t('company.companyName') }} <span class="required">*</span></label>
            <input id="companyName" v-model="form.companyName" type="text"
              :placeholder="t('company.placeholderName')" required
              :disabled="store.loading" />
          </div>
          <div class="form-group">
            <label for="status">{{ t('company.status') }}</label>
            <select id="status" v-model="form.status" :disabled="store.loading">
              <option value="open">{{ t('company.open') }}</option>
              <option value="disabled">{{ t('company.disabled') }}</option>
            </select>
          </div>
          <div class="form-row">
            <div class="form-group form-group-half">
              <label for="percent">{{ t('company.percent') }}</label>
              <input id="percent" v-model="form.percent" type="number" step="0.01" min="0" max="100"
                :placeholder="t('company.placeholderPercent')" :disabled="store.loading" />
            </div>
            <div class="form-group form-group-half">
              <label for="batRunningDate">{{ t('company.batRunningDate') }}</label>
              <input id="batRunningDate" v-model="form.batRunningDate" type="date"
                :disabled="store.loading" />
            </div>
          </div>
          <div class="form-group">
            <label for="file">{{ t('company.uploadFile') }}</label>
            <input id="file" ref="fileInput" type="file"
              accept=".pdf,.jpg,.jpeg,.png" :disabled="store.loading"
              @change="handleFileChange" />
            <span v-if="selectedFileName" class="file-name">{{ selectedFileName }}</span>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn-secondary" @click="closeModal" :disabled="store.loading">
              {{ t('common.cancel') }}
            </button>
            <button type="submit" class="btn-primary" :disabled="store.loading || !form.companyName">
              <span v-if="!store.loading">{{ isEditing ? t('common.save') : t('company.add') }}</span>
              <span v-else class="loading-text">
                <svg class="spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
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
        <div class="confirm-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
        </div>
        <h3>{{ t('company.confirmStatusChange') }}</h3>
        <p v-if="statusTarget" class="confirm-detail">
          <strong>{{ statusTarget.companyName }}</strong> —
          {{ statusTarget.status === 'open' ? t('company.open') : t('company.disabled') }}
          &rarr;
          {{ statusTarget.status === 'open' ? t('company.disabled') : t('company.open') }}
        </p>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showStatusModal = false" :disabled="store.loading">
            {{ t('common.cancel') }}
          </button>
          <button class="btn-primary" @click="handleStatusToggle" :disabled="store.loading">
            <span v-if="!store.loading">{{ t('common.confirm') }}</span>
            <span v-else class="loading-text">
              <svg class="spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
              {{ t('common.saving') }}
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <AppPagination v-if="companies.length > pageSize" v-model="currentPage" :total-items="companies.length" :page-size="pageSize" />

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
import { useCompanyStore } from '@/stores/company'
import { t } from '@/i18n'
import AppPagination from '@/components/AppPagination.vue'

const store = useCompanyStore()

const pageSize = 10
const currentPage = ref(1)

const companies = computed(() => store.companies)

const paginatedCompanies = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return companies.value.slice(start, start + pageSize)
})

watch(() => companies.value.length, () => {
  currentPage.value = 1
})

const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref(null)
const showStatusModal = ref(false)
const statusTarget = ref(null)
const toast = ref('')
const fileInput = ref(null)
const selectedFile = ref(null)
const selectedFileName = ref('')

const form = ref({
  companyName: '',
  status: 'open',
  percent: '',
  batRunningDate: '',
})

onMounted(() => {
  store.loadCompanies()
})

function openCreateModal() {
  isEditing.value = false
  editingId.value = null
  resetForm()
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
  }
  selectedFile.value = null
  selectedFileName.value = ''
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

function resetForm() {
  form.value = {
    companyName: '',
    status: 'open',
    percent: '',
    batRunningDate: '',
  }
  selectedFile.value = null
  selectedFileName.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

function handleFileChange(event) {
  const file = event.target.files[0]
  if (file) {
    selectedFile.value = file
    selectedFileName.value = file.name
  } else {
    selectedFile.value = null
    selectedFileName.value = ''
  }
}

function formatPercent(value) {
  if (value == null) return '—'
  return `${Number(value).toFixed(2)}%`
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return dateStr.split('T')[0]
}

async function handleSubmit() {
  const data = {
    companyName: form.value.companyName.trim(),
    status: form.value.status,
  }

  if (form.value.percent) {
    data.percent = form.value.percent
  }

  if (form.value.batRunningDate) {
    data.batRunningDate = form.value.batRunningDate + 'T00:00:00'
  }

  if (selectedFile.value) {
    data.file = selectedFile.value
  }

  let success = false
  if (isEditing.value) {
    success = await store.updateCompany(editingId.value, data)
  } else {
    success = await store.createCompany(data)
  }

  if (success) {
    showModal.value = false
    resetForm()
    showToast(isEditing.value ? t('company.updateSuccess') : t('company.createSuccess'))
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
    showToast(t('company.statusUpdated'))
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
.company-page {
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

/* Page Header */
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

/* Alert Error */
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

/* Table Card */
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
  width: 80px;
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
  min-width: 180px;
}

.company-name-text {
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

/* Status Badge */
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

/* File link */
.file-link {
  color: #4f46e5;
  text-decoration: none;
  font-weight: 500;
  font-size: 12px;
}

.file-link:hover {
  text-decoration: underline;
}

/* Loading */
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

/* Empty State */
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

/* Modal */
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
  max-width: 520px;
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
.form-group select {
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
.form-group select:focus {
  border-color: #4f46e5;
  background: white;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.form-group input::placeholder {
  color: #9ca3af;
}

.form-group input:disabled,
.form-group select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-group input[type="file"] {
  padding: 8px;
  font-size: 13px;
}

.file-name {
  font-size: 12px;
  color: #4f46e5;
  font-weight: 500;
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

/* Loading text */
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

/* Toast */
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
