import { ref } from 'vue'

// Module-level ref = shared singleton state across every component that imports this.
const isNotificationsSlideoverOpen = ref(false)

export function useDashboard() {
  return { isNotificationsSlideoverOpen }
}
