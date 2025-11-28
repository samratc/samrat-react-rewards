import { v4 as uuidv4 } from "uuid";

/**
 * Ensures a transaction has a unique UUID
 * If transaction already has a valid ID, returns it
 * Otherwise generates a new UUID
 * @param {Object} transaction - Transaction object
 * @returns {string} - Unique transaction ID
 */
export function ensureTransactionId(transaction) {
  if (transaction.id && typeof transaction.id === 'string' && transaction.id.length > 0) {
    return transaction.id;
  }
  return uuidv4();
}

/**
 * Ensures a customer has a unique UUID
 * If customer already has a valid ID, returns it
 * Otherwise generates a new UUID
 * @param {Object} customer - Customer object
 * @returns {string} - Unique customer ID
 */
export function ensureCustomerId(customer) {
  if (customer.id && typeof customer.id === 'string' && customer.id.length > 0) {
    return customer.id;
  }
  return uuidv4();
}

