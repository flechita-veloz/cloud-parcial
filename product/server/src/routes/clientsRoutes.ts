import { Router } from "express";
import { 
    createClient, 
    getClients,
    searchClients,
    getClientById,
    deleteClient,
    updateClient
} from "../controllers/clientsController";

const router = Router();

// IMPORTANTE: importa el orden de las rutas
router.get("/", getClients);
router.get("/search", searchClients);
router.get("/:clientId", getClientById);
router.post("/", createClient);
router.delete("/:clientId", deleteClient);
router.put("/:clientId", updateClient);

export default router;
