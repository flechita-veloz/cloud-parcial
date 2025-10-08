import { Router } from "express";
import { 
    createProduct, 
    getProducts, 
    getSalesByProductId,
    searchProducts, 
    deleteProducts, 
    getProductById,
    updateProduct
} from "../controllers/productController";

const router = Router();

// IMPORTANTE: importa el orden de las rutas
router.get("/", getProducts);
router.get("/search", searchProducts);
router.get("/:productId", getProductById);
router.get("/sales/:productId", getSalesByProductId);
router.post("/", createProduct);
router.delete("/", deleteProducts);
router.put("/:productId", updateProduct);

export default router;
