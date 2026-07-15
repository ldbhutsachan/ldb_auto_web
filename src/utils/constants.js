// API Configuration - Empty string = use Vite proxy (avoids CORS).
// Override with VITE_API_URL env var for production or direct access.
export const API_BASE_URL = import.meta.env.VITE_API_URL || ''

export const API_ENDPOINTS = {
  LOGIN: '/auto/dev/api/v1/auth/login',
  CHANGE_PASSWORD: '/auto/debit/auth/change-password',
  LOGOUT: '/auth/logout',
  PROFILE: '/auth/profile',
  DASHBOARD_SUMMARY: '/auto/dev/api/v1/dash/dashboard',
  MONTHLY_REPORTS: '/reports/monthly',
  TRANSACTIONS: '/transactions',
  TRANSACTION_SEARCH: '/auto/dev/api/v1/txn/vv-transactions',
  BRANCH_REPORT: '/auto/dev/api/v1/debit/branch-report',
  // Branch management
  BRANCH_LIST: '/auto/dev/api/v1/branch/listBranch',
  BRANCH_CREATE: '/auto/dev/api/v1/branch/create',
  BRANCH_UPDATE: '/auto/dev/api/v1/branch/update',
  BRANCH_STATUS: '/auto/dev/api/v1/branch/status',
  // Company/Partner
  COMPANY_LIST: '/auto/dev/api/v1/company/listCompanyAll',
  COMPANY_CREATE: '/auto/dev/api/v1/company/create',
  COMPANY_UPDATE: '/auto/dev/api/v1/company/update',
  COMPANY_DISABLE: '/auto/dev/api/v1/company/disable',
  // Account
  ACCOUNT_LIST: '/auto/dev/api/v1/account/all',
  ACCOUNT_CREATE: '/auto/dev/api/v1/account',
  ACCOUNT_UPDATE: '/auto/dev/api/v1/account',
  ACCOUNT_DELETE: '/auto/dev/api/v1/account',
  ACCOUNT_FILTER: '/auto/dev/api/v1/account',
  ACCOUNT_BALANCE_MONITOR: '/auto/dev/api/v1/dash/dashboard2',
  // Account Mapper
  MAPPER_LIST: '/auto/dev/api/v1/account-map/accountMaper',
  MAPPER_CREATE: '/auto/dev/api/v1/account-map/mapper',
  MAPPER_UPDATE: '/auto/dev/api/v1/account-map',
  MAPPER_STATUS: '/auto/dev/api/v1/account-map',
}

// Supported currencies
export const CURRENCIES = [
  { code: 'LAK', symbol: '₭', name: 'Lao Kip', locale: 'la-LA' },
  { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht', locale: 'th-TH' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', locale: 'zh-CN' },
]

// App info
export const APP_NAME = 'LDB Auto Debit'
export const APP_VERSION = '1.0.0'

// Storage keys
export const STORAGE_KEYS = {
  TOKEN: 'ldb_auth_token',
  USER: 'ldb_user',
  LANGUAGE: 'ldb_language',
  BG_TONE: 'ldb_bg_tone',
}

// Background tone presets for the theme switcher
export const BG_TONE_PRESETS = [
  { name: 'Blue', hex: '#eaf3fd' },
  { name: 'Slate', hex: '#f8fafc' },
  { name: 'Violet', hex: '#f5f3ff' },
  { name: 'Green', hex: '#ecfdf5' },
  { name: 'Amber', hex: '#fffbeb' },
  { name: 'Rose', hex: '#fef2f2' },
  { name: 'Cool Gray', hex: '#f3f4f6' },
  { name: 'Warm White', hex: '#fdfcfb' },
]

export const DEFAULT_BG_TONE = BG_TONE_PRESETS[0].hex
