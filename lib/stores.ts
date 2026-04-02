import { create } from "zustand"

// Settings Store
interface Settings {
  electricityCostPerKwh: number
  currencySymbol: string
  defaultMarginPercent: number
}

interface SettingsStore {
  settings: Settings | null
  setSettings: (settings: Settings) => void
  loadSettings: () => Promise<void>
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  settings: null,
  setSettings: (settings) => set({ settings }),
  loadSettings: async () => {
    try {
      const response = await fetch("/api/settings")
      const data = await response.json()
      set({ settings: data })
    } catch (error) {
      console.error("Error loading settings:", error)
    }
  },
}))

// Notifications Store
interface Notification {
  id: string
  type: "success" | "error" | "warning" | "info"
  message: string
  duration?: number
}

interface NotificationStore {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, "id">) => void
  removeNotification: (id: string) => void
  clearAll: () => void
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  addNotification: (notification) => {
    const id = `${Date.now()}-${Math.random()}`
    set((state) => ({
      notifications: [...state.notifications, { ...notification, id }],
    }))

    if (notification.duration !== Infinity) {
      setTimeout(() => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }))
      }, notification.duration || 5000)
    }
  },
  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }))
  },
  clearAll: () => set({ notifications: [] }),
}))

// UI State Store (para modales, drawers, etc)
interface UIState {
  isLoading: boolean
  activeModal: string | null
  activeDrawer: string | null
}

interface UIStore extends UIState {
  setLoading: (loading: boolean) => void
  openModal: (modalId: string) => void
  closeModal: () => void
  openDrawer: (drawerId: string) => void
  closeDrawer: () => void
}

export const useUIStore = create<UIStore>((set) => ({
  isLoading: false,
  activeModal: null,
  activeDrawer: null,
  setLoading: (loading) => set({ isLoading: loading }),
  openModal: (modalId) => set({ activeModal: modalId }),
  closeModal: () => set({ activeModal: null }),
  openDrawer: (drawerId) => set({ activeDrawer: drawerId }),
  closeDrawer: () => set({ activeDrawer: null }),
}))

// Filters Store (para aplicar filtros en tablas)
interface FiltersState {
  printerFilter: string
  statusFilter: string
  dateRange: [Date | null, Date | null]
}

interface FiltersStore extends FiltersState {
  setPrinterFilter: (filter: string) => void
  setStatusFilter: (filter: string) => void
  setDateRange: (range: [Date | null, Date | null]) => void
  resetFilters: () => void
}

const defaultFilters: FiltersState = {
  printerFilter: "",
  statusFilter: "",
  dateRange: [null, null],
}

export const useFiltersStore = create<FiltersStore>((set) => ({
  ...defaultFilters,
  setPrinterFilter: (filter) => set({ printerFilter: filter }),
  setStatusFilter: (filter) => set({ statusFilter: filter }),
  setDateRange: (range) => set({ dateRange: range }),
  resetFilters: () => set(defaultFilters),
}))
