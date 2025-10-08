import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getSales = async (req: Request, res: Response): Promise<void> => {
  try {
    const sales = await prisma.sales.findMany({
      include: {
        client: true,
        user: true,
        saleDetails: {
          include: {
            product: true,
          },
        },
        transactions: true,
        billing: true,
      },
    });
    res.json(sales);
  } catch (error) {
    console.error("Error retrieving sales:", error);
    res.status(500).json({ message: "Error retrieving sales" });
  }
};

export const getSaleById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { saleId } = req.params;

    if (!saleId) {
      res.status(400).json({ message: "Sale ID is required" });
      return;
    }

    const sale = await prisma.sales.findUnique({
      where: { saleId },
      include: {
        client: {
          include: {
            document: true,
          }
        },
        user: true,
        saleDetails: {
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
        billing: true,
      },
    });

    if (!sale) {
      res.status(404).json({ message: "Sale not found" });
      return;
    }

    res.json(sale);
  } catch (error) {
    console.error("Error retrieving sale by ID:", error);
    res.status(500).json({ message: "Error retrieving sale" });
  }
};

export const createSale = async (req: Request, res: Response) => {
  try {
    const { totalAmount, date, userId, clientId, state, discount, isPercentageDiscount } = req.body;

    const lastSale = await prisma.sales.findFirst({
      orderBy: { number: "desc" },
    });

    const nextNumber = lastSale ? lastSale.number + 1 : 1;

    const newSale = await prisma.sales.create({
      data: {
        totalAmount,
        date: new Date(date),
        number: nextNumber,
        discount,
        isPercentageDiscount,
        state,
        user: { connect: { userId } },
        client: { connect: { clientId } },
      },
    });

    res.status(201).json(newSale);
  } catch (error) {
    console.error("Error creating sale:", error);
    res.status(500).json({ message: "Error creating sale" });
  }
};

export const updateSale = async (req: Request, res: Response) => {
  try {
    const { saleId } = req.params;
    const { date, totalAmount, clientId, state, discount, isPercentageDiscount } = req.body;

    const updatedSale = await prisma.sales.update({
      where: { saleId },
      data: {
        date: new Date(date),
        totalAmount,
        discount,
        isPercentageDiscount,
        state,
        client: { connect: { clientId } }
      },
    });

    res.json(updatedSale);
  } catch (error) {
    console.error("Error updating sale:", error);
    res.status(500).json({ message: "Error updating sale" });
  }
};

export const deleteSale = async (req: Request, res: Response): Promise<void> => {
  try {
    const { saleId } = req.params;

    if (!saleId) {
      res.status(400).json({ message: "Sale ID is required" });
      return;
    }

    await prisma.sales.delete({
      where: { saleId },
    });

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting sale:", error);
    res.status(500).json({ message: "Error deleting sale" });
  }
};
