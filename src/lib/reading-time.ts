/**
 * Calculates estimated reading time in minutes from HTML or plain text.
 * Average reading speed: 200 words per minute.
 */
export function calculateReadingTime(htmlOrText: string): number {
  if (!htmlOrText) return 1;
  const clean = htmlOrText.replace(/<[^>]*>/g, " ").trim();
  const words = clean ? clean.split(/\s+/).length : 0;
  return Math.max(1, Math.ceil(words / 200));
}
