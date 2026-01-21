'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { Button } from '@/components/base/buttons/button'
import { FilterLines, MessageCheckSquare, Translate01 } from '@untitledui/icons'
import { Tooltip, TooltipTrigger } from '@/components/base/tooltip/tooltip'
import Image from 'next/image'
import { useSidebar } from '@/context/SidebarContext'
import Link from 'next/dist/client/link'

export default function Navbar() {
  const pathname = usePathname()
  const { toggleLanguage, isLanguageOpen, toggleFilters, isFiltersOpen } = useSidebar()

  const searchParams = useSearchParams()

  const hasActiveFilters =
    searchParams.has('category') ||
    searchParams.has('country') ||
    searchParams.has('lang') ||
    searchParams.has('q')

  return (
    <nav className="top-0 border-b border-gray-200 text-gray-600 md:sticky md:h-screen md:border-r">
      <div className="flex h-full px-3 py-2 items-center gap-6 justify-between md:flex-col md:py-6 md:justify-start">
        <Link href="/">
          <Image src="/assets/logo/logo.svg" width={32} height={32} alt="Logo" priority />
        </Link>
        <div className="flex md:flex-col gap-1">
          <Tooltip title="Article language" placement="right">
            <TooltipTrigger className="group relative flex cursor-pointer flex-col items-center gap-2 text-fg-quaternary transition duration-100 ease-linear hover:text-fg-quaternary_hover focus:text-fg-quaternary_hover">
              <Button
                color={isLanguageOpen ? 'secondary' : 'tertiary'}
                size="sm"
                iconLeading={<Translate01 data-icon />}
                aria-label="Article language"
                onClick={toggleLanguage}
              ></Button>
            </TooltipTrigger>
          </Tooltip>

          <Tooltip title="Filters" placement="right">
            <TooltipTrigger className="group relative flex cursor-pointer flex-col items-center gap-2 text-fg-quaternary transition duration-100 ease-linear hover:text-fg-quaternary_hover focus:text-fg-quaternary_hover">
              <Button
                color={isFiltersOpen ? 'secondary' : hasActiveFilters ? 'primary' : 'tertiary'}
                size="sm"
                iconLeading={<FilterLines data-icon />}
                aria-label="Filters"
                onClick={toggleFilters}
              ></Button>
            </TooltipTrigger>
          </Tooltip>

          <Tooltip title="Feedback" placement="right">
            <TooltipTrigger className="group relative flex cursor-pointer flex-col items-center gap-2 text-fg-quaternary transition duration-100 ease-linear hover:text-fg-quaternary_hover focus:text-fg-quaternary_hover">
              <a href="https://form.typeform.com/to/ojusTKFw" target="_blank">
                <Button
                  color="tertiary"
                  size="sm"
                  iconLeading={<MessageCheckSquare data-icon />}
                  aria-label="Feedback"
                ></Button>
              </a>
            </TooltipTrigger>
          </Tooltip>
        </div>
      </div>
    </nav>
  )
}
