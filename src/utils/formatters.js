import { CURRENCIES } from '@/utils/constants'

/**
 * Format currency amount
 */
export function formatCurrency(amount, currencyCode = 'LAK') {
  if (amount == null || isNaN(amount)) return '—'
  const currency = CURRENCIES.find((c) => c.code === currencyCode) || CURRENCIES[0]
  try {
    return new Intl.NumberFormat(currency.locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: currencyCode === 'LAK' ? 0 : 2,
      maximumFractionDigits: currencyCode === 'LAK' ? 0 : 2,
    }).format(amount)
  } catch {
    return `${currency.symbol}${Number(amount).toLocaleString()}`
  }
}

/**
 * Format date to readable string
 */
export function formatDate(dateStr, locale = 'en') {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  return date.toLocaleDateString(locale === 'lo' ? 'lo-LA' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Format month name
 */
export function formatMonth(monthIndex, locale = 'en', short = false) {
  const date = new Date(2024, monthIndex - 1, 1)
  return date.toLocaleDateString(locale === 'lo' ? 'lo-LA' : 'en-US', {
    month: short ? 'short' : 'long',
  })
}

/**
 * Format percentage
 */
export function formatPercent(value) {
  if (value == null || isNaN(value)) return '—'
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
}

/**
 * Format number with commas
 */
export function formatNumber(value) {
  if (value == null || isNaN(value)) return '—'
  return Number(value).toLocaleString()
}

/**
 * Get color for currency
 */
export function getCurrencyColor(currencyCode) {
  const colors = {
    LAK: '#10B981',
    USD: '#3B82F6',
    THB: '#F59E0B',
    CNY: '#EF4444',
  }
  return colors[currencyCode] || '#6B7280'
}
