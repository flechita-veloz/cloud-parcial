import { Router } from "express";
import { 
  createSaleDetail, 
  getSaleDetails, 
  updateSalesDetail,
  deleteSaleDetail,
} from "../controllers/saleDetailController";

const router = Router();

router.get("/", getSaleDetails); 
router.post("/", createSaleDetail);
router.put("/:saleDetailId", updateSalesDetail);
router.delete("/:saleDetailId", deleteSaleDetail);

export default router;
