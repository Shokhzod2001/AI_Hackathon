import { create } from 'zustand'
import type { Scan } from '@/types'

interface AlertState {
  selected: Scan[]
  selectScan: (scan: Scan) => void
  deselectScan: (id: string) => void
  clearSelection: () => void
}

export const useAlertStore = create<AlertState>((set) => ({
  selected: [],
  selectScan: (scan) => set((s) => ({ selected: [...s.selected.filter((x) => x.id !== scan.id), scan] })),
  deselectScan: (id) => set((s) => ({ selected: s.selected.filter((x) => x.id !== id) })),
  clearSelection: () => set({ selected: [] }),
}))
