/**
 * Map Material Design Icon names to inline SVG strings
 */

const iconSvg = {
  'mdi-home': `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>`,
  'mdi-account-plus': `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M15 14c-2.67 0-8 1.33-8 4v2h16v-2c0-2.67-5.33-4-8-4m-1-4a4 4 0 10-4-4 4 4 0 004 4m-4 2H5v3H3v-3H0v-2h3V8h2v3h3v2m9 1v3h-3v2h3v3h2v-3h3v-2h-3v-3z"/></svg>`,
  'mdi-lock': `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17a2 2 0 01-2-2c0-1.11.89-2 2-2a2 2 0 012 2 2 2 0 01-2 2m6 3V10H6v10a2 2 0 002 2h8a2 2 0 002-2m-2-10V6a4 4 0 00-4-4 4 4 0 00-4 4v4h2V6a2 2 0 012-2 2 2 0 012 2v4z"/></svg>`,
  'mdi-file-chart': `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 2a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6m-1 1.5L18.5 9H13m-1 3v7h2v-7m-6 3v4h2v-4m3-1v5h2v-5z"/></svg>`,
  'mdi-source-branch': `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M13 14c-1.3 0-2.4.5-3.3 1.3l-2.8-2.1c.1-.4.1-.8.1-1.2s0-.8-.1-1.2l2.8-2.1c.8.8 2 1.3 3.3 1.3 2.8 0 5-2.2 5-5s-2.2-5-5-5-5 2.2-5 5c0 .4 0 .8.1 1.2L5.2 8.3C4.4 7.5 3.2 7 2 7c-2.2 0-4 1.8-4 4s1.8 4 4 4c1.2 0 2.4-.5 3.3-1.3l2.8 2.1c-.1.4-.1.8-.1 1.2 0 2.8 2.2 5 5 5s5-2.2 5-5-2.2-5-5-5zm0-10c1.7 0 3 1.3 3 3s-1.3 3-3 3-3-1.3-3-3 1.3-3 3-3zM2 13c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm11 8c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3z"/></svg>`,
  'mdi-domain': `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/></svg>`,
  'mdi-bank': `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M11.5 1L2 6v2h19V6l-9.5-5zM4 10v7h3v-7H4zm6 0v7h3v-7h-3zm8 0v7h-3v-7h3zM2 19v2h19v-2H2z"/></svg>`,
  'mdi-swap-horizontal': `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M21 9l-4-4v3h-7v2h7v3l4-4zm-10 6H4v-3l-4 4 4 4v-3h7v-2z"/></svg>`,
}

/**
 * Get SVG string for a given icon name
 * @param {string} iconName - e.g. "mdi-home"
 * @param {number} size - SVG size in pixels (default 20)
 * @returns {string} inline SVG string
 */
export function getIconSvg(iconName, size = 20) {
  const svg = iconSvg[iconName]
  if (!svg) return iconSvg['mdi-home']
  // Replace size if needed
  if (size !== 20) {
    return svg.replace(/width="20"/g, `width="${size}"`).replace(/height="20"/g, `height="${size}"`)
  }
  return svg
}
