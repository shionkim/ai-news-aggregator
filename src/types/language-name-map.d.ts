declare module "language-name-map/map" {
  const languageNameMap: Record<
    string,
    {
      name: string;
      dir: number;
      native: string;
    }
  >;

  export default languageNameMap;
}
