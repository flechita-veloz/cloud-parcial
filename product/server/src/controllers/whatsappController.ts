import { Request, Response } from "express";
import axios from "axios";
const WHATSAPP_API_URL = "https://graph.facebook.com/v22.0";
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

export const verifyWebhook = async (req: Request, res: Response): Promise<void> => {
    try {
        const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;
        const mode = req.query["hub.mode"];
        const token = req.query["hub.verify_token"];
        const challenge = req.query["hub.challenge"];

        if (mode === "subscribe" && token === verifyToken) {
            console.log("Webhook verificado correctamente.");
            res.status(200).send(challenge);
        } else {
            res.status(403).send("Verificación fallida");
        }
    } catch (error) {
        console.error("Error en verifyWebhook:", error);
        res.status(500).send("Error interno del servidor");
    }
};

export const receiveMessage = async (req: Request, res: Response): Promise<void> => {
    try {
        console.log("Mensaje recibido:", JSON.stringify(req.body, null, 2));
        res.sendStatus(200);
    } catch (error) {
        console.error("Error en receiveMessage:", error);
        res.sendStatus(500);
    }
};
export const sendWhatsAppMessage = async (req: Request, res: Response): Promise<void> => {
    const { phoneNumber, importe, url } = req.body;
    const direccion = process.env.EMPRESA_DIRECTION || "Nuestra dirección"; // Fallback por si no está configurado
    
    // Validación de parámetros requeridos
    if (!phoneNumber || !importe || !url) {
        res.status(400).json({ 
            error: "Faltan parámetros requeridos",
            details: {
                phoneNumber: !phoneNumber ? "Falta el número de WhatsApp" : undefined,
                importe: !importe ? "Falta el importe de la compra" : undefined,
                url: !url ? "Falta la URL del PDF" : undefined
            }
        });
        return;
    }

    try {
        const response = await axios.post(
            `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
            {
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: phoneNumber,
                type: "template",
                template: {
                    name: "recibo_de_venta",  // Nombre del template aprobado en Meta
                    language: { code: "es" },  // Idioma español
                    components: [
                        {
                            type: "header",
                            parameters: [
                                {
                                    type: "document",
                                    document: {
                                        filename: "recibo_de_venta.pdf",
                                        link: url  // Usamos la URL recibida del frontend
                                    }
                                }
                            ]
                        },
                        {
                            type: "body",
                            parameters: [
                                { type: "text", text: "S/."+ importe.toString() },  // {{1}} importe
                                { type: "text", text: direccion },           // {{2}} dirección
                                { type: "text", text: "Recibo" }    // {{3}} texto (puedes hacerlo dinámico si lo necesitas)
                            ]
                        }
                    ]
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${ACCESS_TOKEN}`,
                    "Content-Type": "application/json"
                }
            }
        );

        console.log("Mensaje enviado:", response.data);
        res.json({ success: true, data: response.data });
    } catch (error: any) {
        console.error("Error enviando mensaje de WhatsApp:", error.response?.data || error.message);
        res.status(500).json({ 
            error: "Error al enviar mensaje de WhatsApp", 
            details: error.response?.data || error.message 
        });
    }
};