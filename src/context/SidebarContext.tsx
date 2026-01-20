'use client'

import { createContext, useContext, useState } from 'react'

type SidebarContextType = {
  isLanguageOpen: boolean
  toggleLanguage: () => void
  closeLanguage: () => void
  isFiltersOpen: boolean
  toggleFilters: () => void
  closeFilters: () => void
}

const SidebarContext = createContext<SidebarContextType | null>(null)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isLanguageOpen, setIsLanguageOpen] = useState(false)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  const toggleLanguage = () => {
    setIsLanguageOpen((v) => !v)
    if (!isLanguageOpen) setIsFiltersOpen(false) // close filters when opening language
  }

  const toggleFilters = () => {
    setIsFiltersOpen((v) => !v)
    if (!isFiltersOpen) setIsLanguageOpen(false) // close language when opening filters
  }

  return (
    <SidebarContext.Provider
      value={{
        isLanguageOpen,
        toggleLanguage,
        closeLanguage: () => setIsLanguageOpen(false),
        isFiltersOpen,
        toggleFilters,
        closeFilters: () => setIsFiltersOpen(false),
      }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const ctx = useContext(SidebarContext)
  if (!ctx) throw new Error('useSidebar must be used within SidebarProvider')
  return ctx
}
