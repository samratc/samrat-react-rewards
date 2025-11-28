import express from "express";
import * as customerController from "../controllers/customerController.js";

const router = express.Router();

router.get("/customer-points", customerController.getCustomerPoints);
router.get("/customer-transactions/:customerId", customerController.getCustomerTransactions);
router.get("/transactions", customerController.getAllTransactions);

export default router;

