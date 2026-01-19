'use client'

import Navbar from '@/components/organisms/Navbar'

import MainContent from '@/components/molecules/MainContent'
import LanguageSelector from '../organisms/LanguageSelector'
import { SidebarProvider } from '@/context/SidebarContext'
import Filters from '../organisms/Filters'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex flex-col md:flex-row">
        <Navbar />
        <LanguageSelector />
        <Filters />
        <MainContent>{children}</MainContent>
      </div>
    </SidebarProvider>
  )
}
