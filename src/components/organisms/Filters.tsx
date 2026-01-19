'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '../base/buttons/button'
import { useSidebar } from '@/context/SidebarContext'
import { XClose } from '@untitledui/icons'
import { Checkbox } from '@/components/base/checkbox/checkbox'
import { Categories } from '@/libs/categories'
import { capitalizeFirstLetter } from '@/utils/capitalizeFirstLetter'
import { Input } from '../base/input/input'

export default function Filters() {
  const { isFiltersOpen, closeFilters } = useSidebar()
  const searchParams = useSearchParams()
  const router = useRouter()

  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [keyword, setKeyword] = useState('')

  const maxSelection = 5

  // 🔹 Initialize from URL
  useEffect(() => {
    const categoryParam = searchParams.get('category')
    const keywordParam = searchParams.get('q')

    if (categoryParam) setSelectedCategories(categoryParam.split(','))
    if (keywordParam) setKeyword(keywordParam)
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

    if (selectedCategories.length) {
      params.set('category', selectedCategories.join(','))
    }

    if (keyword.trim()) {
      params.set('q', keyword.trim())
    }

    router.push(`/?${params.toString()}`)
    closeFilters()
  }

  const handleClear = () => {
    setSelectedCategories([])
    setKeyword('')
    router.push('/')
  }

  return (
    <div>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs md:hidden"
        onClick={closeFilters}
      />

      {/* Sidebar */}
      <div className="fixed inset-x-0 top-0 h-dvh flex flex-col gap-8 md:sticky md:top-0 z-10">
        <div className="md:hidden"></div>
        <div className="border-t rounded-t-2xl border-gray-200 h-full bg-white md:w-2xs md:border-r md:rounded-none">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="px-4 py-6 border-b border-gray-200 relative">
              <p className="text-xl font-semibold">Filters</p>
              <Button
                color="tertiary"
                size="sm"
                iconLeading={<XClose />}
                className="absolute top-3 right-3 md:hidden"
                onClick={closeFilters}
              />
              <p className="text-sm text-gray-700">Select criteria to filter news articles.</p>
            </div>

            <div className="flex-1 px-4 py-6 gap-6 flex flex-col">
              {/* Keywords */}
              <div className="flex flex-col gap-3">
                <p className="font-semibold">Keywords</p>
                <Input
                  value={keyword}
                  onChange={setKeyword}
                  hint="Search news articles for specific keywords."
                  placeholder="AI, Technology, Geopolitics..."
                />
              </div>

              {/* Categories */}
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-0">
                  <p className="font-semibold">Categories</p>
                  <p className="text-sm text-gray-600">Select up to five.</p>
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

            {/* Footer */}
            <div className="px-4 py-4 border-t border-gray-200 flex gap-3 md:gap-3">
              <Button color="secondary" className="flex-1" onClick={handleClear}>
                Clear All
              </Button>
              <Button color="primary" className="flex-1" onClick={handleApply}>
                Apply
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
