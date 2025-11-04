"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CATEGORIES } from "@/libs/categories";
import { capitalizeFirstLetter } from "@/utils/capitalizeFirstLetter";
import { Button } from "@/components/base/buttons/button";
import { MessageCheckSquare, Menu01, X } from "@untitledui/icons";

export default function NavbarMobile() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Header (visible when menu closed) */}
      <div className="flex items-center justify-between px-4 py-3 md:hidden sm:px-8 border-b border-gray-200">
        <p className="text-2xl font-semibold text-gray-900">TrustedAI</p>
        <button onClick={toggleMenu}>
          <Menu01 className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-white md:hidden flex flex-col h-screen">
          {/* Overlay Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 sm:px-8">
            <p className="text-2xl font-semibold text-gray-900">TrustedAI</p>
            <button onClick={toggleMenu}>
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Scrollable Categories */}
          <div className="flex-1 overflow-y-auto px-2 py-3 sm:px-4">
            {CATEGORIES.map((cat) => {
              const href = cat === "top" ? "/" : `/${cat}`;
              const isActive = pathname === href;

              return (
                <Link key={cat} href={href} className="mb-2">
                  <Button
                    color="tertiary"
                    size="sm"
                    className={`w-full justify-start transition ${
                      isActive ? "bg-gray-50" : ""
                    }`}
                  >
                    {capitalizeFirstLetter(cat)}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Feedback Button fixed at bottom */}
          <div className="px-2 py-4 border-t border-gray-200">
            <Link href="">
              <Button
                color="tertiary"
                size="sm"
                className="w-full justify-start"
                iconLeading={MessageCheckSquare}
              >
                Feedback
              </Button>
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
