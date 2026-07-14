<template>
  <div class="placeholder-page">
    <div class="page-icon">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
        <path d="M15 14c-2.67 0-8 1.33-8 4v2h16v-2c0-2.67-5.33-4-8-4m-1-4a4 4 0 10-4-4 4 4 0 004 4m-4 2H5v3H3v-3H0v-2h3V8h2v3h3v2m9 1v3h-3v2h3v3h2v-3h3v-2h-3v-3z"/>
      </svg>
    </div>
    <h2 class="page-title">{{ t('nav.register') }}</h2>
    <p class="page-desc">{{ t('common.comingSoon') }}</p>
  </div>
</template>

<script setup>
import { t } from '@/i18n'
</script>

<style scoped>
.placeholder-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.page-icon {
  width: 96px;
  height: 96px;
  border-radius: 24px;
  background: var(--gray-100, #f4f4f5);
  color: var(--gray-500, #71717a);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px;
}

.page-desc {
  font-size: 15px;
  color: #9ca3af;
  margin: 0;
}
</style>
