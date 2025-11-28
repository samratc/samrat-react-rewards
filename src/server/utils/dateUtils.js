/**
 * Date utility functions for transaction date handling
 */

/**
 * Validates if a value is a valid Date object
 * @param {Date} dateValue - Value to validate
 * @returns {boolean} - True if valid Date object
 */
export function isValidDate(dateValue) {
  return dateValue instanceof Date && !Number.isNaN(dateValue.getTime());
}

/**
 * Gets a date representing n months ago from now at UTC midnight
 * @param {number} monthsAgo - Number of months to go back
 * @returns {Date} - Date object at UTC midnight
 */
export function getDateMonthsAgo(monthsAgo) {
  const now = new Date();
  return new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth() - monthsAgo,
    now.getUTCDate(),
    0, 0, 0, 0
  ));
}

/**
 * Formats a date to YYYY-MM format using Intl.DateTimeFormat
 * @param {Date} date - Date object to format
 * @returns {string} - Formatted string in YYYY-MM format
 */
export function formatYearMonth(date) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    timeZone: 'UTC'
  });
  
  const parts = formatter.formatToParts(date);
  const year = parts.find(part => part.type === 'year').value;
  const month = parts.find(part => part.type === 'month').value;
  
  return `${year}-${month}`;
}

/**
 * Filters transactions to only include those within the specified number of months
 * @param {Array} transactions - Array of transaction objects with date property
 * @param {number} months - Number of months to look back (default: 3)
 * @returns {Array} - Filtered transactions with yearMonth property added
 */
export function filterRecentTransactions(transactions, months = 3) {
  const cutoffDate = getDateMonthsAgo(months);
  const cutoffTime = cutoffDate.getTime();
  
  return transactions
    .map(transaction => {
      const transactionDate = new Date(transaction.date);
      if (!isValidDate(transactionDate)) {
        return null;
      }
      if (transactionDate.getTime() < cutoffTime) {
        return null;
      }
      return {
        ...transaction,
        yearMonth: formatYearMonth(transactionDate)
      };
    })
    .filter(transaction => transaction !== null);
}

