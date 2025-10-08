import { Router } from "express";
import { 
    createLoan, 
    getLoans, 
    getLoanById, 
    updateLoan,
} from "../controllers/loansController";

const router = Router();

router.get("/:loanId", getLoanById); 
router.get("/", getLoans);
router.post("/", createLoan);
router.put("/:loanId", updateLoan);


export default router;
