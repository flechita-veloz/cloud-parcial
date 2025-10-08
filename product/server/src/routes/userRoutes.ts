import express, { Router, Request, Response } from "express";
import { 
    getUsers, 
    getUserById,
    updateUser,
    deleteUser,
    createUser,
    enviarCorreo 
} from "../controllers/userController";

const router: express.Router = Router();

router.get("/", getUsers);
router.get("/:userId", getUserById);
router.post("/enviar-correo", enviarCorreo);
router.post("/", createUser);
router.put("/:userId", updateUser);
router.delete("/:userId", deleteUser);

export default router;