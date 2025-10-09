"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CATEGORIES } from "@/libs/categories";
import { capitalizeFirstLetter } from "@/utils/capitalizeFirstLetter";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="w-64 sticky top-0 h-screen border-r border-gray-100 text-gray-600">
      <div className="flex flex-col h-full px-4 pt-8 sm:px-4 sm:pt-16">
        <div className="mb-8 px-4">
          <p className="text-2xl font-semibold text-gray-900">TrustedAI</p>
        </div>

        {/* Scrollable categories */}
        <ul className="flex flex-col gap-2 overflow-y-scroll pb-8 sm:pb-16">
          {CATEGORIES.map((cat) => {
            const href = cat === "top" ? "/" : `/${cat}`;
            const isActive = pathname === href;

            return (
              <li key={cat}>
                <Link
                  href={href}
                  className={`
                    block px-4 py-2 rounded-xl font-medium text-gray-600
                    ${
                      isActive ? "bg-gray-50 text-gray-900" : "hover:bg-gray-50"
                    }
                    transition-colors
                  `}
                >
                  {capitalizeFirstLetter(cat)}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
