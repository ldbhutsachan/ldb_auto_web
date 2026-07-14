<template>
  <div class="placeholder-page">
    <div class="page-icon">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 17a2 2 0 01-2-2c0-1.11.89-2 2-2a2 2 0 012 2 2 2 0 01-2 2m6 3V10H6v10a2 2 0 002 2h8a2 2 0 002-2m-2-10V6a4 4 0 00-4-4 4 4 0 00-4 4v4h2V6a2 2 0 012-2 2 2 0 012 2v4z"/>
      </svg>
    </div>
    <h2 class="page-title">{{ t('nav.auth') }}</h2>
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
