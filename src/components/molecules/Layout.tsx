'use client'

import Navbar from '@/components/organisms/Navbar'

import MainContent from '@/components/molecules/MainContent'
import LanguageSelector from '../organisms/LanguageSelector'
import { SidebarProvider } from '@/context/SidebarContext'
import Filters from '../organisms/Filters'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      {/* 1. h-screen + overflow-hidden locks the main window */}
      <div className="flex flex-col md:flex-row h-dvh overflow-clip">
        <Navbar />
        <LanguageSelector />

        {/* 2. Filters needs to occupy its own scroll area */}
        <Filters />

        {/* 3. MainContent needs flex-1 and its own overflow-y-auto */}
        <main className="flex-1 overflow-y-auto">
          <MainContent>{children}</MainContent>
        </main>
      </div>
    </SidebarProvider>
  )
}
