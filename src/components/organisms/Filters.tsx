'use client'

import { useState } from 'react'
import { Button } from '../base/buttons/button'
import { useSidebar } from '@/context/SidebarContext'
import { XClose } from '@untitledui/icons'
import { Checkbox } from '@/components/base/checkbox/checkbox'
import { Categories } from '@/libs/categories'
import { capitalizeFirstLetter } from '@/utils/capitalizeFirstLetter'

export default function Filters() {
  const { isFiltersOpen, closeFilters } = useSidebar()
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const maxSelection = 5

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

  return (
    <div>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-xs md:hidden"></div>

      <div className="fixed inset-x-0 top-8 border-t rounded-t-2xl border-gray-200 text-gray-700 bg-white h-screen md:sticky md:top-0 md:w-2xs md:border-r md:border-t-0 md:rounded-none overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex flex-col px-3 py-6 gap-6 border-b border-gray-200 bg-white relative">
            <div className="flex flex-col gap-1 ">
              <div>
                <p className="text-xl font-semibold text-gray-900">Filters</p>
                <Button
                  color="tertiary"
                  size="sm"
                  iconLeading={<XClose data-icon />}
                  aria-label="Button CTA"
                  className="absolute top-3 right-3 md:hidden"
                  onClick={closeFilters}
                />
              </div>
              <p className="text-sm">Select criteria to filter news articles.</p>
            </div>
          </div>

          {/* Criteria list */}
          <div className="flex flex-col px-3 py-6 flex-1 overflow-y-auto gap-3">
            {/* Category */}
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
          <div className="flex px-3 py-4 border-t border-gray-200 gap-2">
            <Button
              color="secondary"
              size="md"
              className="flex-1"
              onClick={() => setSelectedCategories([])}
            >
              Clear All
            </Button>
            <Button color="primary" size="md" className="flex-1">
              Apply
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
