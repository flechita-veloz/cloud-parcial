import { Router } from "express";
import { 
  createTransaction, 
  getTransactions, 
  getTransactionById,
  getTransactionsBySale, 
  updateTransaction, 
  deleteTransaction
} from "../controllers/transactionController";

const router = Router();

router.get("/", getTransactions);
router.get("/:transactionId", getTransactionById);
router.get("/:saleId", getTransactionsBySale);
router.post("/", createTransaction);
router.put("/:transactionId", updateTransaction);
router.delete("/:transactionId", deleteTransaction);

export default router;