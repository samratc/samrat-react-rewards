/**
 * Points calculation utility with strict rounding/flooring
 * Business rules:
 * - 2 points per dollar over $100
 * - 1 point per dollar between $50 and $100
 * - 0 points for $50 and under
 */

/**
 * Calculates reward points for a transaction amount
 * All calculations use Math.floor to ensure integer points
 * @param {number} amount - Transaction amount
 * @returns {number} - Calculated points (always an integer)
 */
export function calculatePoints(amount) {
  if (amount < 50) {
    return 0;
  }
  
  let points = 0;
  
  if (amount > 100) {
    // 2 points per dollar over $100
    const dollarsOver100 = Math.floor(amount - 100);
    points += dollarsOver100 * 2;
    // 1 point per dollar for $50-$100 range
    points += 50;
  } else {
    // 1 point per dollar between $50 and $100
    const dollarsInRange = Math.floor(amount - 50);
    points += dollarsInRange;
  }
  
  return points;
}

