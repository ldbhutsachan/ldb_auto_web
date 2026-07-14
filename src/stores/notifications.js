import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// Real store, starts empty — there is no notifications API yet. This is a
// working hook for a future notifications feature, wired to the sidebar
// bell + NotificationsSlideover, not a stub with fake data.
export const useNotificationsStore = defineStore('notifications', () => {
  const items = ref([])
  const loading = ref(false)

  const unreadCount = computed(() => items.value.filter((n) => !n.read).length)

  async function loadNotifications() {
    // No backend endpoint exists yet. Left as a real async function so a
    // future API call can be dropped in here without touching call sites.
  }

  function markRead(id) {
    const item = items.value.find((n) => n.id === id)
    if (item) item.read = true
  }

  function markAllRead() {
    items.value.forEach((n) => { n.read = true })
  }

  return { items, loading, unreadCount, loadNotifications, markRead, markAllRead }
})
