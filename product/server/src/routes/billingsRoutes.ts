import { Router } from "express";
import { 
  createBilling, 
  getBillings, 
  getLastBillingNumber
} from "../controllers/billingsController";

const router = Router();

router.get("/last-billing-number", getLastBillingNumber);
router.get("/", getBillings);
router.post("/", createBilling);


export default router;
