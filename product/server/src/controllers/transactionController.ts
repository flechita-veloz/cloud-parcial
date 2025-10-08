import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getTransactions = async (req: Request, res: Response) => {
  try {
    const transactions = await prisma.transactions.findMany({
      include: {
        user: {
          select: {
            username: true,
          }
        }
      }
    });
    res.json(transactions);
  } catch (error) {
    console.error("Error obteniendo transacciones:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const getTransactionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { transactionId } = req.params;

    if (!transactionId) {
      res.status(400).json({ message: "ID de transacción es requerido" });
      return;
    }

    const transaction = await prisma.transactions.findUnique({
      where: { transactionId },
      include: {
        user: {
          select: {
            username: true,
          }
        }
      }
    });

    if (!transaction) {
      res.status(404).json({ message: "Transacción no encontrada" });
      return;
    }

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: "Error al recuperar transacción" });
  }
};

export const getTransactionsBySale = async (req: Request, res: Response) => {
  const { saleId } = req.params;
  try {
    const transactions = await prisma.transactions.findMany({
      where: { saleId },
    });
    res.json(transactions);
  } catch (error) {
    console.error("Error obteniendo transacciones de la venta:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const createTransaction = async (req: Request, res: Response) => {
  try {
    const { saleId, purchaseId, loanId, expenseId, origin, userId, type, description, date, paymentMethod, amount } = req.body;
    console.log(req.body);
    const data: any = {
      type,
      description,
      date: new Date(date),
      paymentMethod,
      amount,
      origin,
      user: { connect: { userId } },
    };

    if (purchaseId) {
      data.purchase = { connect: { purchaseId } };
    } else if (saleId) {
      data.sale = { connect: { saleId } };
    } else if (loanId) {
      data.loan = { connect: { loanId } };
    } else if (expenseId) {
      data.expense = { connect: { expenseId } };
    }

    const newTransaction = await prisma.transactions.create({ data });
    res.status(201).json(newTransaction);
  } catch (error) {
    console.error("Error creando transacción:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const updateTransaction = async (req: Request, res: Response) => {
  const { transactionId } = req.params;
  const { origin, description, type, date, paymentMethod, amount } = req.body;

  try {
    const data: any = {
      type,
      description,
      date: new Date(date),
      paymentMethod,
      amount,
      origin,
    };

    const updatedTransaction = await prisma.transactions.update({
      where: { transactionId },
      data,
    });

    res.json(updatedTransaction);
  } catch (error) {
    console.error("Error actualizando transacción:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};


export const deleteTransaction = async (req: Request, res: Response) => {
  const { transactionId } = req.params;
  try {
    await prisma.transactions.delete({ where: { transactionId } });
    res.json({ message: "Transacción eliminada correctamente" });
  } catch (error) {
    console.error("Error eliminando transacción:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
