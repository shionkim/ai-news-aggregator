'use client'

import languageNameMap from 'language-name-map/map'
import { Button } from '../base/buttons/button'
import { useLanguage } from '@/context/LanguageContext'
import { useSidebar } from '@/context/SidebarContext'
import { XClose } from '@untitledui/icons'

export default function LanguageSelector() {
  const { selected, setSelected } = useLanguage()
  const { isLanguageOpen, closeLanguage } = useSidebar()

  // Hidden by default
  if (!isLanguageOpen) return null

  return (
    <div>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-xs md:hidden"></div>

      <div className="fixed inset-x-0 top-8 border-t rounded-t-2xl border-gray-200 text-gray-700 bg-white h-screen md:sticky md:top-0 md:w-2xs md:border-r md:border-t-0 md:rounded-none overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex flex-col px-4 py-6 gap-6 border-b border-gray-200 bg-white relative md:px-3">
            <div className="flex flex-col gap-1 ">
              <div>
                <p className="text-xl font-semibold text-gray-900">Article language</p>
                <Button
                  color="tertiary"
                  size="sm"
                  iconLeading={<XClose data-icon />}
                  aria-label="Button CTA"
                  className="absolute top-3 right-3 md:hidden"
                  onClick={closeLanguage}
                />
              </div>
              <p className="text-sm">Articles will be translated into this language.</p>
            </div>
          </div>

          {/* Language list */}
          <div className="flex flex-col px-4 py-6 flex-1 overflow-y-auto gap-3 md:px-3">
            {Object.entries(languageNameMap).map(([code, lang]) => {
              const isSelected = selected.id === code

              return (
                <Button
                  key={code}
                  color={isSelected ? 'link-color' : 'link-gray'}
                  size="sm"
                  onClick={() => {
                    setSelected({
                      id: code,
                      name: lang.name,
                      native: lang.native,
                    })
                    closeLanguage() // 🔑 close after select
                  }}
                  className="text-left"
                >
                  <span className="flex flex-col gap-0">
                    <span>
                      {lang.native}
                      {isSelected && ' • Selected'}
                    </span>
                    <span className="font-medium opacity-50">{lang.name}</span>
                  </span>
                </Button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
