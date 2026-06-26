import { create } from 'zustand'
import type { ToastType } from '@/types'

interface Toast {
  id: number
  message: string
  type: ToastType
}

interface NotifState {
  toasts: Toast[]
  unreadCount: number
  showToast: (message: string, type?: ToastType) => void
  removeToast: (id: number) => void
  markAllRead: () => void
}

let _id = 0

export const useNotifStore = create<NotifState>((set) => ({
  toasts: [],
  unreadCount: 3,

  showToast: (message, type = 'success') => {
    const id = ++_id
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }))
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 3500)
  },

  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  markAllRead: () => set({ unreadCount: 0 }),
}))
