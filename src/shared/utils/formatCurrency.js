/**
 * Formats a number as currency
 * @param {number} amount - Amount to format
 * @returns {string} - Formatted currency string
 */
export function formatCurrency(amount) {
  return `$${Number(amount ?? 0).toFixed(2)}`;
}

/**
 * Formats a date to locale string
 * @param {string|Date} dateValue - Date to format
 * @returns {string} - Formatted date string
 */
export function formatDate(dateValue) {
  return new Date(dateValue).toLocaleString();
}

