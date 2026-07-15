/**
 * Map Material Design Icon names (as sent by the login API's dynamic menu,
 * or used by the hardcoded fallback menu) to Iconify Lucide icon strings
 * consumed by Nuxt UI's NavigationMenuItem `icon` prop.
 */

const iconMap = {
  'mdi-home': 'i-lucide-house',
  'mdi-account-plus': 'i-lucide-user-plus',
  'mdi-lock': 'i-lucide-lock',
  'mdi-file-chart': 'i-lucide-file-chart-column',
  'mdi-source-branch': 'i-lucide-git-branch',
  'mdi-domain': 'i-lucide-building-2',
  'mdi-bank': 'i-lucide-landmark',
  'mdi-swap-horizontal': 'i-lucide-arrow-left-right',
  'mdi-chart-line': 'i-lucide-activity',
}

const FALLBACK_ICON = 'i-lucide-circle'

/**
 * @param {string} iconName - e.g. "mdi-home"
 * @returns {string} Iconify icon string, e.g. "i-lucide-house"
 */
export function mdiToLucide(iconName) {
  return iconMap[iconName] || FALLBACK_ICON
}
