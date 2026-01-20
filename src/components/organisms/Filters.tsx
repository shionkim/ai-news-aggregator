'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '../base/buttons/button'
import { useSidebar } from '@/context/SidebarContext'
import { XClose } from '@untitledui/icons'
import { Checkbox } from '@/components/base/checkbox/checkbox'
import { Categories } from '@/libs/categories'
import { capitalizeFirstLetter } from '@/utils/capitalizeFirstLetter'
import { Input } from '../base/input/input'
import { Countries } from '@/libs/countries'
import { Languages } from '@/libs/languages'

/**
 * A helper component that detects when it becomes "stuck" at the top
 * and applies a border-bottom dynamically.
 */
function StickySectionHeader({ children }: { children: React.ReactNode }) {
  const [isStuck, setIsStuck] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // The observer triggers when the element is no longer 100% visible
    // because we set top: -1px in the styles.
    const observer = new IntersectionObserver(([e]) => setIsStuck(e.intersectionRatio < 1), {
      threshold: [1],
    })

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`sticky top-[-1px] z-10 px-4 bg-white py-3 transition-colors duration-200 ${
        isStuck ? 'border-b border-gray-200' : 'border-b border-transparent'
      }`}
    >
      {children}
    </div>
  )
}

export default function Filters() {
  const { isFiltersOpen, closeFilters } = useSidebar()
  const searchParams = useSearchParams()
  const router = useRouter()

  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedCountries, setSelectedCountries] = useState<string[]>([])
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])
  const [keyword, setKeyword] = useState('')

  const maxSelection = 5

  useEffect(() => {
    const categoryParam = searchParams.get('category')
    const keywordParam = searchParams.get('q')
    const countryParam = searchParams.get('country')
    const langParam = searchParams.get('lang')

    if (categoryParam) setSelectedCategories(categoryParam.split(','))
    if (keywordParam) setKeyword(keywordParam)
    if (countryParam) setSelectedCountries(countryParam.split(','))
    if (langParam) setSelectedLanguages(langParam.split(','))
  }, [searchParams])

  if (!isFiltersOpen) return null

  const toggleCategory = (category: string, selected: boolean) => {
    if (selected) {
      if (selectedCategories.length < maxSelection)
        setSelectedCategories([...selectedCategories, category])
    } else {
      setSelectedCategories(selectedCategories.filter((c) => c !== category))
    }
  }

  const toggleCountry = (code: string, selected: boolean) => {
    if (selected) {
      if (selectedCountries.length < maxSelection)
        setSelectedCountries([...selectedCountries, code])
    } else {
      setSelectedCountries(selectedCountries.filter((c) => c !== code))
    }
  }

  const toggleLanguage = (code: string, selected: boolean) => {
    if (selected) {
      if (selectedLanguages.length < maxSelection)
        setSelectedLanguages([...selectedLanguages, code])
    } else {
      setSelectedLanguages(selectedLanguages.filter((c) => c !== code))
    }
  }

  const handleApply = () => {
    const params = new URLSearchParams()
    if (selectedCategories.length) params.set('category', selectedCategories.join(','))
    if (selectedCountries.length) params.set('country', selectedCountries.join(','))
    if (selectedLanguages.length) params.set('lang', selectedLanguages.join(','))
    if (keyword.trim()) params.set('q', keyword.trim())

    router.push(`/?${params.toString()}`)
    closeFilters()
  }

  const handleClear = () => {
    setSelectedCategories([])
    setSelectedCountries([])
    setSelectedLanguages([])
    setKeyword('')
    router.push('/')
  }

  return (
    <div>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs md:hidden"
        onClick={closeFilters}
      />

      <div className="fixed inset-x-0 bottom-0 flex flex-col gap-8 md:sticky md:top-0 z-10 overflow-clip border-t rounded-t-2xl border-gray-200 h-[calc(100dvh-2rem)] md:h-svh bg-white md:w-xs md:border-r md:rounded-none md:border-t-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="px-4 py-6 border-b border-gray-200 relative bg-white">
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

          {/* Body */}
          <div className="flex flex-col flex-1 gap-0 overflow-y-auto overflow-anchor-none -webkit-overflow-scrolling-touch transform-gpu">
            {/* Keywords */}
            <div className="flex flex-col pt-3">
              <StickySectionHeader>
                <p className="font-semibold">Keywords</p>
              </StickySectionHeader>
              <div className="px-4">
                <Input
                  value={keyword}
                  onChange={setKeyword}
                  hint="Search news articles for specific keywords."
                  placeholder="AI, Technology, Geopolitics..."
                />
              </div>
            </div>

            {/* Categories */}
            <div className="flex flex-col pt-3">
              <StickySectionHeader>
                <p className="font-semibold">Categories</p>
                <p className="text-sm text-gray-600">Select up to five.</p>
              </StickySectionHeader>
              <div className="grid grid-cols-2 gap-2">
                {Categories.map((category) => (
                  <Checkbox
                    key={category}
                    label={capitalizeFirstLetter(category)}
                    size="sm"
                    isSelected={selectedCategories.includes(category)}
                    onChange={(selected) => toggleCategory(category, selected)}
                    isDisabled={
                      !selectedCategories.includes(category) &&
                      selectedCategories.length >= maxSelection
                    }
                    className="px-4"
                  />
                ))}
              </div>
            </div>

            {/* Countries */}
            <div className="flex flex-col pt-3">
              <StickySectionHeader>
                <p className="font-semibold">Countries</p>
                <p className="text-sm text-gray-600">Select up to five.</p>
              </StickySectionHeader>
              <div className="grid grid-cols-2 gap-2 pb-3">
                {Object.entries(Countries).map(([name, code]) => (
                  <Checkbox
                    key={code}
                    label={name}
                    value={code}
                    size="sm"
                    isSelected={selectedCountries.includes(code)}
                    onChange={(selected) => toggleCountry(code, selected)}
                    isDisabled={
                      !selectedCountries.includes(code) && selectedCountries.length >= maxSelection
                    }
                    className="px-4"
                  />
                ))}
              </div>
            </div>

            {/* Languages */}
            <div className="flex flex-col pt-3">
              <StickySectionHeader>
                <p className="font-semibold">Languages</p>
                <p className="text-sm text-gray-600">Select up to five.</p>
              </StickySectionHeader>
              <div className="grid grid-cols-2 gap-2 pb-6">
                {Object.entries(Languages).map(([name, code]) => (
                  <Checkbox
                    key={code}
                    label={name}
                    value={code}
                    size="sm"
                    isSelected={selectedLanguages.includes(code)}
                    onChange={(selected) => toggleLanguage(code, selected)}
                    isDisabled={
                      !selectedLanguages.includes(code) && selectedLanguages.length >= maxSelection
                    }
                    className="px-4"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-4 border-t border-gray-200 flex gap-3 md:gap-3 bg-white">
            <Button color="secondary" size="md" className="flex-1" onClick={handleClear}>
              Clear All
            </Button>
            <Button color="primary" size="md" className="flex-1" onClick={handleApply}>
              Apply
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
