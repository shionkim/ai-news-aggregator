export function formatDate(dateString: string, locale = "en-US") {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString(locale, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
