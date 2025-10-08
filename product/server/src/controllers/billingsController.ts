import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { 
  handleError, 
  getSunatSuggestedNumber, 
  sendBillToSunat, 
  buildBillingRequest, 
  generateFileName 
} from "../utils/utilsBilling";

const prisma = new PrismaClient();

// Constants
const SUNAT_API = {
  LAST_DOCUMENT_URL: "https://back.apisunat.com/personas/lastDocument",
  SEND_BILL_URL: "https://back.apisunat.com/personas/v1/sendBill",
  PERSONA_ID: process.env.PERSONA_ID,
  PERSONA_TOKEN: process.env.PERSONA_TOKEN,
  RUC: process.env.RUC
};

// Main endpoints
export const getBillings = async (req: Request, res: Response): Promise<void> => {
  try {
    const billings = await prisma.billings.findMany();
    res.status(200).json(billings);
  } catch (error) {
    handleError(res, "Error al obtener las facturaciones", error);
  }
};

export const getLastBillingNumber = async (req: Request, res: Response): Promise<void> => {
  try {
    const lastBilling = await prisma.billings.findFirst({
      orderBy: { number: "desc" },
      select: { number: true },
    });

    const lastNumber = lastBilling ? lastBilling.number : 0;
    res.json({ number: lastNumber });
  } catch (error) {
    handleError(res, "Error al obtener el último número de facturación", error);
  }
};

export const createBilling = async (req: Request, res: Response): Promise<void> => {
  try {
    const { saleId, type, number } = req.body;
    
    const sunatResponse = await getSunatSuggestedNumber(type);
    const suggestedNumber = sunatResponse.data.suggestedNumber;

    const jsonQuery = await buildBillingRequest(saleId, suggestedNumber, type);
    const sunatBillingResponse = await sendBillToSunat(jsonQuery);

    const idSunat = sunatBillingResponse.data.documentId;
    const fileNameSunat = generateFileName(type, suggestedNumber);

    const lastBilling = await prisma.billings.findFirst({
      orderBy: { number: "desc" },
    });

    const nextNumber = lastBilling ? lastBilling.number + 1 : 1;

    const billing = await prisma.billings.create({
      data: {
        saleId,
        type,
        state: sunatBillingResponse.status === 200 ? "ACEPTADO" : "PENDIENTE",
        number: nextNumber,
        idSunat,
        fileNameSunat,
      },
    });

    res.status(201).json(billing);
  } catch (error) {
    handleError(res, "Error al crear la facturación", error);
  }
};

export const updateBilling = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { state } = req.body;

    if (!state) {
      res.status(400).json({ message: "El estado es requerido" });
      return;
    }

    const existingBilling = await prisma.billings.findUnique({
      where: { billingId: id },
    });

    if (!existingBilling) {
      res.status(404).json({ message: "Facturación no encontrada" });
      return;
    }

    const updatedBilling = await prisma.billings.update({
      where: { billingId: id },
      data: { state },
    });

    res.status(200).json(updatedBilling);
  } catch (error) {
    handleError(res, "Error al actualizar la facturación", error);
  }
};

