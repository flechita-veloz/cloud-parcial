import express, { Router, Request, Response } from "express";
import { verifyWebhook, receiveMessage, sendWhatsAppMessage } from "../controllers/whatsappController";


const router: express.Router = Router();

router.get("/", verifyWebhook);
router.post("/", receiveMessage);
router.post("/send", sendWhatsAppMessage);
export default router;
