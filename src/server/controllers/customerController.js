import * as customerService from "../services/customerService.js";

/**
 * Controller for customer-related API endpoints
 */

/**
 * GET /api/customer-points handler
 */
export async function getCustomerPoints(req, res) {
  try {
    const customerPoints = await customerService.getCustomerPoints(3);
    res.json({ success: true, data: customerPoints });
  } catch (error) {
    console.error("Error fetching customer points:", error);
    res.status(500).json({
      success: false,
      message: "Error processing request",
      error: error.message,
    });
  }
}

/**
 * GET /api/customer-transactions/:customerId handler
 */
export async function getCustomerTransactions(req, res) {
  try {
    const { customerId } = req.params;
    const customerData = await customerService.getCustomerTransactions(customerId, 3);
    res.json({ success: true, data: customerData });
  } catch (error) {
    if (error.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    console.error("Error fetching customer transactions:", error);
    res.status(500).json({
      success: false,
      message: "Error processing request",
      error: error.message,
    });
  }
}

/**
 * GET /api/transactions handler
 */
export async function getAllTransactions(req, res) {
  try {
    const transactions = await customerService.getAllTransactions();
    res.json({
      success: true,
      data: transactions,
      meta: { count: transactions.length },
    });
  } catch (error) {
    console.error("Error fetching all transactions:", error);
    res.status(500).json({
      success: false,
      message: "Error processing request",
      error: error.message,
    });
  }
}

