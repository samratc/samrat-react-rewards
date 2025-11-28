/**
 * Client-side points calculation utility (for display/validation purposes)
 * Note: Actual calculations should be done server-side
 */

/**
 * Calculates reward points for a transaction amount
 * @param {number} amount - Transaction amount
 * @returns {number} - Calculated points
 */
export function calculatePoints(amount) {
  if (amount < 50) {
    return 0;
  }
  
  let points = 0;
  
  if (amount > 100) {
    const dollarsOver100 = Math.floor(amount - 100);
    points += dollarsOver100 * 2;
    points += 50;
  } else {
    const dollarsInRange = Math.floor(amount - 50);
    points += dollarsInRange;
  }
  
  return points;
}

