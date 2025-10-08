import { Router } from "express";
import { 
  createExpense, 
  getExpenses, 
  getExpenseById,
  updateExpense, 
  deleteExpense
} from "../controllers/expenseController";

const router = Router();

router.get("/", getExpenses);
router.get("/:expenseId", getExpenseById);
router.post("/", createExpense);
router.put("/:expenseId", updateExpense);
router.delete("/:expenseId", deleteExpense);

export default router;
