import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getExpenses = async (req: Request, res: Response) => {
  try {
    const expenses = await prisma.expenses.findMany({
      include: {
        transaction: true,
        user: true,
      }
    });
    res.json(expenses);
  } catch (error) {
    console.error("Error obteniendo gastos:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const getExpenseById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { expenseId } = req.params;

    if (!expenseId) {
      res.status(400).json({ message: "ID de gasto es requerido" });
      return;
    }

    const expense = await prisma.expenses.findUnique({
      where: { expenseId },
      include: {
        transaction: true,
        user: true,
      }
    });

    if (!expense) {
      res.status(404).json({ message: "Gasto no encontrado" });
      return;
    }

    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: "Error al recuperar gasto" });
  }
};


export const createExpense = async (req: Request, res: Response) => {
  try {
    const { userId, hasVoucher, companyName, RUC, billingNumber, billingType} = req.body;
    const data: any = {
      hasVoucher,
      companyName,
      RUC,
      billingNumber, 
      billingType,
      user: { connect: {userId } },
    };

    const newExpense = await prisma.expenses.create({ data });
    res.status(201).json(newExpense);
  } catch (error) {
    console.error("Error creando gasto:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const updateExpense = async (req: Request, res: Response) => {
  const { expenseId } = req.params;
  const { hasVoucher, companyName, RUC, billingNumber, billingType} = req.body;

  try {
    const data: any = {
      hasVoucher,
      companyName,
      RUC,
      billingNumber, 
      billingType,
    };

    const updatedExpense = await prisma.expenses.update({
      where: { expenseId },
      data,
    });

    res.json(updatedExpense);
  } catch (error) {
    console.error("Error actualizando gasto:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};


export const deleteExpense = async (req: Request, res: Response) => {
  const { expenseId } = req.params;
  try {
    await prisma.expenses.delete({ where: { expenseId } });
    res.json({ message: "Gasto eliminado correctamente" });
  } catch (error) {
    console.error("Error eliminando gasto:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
