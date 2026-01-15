"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CATEGORIES } from "@/libs/categories";
import { capitalizeFirstLetter } from "@/utils/capitalizeFirstLetter";
import { Button } from "@/components/base/buttons/button";
import {
  FilterLines,
  MessageCheckSquare,
  Translate01,
} from "@untitledui/icons";
import { Tooltip, TooltipTrigger } from "@/components/base/tooltip/tooltip";
import Image from "next/image";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="hidden sticky top-0 h-screen border-r border-gray-200 text-gray-600 md:block">
      <div className="flex flex-col h-full px-3 py-6 items-center gap-6">
        <Image
          src="/assets/logo/logo.svg"
          width={32}
          height={32}
          alt="Logo"
          priority
        />

        <div className="flex flex-col">
          <Tooltip title="Article language" placement="right">
            <TooltipTrigger className="group relative flex cursor-pointer flex-col items-center gap-2 text-fg-quaternary transition duration-100 ease-linear hover:text-fg-quaternary_hover focus:text-fg-quaternary_hover">
              <Link
                href="https://form.typeform.com/to/ojusTKFw"
                target="_blank"
              >
                <Button
                  color="tertiary"
                  size="sm"
                  iconLeading={<Translate01 data-icon />}
                  aria-label="Article language"
                ></Button>
              </Link>
            </TooltipTrigger>
          </Tooltip>

          <Tooltip title="Filters" placement="right">
            <TooltipTrigger className="group relative flex cursor-pointer flex-col items-center gap-2 text-fg-quaternary transition duration-100 ease-linear hover:text-fg-quaternary_hover focus:text-fg-quaternary_hover">
              <Link
                href="https://form.typeform.com/to/ojusTKFw"
                target="_blank"
              >
                <Button
                  color="tertiary"
                  size="sm"
                  iconLeading={<FilterLines data-icon />}
                  aria-label="Filters"
                ></Button>
              </Link>
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
  );
}
