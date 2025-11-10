"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CATEGORIES } from "@/libs/categories";
import { capitalizeFirstLetter } from "@/utils/capitalizeFirstLetter";
import { Button } from "@/components/base/buttons/button";
import { MessageCheckSquare } from "@untitledui/icons";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="hidden w-64 sticky top-0 h-screen border-r border-gray-200 text-gray-600 md:block">
      <div className="flex flex-col h-full">
        <div className="px-8 pt-8 mb-8 sm:pt-16">
          <p className="text-2xl font-semibold text-gray-900">TrustedAI</p>
        </div>

        {/* Scrollable categories */}

        <ul className="flex flex-col gap-1 overflow-y-scroll px-4 pb-3 sm:px-4">
          {CATEGORIES.map((cat) => {
            const href = cat === "top" ? "/" : `/${cat}`;
            const isActive = pathname === href;

            return (
              <li key={cat}>
                <Link href={href} className="flex flex-col">
                  <Button
                    color="tertiary"
                    size="md"
                    className={`justify-start transition 
                      ${
                        isActive
                          ? "bg-gray-100"
                          : "bg-transparent hover:bg-gray-100"
                      }`}
                  >
                    {capitalizeFirstLetter(cat)}
                  </Button>
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="px-4 mb-4">
          <div className="border-b border-gray-200"></div>
        </div>
        <div className="px-4 pb-8 sm:pb-16">
          <Link
            href="https://form.typeform.com/to/ojusTKFw"
            className="flex flex-col"
          >
            <Button
              color="tertiary"
              size="md"
              className="justify-start"
              iconLeading={MessageCheckSquare}
            >
              Feedback
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
