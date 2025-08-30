/**
 * HTML sanitization utilities to prevent XSS attacks
 */

/**
 * Escapes HTML characters to prevent XSS injection
 * @param unsafe - The unsafe string that may contain HTML characters
 * @returns Escaped string safe for HTML insertion
 */
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Sanitizes text content, handling null/undefined values safely
 * @param text - Text that may be null, undefined, or contain HTML
 * @returns Safe string ready for DOM insertion
 */
export function sanitizeText(text: string | null | undefined): string {
  if (text == null) return "";
  return escapeHtml(String(text));
}

/**
 * Creates a safe text node with escaped content
 * @param text - Text content to sanitize
 * @returns Text node with safe content
 */
export function createSafeTextNode(text: string | null | undefined): Text {
  return document.createTextNode(sanitizeText(text));
}

/**
 * Safely sets text content on an element
 * @param element - DOM element to update
 * @param text - Text content to set (will be sanitized)
 */
export function setSafeTextContent(element: HTMLElement, text: string | null | undefined): void {
  element.textContent = sanitizeText(text);
}