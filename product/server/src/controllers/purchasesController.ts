import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getPurchases = async (req: Request, res: Response): Promise<void> => {
  try {
    const purchases = await prisma.purchases.findMany({
      include: {
        supplier: true,
        user: true,
        purchaseDetails: {
          include: {
            product: true,
          },
        },
        transactions: true,
      },
    });
    res.json(purchases);
  } catch (error) {
    console.error("Error al recuperar compras", error);
    res.status(500).json({ message: "Error al recuperar compras" });
  }
};

export const getPurchaseById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { purchaseId } = req.params;

    if (!purchaseId) {
      res.status(400).json({ message: "El ID de compra requerido" });
      return;
    }

    const purchase = await prisma.purchases.findUnique({
      where: { purchaseId },
      include: {
        supplier: true,
        user: true,
        purchaseDetails: {
          include: {
            product: {
              select: {
                productId: true, 
                stockQuantity: true,
              }
            }
          },
        },
        transactions: true,
      },
    });

    if (!purchase) {
      res.status(404).json({ message: "Compra no encontrada" });
      return;
    }

    res.json(purchase);
  } catch (error) {
    console.error("Error al recuperar compra por ID:", error);
    res.status(500).json({ message: "Error al recuperar compra por ID:" });
  }
};

export const createPurchase = async (req: Request, res: Response) => {
  try {
    const { totalAmount, shipping, billingNumber, billingType, date, userId, state, discount, isPercentageDiscount, supplierId } = req.body;

    const lastPurchase = await prisma.loans.findFirst({
      orderBy: { number: "desc" },
    });

    const nextNumber = lastPurchase ? lastPurchase.number + 1 : 1;

    const newPurchase = await prisma.purchases.create({
      data: {
        totalAmount,
        date: new Date(date),
        number: nextNumber,
        discount,
        isPercentageDiscount,
        state,
        shipping,
        billingNumber,
        billingType,
        user: { connect: { userId: userId } }, 
        supplier: { connect: { clientId: supplierId } }, 
      },
    });

    res.status(201).json(newPurchase);
  } catch (error) {
    console.error("Error al crear la compra:", error);
    res.status(500).json({ message: "Error al crear la compra" });
  }
};

export const updatePurchase = async (req: Request, res: Response) => {
  try {
    const { purchaseId } = req.params;
    const { date, totalAmount, billingNumber, billingType, shipping, supplierId, state, discount, isPercentageDiscount } = req.body;

    const updatedPurchase = await prisma.purchases.update({
      where: { purchaseId },
      data: {
        date: new Date(date),
        totalAmount,
        shipping,
        billingNumber,
        billingType,
        discount,
        isPercentageDiscount,
        state,
        supplier: { connect: { clientId: supplierId } }, 
      },
    });

    res.json(updatedPurchase);
  } catch (error) {
    console.error("Error al actualizar compra:", error);
    res.status(500).json({ message: "Error al actualizar compra" });
  }
};

