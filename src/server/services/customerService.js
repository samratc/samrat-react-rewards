import { getTransactionData } from "../utils/dataLoader.js";
import { filterRecentTransactions } from "../utils/dateUtils.js";
import { calculatePoints } from "../utils/pointsCalculator.js";
import { formatYearMonth } from "../utils/dateUtils.js";
import { ensureCustomerId, ensureTransactionId } from "../utils/uuidGenerator.js";

/**
 * Service for customer-related business logic
 */

/**
 * Gets all customers with their reward points and spending breakdown
 * @param {number} monthsBack - Number of months to look back (default: 3)
 * @returns {Promise<Array>} - Array of customer objects with points data
 */
export async function getCustomerPoints(monthsBack = 3) {
  const { customers, transactions } = await getTransactionData();
  const recentTransactions = filterRecentTransactions(transactions, monthsBack);
  
  return customers.map(customer => {
    const customerId = ensureCustomerId(customer);
    const customerTransactions = recentTransactions.filter(
      transaction => String(transaction.userId) === String(customerId)
    );
    
    const monthlyPoints = {};
    let totalPoints = 0;
    let totalAmountSpent = 0;
    
    customerTransactions.forEach(transaction => {
      const points = calculatePoints(transaction.amount);
      totalPoints += points;
      totalAmountSpent += transaction.amount;
      
      const transactionDate = new Date(transaction.date);
      const yearMonth = formatYearMonth(transactionDate);
      
      monthlyPoints[yearMonth] = monthlyPoints[yearMonth] || {
        points: 0,
        amountSpent: 0,
      };
      
      monthlyPoints[yearMonth].points += points;
      monthlyPoints[yearMonth].amountSpent += transaction.amount;
    });
    
    return {
      customerId: customerId,
      name: customer.name,
      totalPoints,
      totalAmountSpent,
      monthlyPoints,
    };
  });
}

/**
 * Gets detailed transaction history for a specific customer
 * @param {string} customerId - Customer ID to fetch transactions for
 * @param {number} monthsBack - Number of months to look back (default: 3)
 * @returns {Promise<Object>} - Customer data with transactions array
 * @throws {Error} - If customer not found
 */
export async function getCustomerTransactions(customerId, monthsBack = 3) {
  const { customers, transactions } = await getTransactionData();
  const recentTransactions = filterRecentTransactions(transactions, monthsBack);
  
  const customer = customers.find(customer => String(customer.id) === String(customerId));
  if (!customer) {
    throw new Error(`Customer with ID ${customerId} not found`);
  }
  
  const customerTransactions = recentTransactions
    .filter(transaction => String(transaction.userId) === String(customerId))
    .map(transaction => {
      const points = calculatePoints(transaction.amount);
      const transactionId = ensureTransactionId(transaction);
      
      return {
        transactionId,
        amount: transaction.amount,
        date: transaction.date,
        points,
      };
    });
  
  return {
    customerId: ensureCustomerId(customer),
    customerName: customer.name,
    transactions: customerTransactions,
  };
}

/**
 * Gets all transactions with enriched customer information
 * @returns {Promise<Array>} - Array of transactions with points and customer data
 */
export async function getAllTransactions() {
  const { customers, transactions } = await getTransactionData();
  
  const customerLookup = new Map(
    customers.map(customer => [String(customer.id), customer])
  );
  
  return transactions.map(transaction => {
    const customer = customerLookup.get(String(transaction.userId)) || null;
    const points = calculatePoints(transaction.amount);
    const transactionId = ensureTransactionId(transaction);
    
    return {
      ...transaction,
      id: transactionId,
      points,
      customer,
    };
  });
}

