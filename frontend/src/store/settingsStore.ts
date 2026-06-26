import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Settings {
  telegram_alerts: boolean
  auto_block: boolean
  ai_analysis: boolean
  dark_web: boolean
  email_reports: boolean
  websocket: boolean
}

interface SettingsState {
  settings: Settings
  toggle: (key: keyof Settings) => void
  update: (patch: Partial<Settings>) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: {
        telegram_alerts: true,
        auto_block: false,
        ai_analysis: true,
        dark_web: false,
        email_reports: false,
        websocket: true,
      },
      toggle: (key) => set((s) => ({ settings: { ...s.settings, [key]: !s.settings[key] } })),
      update: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
    }),
    { name: 'nm-settings' }
  )
)
