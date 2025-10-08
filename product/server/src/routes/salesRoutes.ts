import { Router } from "express";
import { 
    createSale, 
    getSales, 
    getSaleById, 
    updateSale,
    deleteSale,
} from "../controllers/salesController";

const router = Router();

router.get("/:saleId", getSaleById); 
router.get("/", getSales);
router.post("/", createSale);
router.put("/:saleId", updateSale);
router.delete("/:saleId", deleteSale);

export default router;
