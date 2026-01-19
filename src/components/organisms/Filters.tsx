'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '../base/buttons/button'
import { useSidebar } from '@/context/SidebarContext'
import { XClose } from '@untitledui/icons'
import { Checkbox } from '@/components/base/checkbox/checkbox'
import { Categories } from '@/libs/categories'
import { capitalizeFirstLetter } from '@/utils/capitalizeFirstLetter'

export default function Filters() {
  const { isFiltersOpen, closeFilters } = useSidebar()
  const searchParams = useSearchParams()
  const router = useRouter()

  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const maxSelection = 5

  // initialize selected categories from query string
  useEffect(() => {
    const current = searchParams.get('category')
    if (current) setSelectedCategories(current.split(','))
  }, [searchParams])

  if (!isFiltersOpen) return null

  const toggleCategory = (category: string, selected: boolean) => {
    if (selected) {
      if (selectedCategories.length < maxSelection) {
        setSelectedCategories([...selectedCategories, category])
      }
    } else {
      setSelectedCategories(selectedCategories.filter((c) => c !== category))
    }
  }

  const reachedLimit = selectedCategories.length >= maxSelection

  const handleApply = () => {
    const params = new URLSearchParams()
    if (selectedCategories.length) params.set('category', selectedCategories.join(','))
    // future filters: params.set('language', selectedLanguage)
    router.push(`?${params.toString()}`)
    closeFilters()
  }

  return (
    <div>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs md:hidden"
        onClick={closeFilters}
      ></div>

      {/* Sidebar */}
      <div className="fixed inset-x-0 top-0 h-dvh flex flex-col gap-8 md:sticky md:top-0 md:h-dvh">
        <div className="md:hidden"></div>
        <div className="border-t rounded-t-2xl border-gray-200 text-gray-700 h-full bg-white md:w-2xs md:border-r md:border-t-0 md:rounded-none overflow-hidden">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex flex-col px-4 py-6 gap-6 border-b border-gray-200 bg-white relative md:px-3">
              <div className="flex flex-col gap-1">
                <div>
                  <p className="text-xl font-semibold text-gray-900">Filters</p>
                  <Button
                    color="tertiary"
                    size="sm"
                    iconLeading={<XClose data-icon />}
                    aria-label="Close Filters"
                    className="absolute top-3 right-3 md:hidden"
                    onClick={closeFilters}
                  />
                </div>
                <p className="text-sm">Select criteria to filter news articles.</p>
              </div>
            </div>

            {/* Category list */}
            <div className="flex flex-col px-4 py-6 flex-1 overflow-y-auto gap-3 md:px-3">
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-0">
                  <p className="font-semibold text-gray-900">Category</p>
                  <p className="text-sm">Select up to five.</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {Categories.map((category) => (
                    <Checkbox
                      key={category}
                      label={capitalizeFirstLetter(category)}
                      size="sm"
                      isSelected={selectedCategories.includes(category)}
                      onChange={(selected) => toggleCategory(category, selected)}
                      isDisabled={!selectedCategories.includes(category) && reachedLimit}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Footer buttons */}
            <div className="flex px-4 py-4 border-t border-gray-200 gap-2 md:px-3">
              <Button
                color="secondary"
                size="md"
                className="flex-1"
                onClick={() => {
                  setSelectedCategories([])
                  router.push('/')
                }}
              >
                Clear All
              </Button>
              <Button color="primary" size="md" className="flex-1" onClick={handleApply}>
                Apply
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
