"use client";

import { useMemo } from "react";
import { ChevronDown, Globe01 } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { Dropdown } from "@/components/base/dropdown/dropdown";
import { getLangCodeList, getLangNameFromCode } from "language-name-map";

import { useLanguage } from "@/context/LanguageContext";

export const LangPickerDropdown: React.FC = () => {
  const languages = useMemo(() => {
    const langs = getLangCodeList().map((code) => {
      const lang = getLangNameFromCode(code);
      return {
        id: code,
        name: lang.name,
        native: lang.native,
      };
    });

    // Sort English first, then the rest alphabetically
    return langs.sort((a, b) => {
      if (a.id === "en") return -1;
      if (b.id === "en") return 1;
      return a.name.localeCompare(b.name);
    });
  }, []);

  const { selected, setSelected } = useLanguage();

  // If context selected isn't set (shouldn't happen) fallback to en
  if (!selected) setSelected(languages.find((l) => l.id === "en")!);

  return (
    <Dropdown.Root>
      <Button color="secondary" iconTrailing={ChevronDown}>
        <span>{selected?.native || "Select language"}</span>
      </Button>

      <Dropdown.Popover>
        <Dropdown.Menu>
          <Dropdown.Section>
            {languages.map((lang) => (
              <Dropdown.Item key={lang.id} onClick={() => setSelected(lang)}>
                {lang.native}
              </Dropdown.Item>
            ))}
          </Dropdown.Section>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown.Root>
  );
};

export default LangPickerDropdown;
