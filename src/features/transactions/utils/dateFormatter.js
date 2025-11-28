/**
 * Date formatting utilities for transaction dates
 */

/**
 * Formats a date string to a localized date-time string
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date string
 */
export function formatTransactionDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString();
}

