import { API_BASE_URL, API_ENDPOINTS, STORAGE_KEYS } from '@/utils/constants'

/**
 * Get auth token from storage
 */
function getToken() {
  try {
    return localStorage.getItem(STORAGE_KEYS.TOKEN)
  } catch {
    return null
  }
}

/**
 * Make an API request
 */
async function apiRequest(endpoint, options = {}) {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(error.message || error.detail || `HTTP ${response.status}`)
  }

  return response.json()
}

/**
 * Login API
 */
export async function login(username, password) {
  return apiRequest(API_ENDPOINTS.LOGIN, {
    method: 'POST',
    body: JSON.stringify({ userName: username, password }),
  })
}

/**
 * Fetch dashboard data
 * Backend returns ApiResponse { status, message, data: DashboardDto }
 * Returns DashboardDto fields merged with any extra chart/report data.
 */
export async function fetchDashboard() {
  const response = await apiRequest(API_ENDPOINTS.DASHBOARD_SUMMARY, {
    method: 'GET',
  })
  if (response && response.respCode === '00' && response.respData) {
    // Merge top-level fields (like monthlyReports, monthlyReport, etc.)
    // in case they are not nested inside respData
    return {
      ...response.respData,
      monthlyReport: response.monthlyReport ?? response.respData.monthlyReport ?? [],
      monthlyReports: response.monthlyReports ?? response.respData.monthlyReports ?? [],
      currencyTotals: response.currencyTotals ?? response.respData.currencyTotals ?? {},
      growth: response.growth ?? response.respData.growth ?? {},
    }
  }
  throw new Error(response?.respDesc || 'Failed to load dashboard data')
}

/**
 * Fetch transactions
 */
export async function fetchTransactions(page = 1, limit = 20) {
  return apiRequest(`${API_ENDPOINTS.TRANSACTIONS}?page=${page}&limit=${limit}`)
}

/**
 * Search transactions with optional filters (matches VvTransactionController)
 * GET /txn/vv-transactions?accountNo=&startDate=&endDate=
 */
export async function searchTransactions({ accountNo, startDate, endDate } = {}) {
  const params = new URLSearchParams()
  if (accountNo) params.append('accountNo', accountNo)
  if (startDate) params.append('startDate', startDate)
  if (endDate) params.append('endDate', endDate)
  const qs = params.toString()
  return apiRequest(`${API_ENDPOINTS.TRANSACTION_SEARCH}${qs ? `?${qs}` : ''}`)
}

/**
 * Fetch monthly reports
 */
export async function fetchMonthlyReports() {
  return apiRequest(API_ENDPOINTS.MONTHLY_REPORTS)
}

/**
 * Change password
 */
export async function changePassword(userName, oldPassword, newPassword) {
  return apiRequest(API_ENDPOINTS.CHANGE_PASSWORD, {
    method: 'POST',
    body: JSON.stringify({ userName, oldPassword, newPassword }),
  })
}

/**
 * =====================
 * Company / Partner API
 * =====================
 */

/**
 * Make an API request with multipart/form-data (for file uploads)
 */
async function apiFormDataRequest(endpoint, options = {}) {
  const token = getToken()
  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }
  // Do NOT set Content-Type — browser sets it with boundary for FormData

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(error.message || error.detail || `HTTP ${response.status}`)
  }

  return response.json()
}

/**
 * Fetch list of companies (for Partner ID dropdown)
 */
export async function fetchCompanies() {
  return apiRequest(API_ENDPOINTS.COMPANY_LIST)
}

/**
 * Create a new company (multipart form data)
 */
export async function createCompany(data) {
  const formData = new FormData()
  Object.entries(data).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      formData.append(key, value)
    }
  })
  return apiFormDataRequest(API_ENDPOINTS.COMPANY_CREATE, {
    method: 'POST',
    body: formData,
  })
}

/**
 * Update an existing company (multipart form data)
 */
export async function updateCompany(id, data) {
  const formData = new FormData()
  Object.entries(data).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      formData.append(key, value)
    }
  })
  return apiFormDataRequest(`${API_ENDPOINTS.COMPANY_UPDATE}/${id}`, {
    method: 'PUT',
    body: formData,
  })
}

/**
 * Disable a company
 */
export async function disableCompany(id) {
  return apiRequest(`${API_ENDPOINTS.COMPANY_DISABLE}/${id}`, {
    method: 'POST',
  })
}

/**
 * =====================
 * Account Management API
 * =====================
 */

/**
 * Fetch list of accounts
 */
export async function fetchAccounts() {
  return apiRequest(API_ENDPOINTS.ACCOUNT_LIST)
}

/**
 * Create a new account
 */
export async function createAccount(data) {
  return apiRequest(API_ENDPOINTS.ACCOUNT_CREATE, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * Update an existing account
 */
export async function updateAccount(id, data) {
  return apiRequest(`${API_ENDPOINTS.ACCOUNT_UPDATE}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

/**
 * Delete an account
 */
export async function deleteAccount(id) {
  return apiRequest(`${API_ENDPOINTS.ACCOUNT_DELETE}/${id}`, {
    method: 'DELETE',
  })
}

/**
 * Fetch accounts filtered by status
 */
export async function fetchAccountsByStatus(status) {
  return apiRequest(`${API_ENDPOINTS.ACCOUNT_FILTER}?status=${status}`)
}

/**
 * =====================
 * Account Mapper API
 * =====================
 */

/**
 * Fetch list of account mappers
 */
export async function fetchMappers() {
  return apiRequest(API_ENDPOINTS.MAPPER_LIST)
}

/**
 * Create a new account mapper
 */
export async function createMapper(data) {
  return apiRequest(API_ENDPOINTS.MAPPER_CREATE, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * Update an existing account mapper
 */
export async function updateMapper(id, data) {
  return apiRequest(`${API_ENDPOINTS.MAPPER_UPDATE}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

/**
 * Update mapper status
 */
export async function updateMapperStatus(id, status) {
  return apiRequest(`${API_ENDPOINTS.MAPPER_STATUS}/${id}/status`, {
    method: 'POST',
    body: JSON.stringify({ status }),
  })
}

/**
 * =====================
 * Branch Management API
 * =====================
 */

/**
 * Fetch list of branches
 */
export async function fetchBranches() {
  return apiRequest(API_ENDPOINTS.BRANCH_LIST)
}

/**
 * Create a new branch
 */
export async function createBranch(data) {
  return apiRequest(API_ENDPOINTS.BRANCH_CREATE, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * Update an existing branch
 */
export async function updateBranch(id, data) {
  return apiRequest(`${API_ENDPOINTS.BRANCH_UPDATE}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

/**
 * Update branch status
 */
export async function updateBranchStatus(id, data) {
  return apiRequest(`${API_ENDPOINTS.BRANCH_STATUS}/${id}`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * Fetch branch report breakdown by currency
 * POST /txn/branch-report
 */
export async function fetchBranchReport(request) {
  return apiRequest(API_ENDPOINTS.BRANCH_REPORT, {
    method: 'POST',
    body: JSON.stringify(request),
  })
}
