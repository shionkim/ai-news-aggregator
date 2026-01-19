"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import languageNameMap from "language-name-map/map";

type Language = {
  id: string;
  name: string;
  native: string;
};

interface LanguageContextType {
  selected: Language;
  setSelected: (lang: Language) => void;
}

const defaultLanguage: Language = {
  id: "en",
  name: languageNameMap["en"].name,
  native: languageNameMap["en"].native,
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [selected, setSelected] = useState<Language>(defaultLanguage);

  return (
    <LanguageContext.Provider value={{ selected, setSelected }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};
