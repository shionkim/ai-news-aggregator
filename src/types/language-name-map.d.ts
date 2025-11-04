declare module "language-name-map" {
  export interface LangInfo {
    name: string;
    native: string;
    dir: "ltr" | "rtl" | number;
  }

  export function getLangNameFromCode(code: string): LangInfo;
  export function getLangCodeList(): string[];
}
