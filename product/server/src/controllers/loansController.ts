import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

 
export const getLoans = async (req: Request, res: Response): Promise<void> => {
  try {
    const loans = await prisma.loans.findMany({
      include: {
        client: true,
        user: true,
        loanDetails: {
          include: {
            product: true,
          },
        },
        transactions: true,
      },
    });
    res.json(loans);
  } catch (error) {
    console.error("Error retrieving loans:", error);
    res.status(500).json({ message: "Error retrieving loans" });
  }
};

export const getLoanById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { loanId } = req.params;

    if (!loanId) {
      res.status(400).json({ message: "Loan ID is required" });
      return;
    }

    const loan = await prisma.loans.findUnique({
      where: { loanId },
      include: {
        client: {
          include: {
            document: true,
          }
        },
        user: true,
        transactions: true,
        loanDetails: {
          include: {
            product: {
              select: {
                productId: true, 
                stockQuantity: true,
              }
            }
          },
        },
      },
    });

    if (!loan) {
      res.status(404).json({ message: "Loan not found" });
      return;
    }

    res.json(loan);
  } catch (error) {
    console.error("Error retrieving loan by ID:", error);
    res.status(500).json({ message: "Error retrieving loan" });
  }
};

export const createLoan = async (req: Request, res: Response) => {
  try {
    const { totalAmount, totalLoanedReturned, totalLoanedUnreturned,totalSold , date, userId, clientId, state } = req.body;

    // Get the last loan number to generate the next one
    const lastLoan = await prisma.loans.findFirst({
      orderBy: { number: "desc" },
    });

    const nextNumber = lastLoan ? lastLoan.number + 1 : 1;

    const newLoan = await prisma.loans.create({
      data: {
        date: new Date(date),
        number: nextNumber,
        state: state,
        totalLoanedReturned,
        totalLoanedUnreturned,
        totalSold,    
        totalAmount,
        user: { connect: { userId } },
        client: { connect: { clientId } },
      },
    });

    res.status(201).json(newLoan);
  } catch (error) {
    console.error("Error creating loan:", error);
    res.status(500).json({ message: "Error creating loan" });
  }
};

export const updateLoan = async (req: Request, res: Response) => {
  try {
    const { loanId } = req.params;
    const { totalAmount, totalLoanedReturned, totalLoanedUnreturned,totalSold, clientId, date, state } = req.body;

    const updatedLoan = await prisma.loans.update({
      where: { loanId },
      data: {
        date: new Date(date),
        totalLoanedReturned,
        totalLoanedUnreturned,
        totalSold,  
        state,
        totalAmount,
        client: { connect: { clientId } }
      },
    });

    res.json(updatedLoan);
  } catch (error) {
    console.error("Error updating loan:", error);
    res.status(500).json({ message: "Error updating loan" });
  }
};
