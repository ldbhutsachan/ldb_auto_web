import en from './en'
import lo from './lo'
import { STORAGE_KEYS } from '@/utils/constants'

const translations = { en, lo }

// Get saved language or default
function getSavedLanguage() {
  try {
    return localStorage.getItem(STORAGE_KEYS.LANGUAGE) || 'en'
  } catch {
    return 'en'
  }
}

let currentLanguage = getSavedLanguage()

// Apply Lao font on initial load if previously saved
if (currentLanguage === 'lo') {
  document.documentElement.classList.add('lang-lo')
}

/**
 * Get translated text by key path (e.g., 'auth.login')
 */
export function t(key, params = {}) {
  const keys = key.split('.')
  let value = translations[currentLanguage]
  for (const k of keys) {
    if (value && typeof value === 'object') value = value[k]
    else return key
  }
  if (typeof value === 'string') {
    // Replace {{param}} placeholders
    return value.replace(/\{\{(\w+)\}\}/g, (_, p) => params[p] ?? `{{${p}}}`)
  }
  return value || key
}

/**
 * Get current language
 */
export function getLanguage() {
  return currentLanguage
}

/**
 * Set language and save preference
 */
export function setLanguage(lang) {
  if (!translations[lang]) return false
  currentLanguage = lang
  try {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang)
  } catch {}
  // Toggle Lao font on <html>
  document.documentElement.classList.toggle('lang-lo', lang === 'lo')
  return true
}

/**
 * Check if current language is Lao
 */
export function isLao() {
  return currentLanguage === 'lo'
}
