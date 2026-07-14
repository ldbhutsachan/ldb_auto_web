<template>
  <div class="stat-card animate-in" :style="{ '--card-accent': accentColor }">
    <div class="stat-card-glow"></div>
    <div class="stat-header">
      <div class="stat-icon" v-html="icon"></div>
      <span class="stat-label">{{ label }}</span>
    </div>
    <div class="stat-value" v-if="!loading">{{ value }}</div>
    <div class="stat-value shimmer" v-else>&nbsp;</div>
    <div class="stat-footer" v-if="growth !== null && !loading">
      <span class="growth-indicator" :class="growth >= 0 ? 'up' : 'down'">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
          <path v-if="growth >= 0" d="M6 2l4 5H2l4-5z" />
          <path v-else d="M6 10l-4-5h8l-4 5z" />
        </svg>
        {{ Math.abs(growth).toFixed(1) }}%
      </span>
      <span class="growth-label">{{ t('dashboard.vsLastMonth') }}</span>
    </div>
  </div>
</template>

<script setup>
import { t } from '@/i18n'

defineProps({
  label: String,
  value: [String, Number],
  icon: String,
  growth: { type: Number, default: null },
  accentColor: { type: String, default: '#3b82f6' },
  loading: Boolean,
})
</script>

<style scoped>
.stat-card {
  background: white;
  border-radius: var(--radius-lg, 16px);
  padding: 22px 24px;
  border: 1px solid #e2e8f0;
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--card-accent);
  opacity: 0.6;
}

.stat-card-glow {
  position: absolute;
  top: -50%;
  right: -50%;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, color-mix(in srgb, var(--card-accent) 6%, transparent) 0%, transparent 70%);
  pointer-events: none;
  transition: opacity 0.35s;
  opacity: 0;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
  border-color: #bfdbfe;
}

.stat-card:hover .stat-card-glow {
  opacity: 1;
}

.stat-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  position: relative;
  z-index: 1;
}

.stat-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: color-mix(in srgb, var(--card-accent) 10%, #eff6ff);
  color: var(--card-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 20px;
}

.stat-label {
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
  line-height: 1.4;
}

.stat-value {
  font-size: 28px;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.15;
  margin-bottom: 14px;
  font-family: 'Inter', var(--font-sans, sans-serif);
  position: relative;
  z-index: 1;
  letter-spacing: -0.02em;
}

.stat-value.shimmer {
  height: 34px;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: 6px;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.stat-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  z-index: 1;
}

.growth-indicator {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.growth-indicator.up { background: #ecfdf5; color: #059669; }
.growth-indicator.down { background: #fef2f2; color: #dc2626; }

.growth-label { font-size: 12px; color: #94a3b8; }
</style>
