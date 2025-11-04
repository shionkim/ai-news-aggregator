"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getLangNameFromCode } from "language-name-map";

type LangItem = { id: string; name: string; native?: string; icon?: any };

interface LanguageContextValue {
  selected: LangItem;
  setSelected: (l: LangItem) => void;
}

const defaultLang: LangItem = { id: "en", name: "English", native: "English" };

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined
);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [selected, setSelectedState] = useState<LangItem>(defaultLang);

  // Load persisted selection from localStorage on mount
  useEffect(() => {
    try {
      const stored =
        typeof window !== "undefined"
          ? localStorage.getItem("preferred_language")
          : null;
      if (stored) {
        const id = stored;
        const lang = getLangNameFromCode(id as any);
        if (lang)
          setSelectedState({ id, name: lang.name, native: lang.native });
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Wrap setter to persist
  const setSelected = (l: LangItem) => {
    setSelectedState(l);
    try {
      if (typeof window !== "undefined")
        localStorage.setItem("preferred_language", l.id);
    } catch (e) {
      // ignore
    }
  };

  return (
    <LanguageContext.Provider value={{ selected, setSelected }}>
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  // If the context is missing (e.g. during SSR or before provider mounts), return a safe default
  if (!ctx) {
    return {
      selected: defaultLang,
      setSelected: (_: LangItem) => {
        /* noop fallback to avoid crashes when provider is absent */
      },
    };
  }
  return ctx;
}

export default LanguageProvider;
