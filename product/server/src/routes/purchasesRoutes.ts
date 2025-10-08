import { Router } from "express";
import { 
    createPurchase, 
    getPurchases, 
    getPurchaseById, 
    updatePurchase,
} from "../controllers/purchasesController";

const router = Router();

router.get("/:purchaseId", getPurchaseById); 
router.get("/", getPurchases);
router.post("/", createPurchase);
router.put("/:purchaseId", updatePurchase);



export default router;
