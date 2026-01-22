'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import languageNameMap from 'language-name-map/map'

type Language = {
  id: string
  name: string
  native: string
  dir: boolean // true = LTR, false = RTL
}

interface LanguageContextType {
  selected: Language
  setSelected: (lang: Language) => void
}

const STORAGE_KEY = 'user-article-language'

// Default language (English, LTR)
const defaultLanguage: Language = {
  id: 'en',
  name: languageNameMap['en'].name,
  native: languageNameMap['en'].native,
  dir: languageNameMap['en'].dir === 1, // 1 = LTR
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [selected, setSelected] = useState<Language>(defaultLanguage)
  const [hydrated, setHydrated] = useState(false)

  // 🔹 Load saved language once on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed?.id && languageNameMap[parsed.id]) {
          setSelected({
            id: parsed.id,
            name: languageNameMap[parsed.id].name,
            native: languageNameMap[parsed.id].native,
            dir: languageNameMap[parsed.id].dir === 1, // 1 = LTR, 0 = RTL
          })
        }
      } catch (err) {
        console.error('Failed to parse saved language', err)
      }
    }
    setHydrated(true)
  }, [])

  // 🔹 Persist language changes
  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ id: selected.id }))
    }
  }, [selected, hydrated])

  return (
    <LanguageContext.Provider value={{ selected, setSelected }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = (): LanguageContextType => {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
