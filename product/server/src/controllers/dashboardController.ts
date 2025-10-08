import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

export const getDashboardMetrics = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    console.log("yara");
    const { startDate, endDate } = req.query;
    
    const dateFilter =
      startDate && endDate
        ? {
            date: {
              gte: new Date(startDate as string),
              lte: new Date(endDate as string),
            },
          }
        : {};
    
    /* SALES SUMMARY */
    const groupedSales = await prisma.sales.groupBy({
      by: ["date"],
      _sum: { totalAmount: true },
      where: dateFilter,
      orderBy: { date: "asc" },
    });

    let previousValue = 0;

    const salesSummary = groupedSales.map((s, index) => {
      const totalSold = s._sum.totalAmount ?? 0;
      const changePercentage =
        index === 0 || previousValue === 0
          ? 0
          : ((totalSold - previousValue) / previousValue) * 100;

      previousValue = totalSold;

      return {
        totalSold,
        changePercentage,
        date: s.date.toISOString().split("T")[0],
      };
    });

    /* PURCHASES SUMMARY */
    const groupedPurchases = await prisma.purchases.groupBy({
      by: ["date"],
      _sum: { totalAmount: true },
      where: dateFilter,
      orderBy: { date: "asc" },
    });

    let previousPurchaseValue = 0;

    const purchaseSummary = groupedPurchases.map((p, index) => {
      const totalPurchased = p._sum.totalAmount ?? 0;
      const changePercentage =
        index === 0 || previousPurchaseValue === 0
          ? 0
          : ((totalPurchased - previousPurchaseValue) / previousPurchaseValue) * 100;

      previousPurchaseValue = totalPurchased;

      return {
        totalPurchased,
        changePercentage,
        date: p.date.toISOString().split("T")[0],
      };
    });

    /* LOAN SUMMARY */
    const groupedLoans = await prisma.loans.groupBy({
      by: ["date", "state"],
      _sum: {
        totalLoanedReturned: true,
        totalLoanedUnreturned: true,
        totalSold: true,
      },
      where: dateFilter,
      orderBy: { date: "asc" },
    });

    const loanSummary = groupedLoans.map((l) => ({
      totalLoanedReturned: l._sum.totalLoanedReturned ?? 0,
      totalLoanedUnreturned: l._sum.totalLoanedUnreturned ?? 0,
      totalSold: l._sum.totalSold ?? 0,
      date: l.date.toISOString().split("T")[0],
    }));
    
    /* EXPENSE AND TRANSACTION SUMMARY */
    const currentPeriodFilter = dateFilter;

    let previousPeriodFilter = {};
    if (startDate && endDate) {
      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
      const diff = end.getTime() - start.getTime();
      const previousStart = new Date(start.getTime() - diff);
      const previousEnd = new Date(start.getTime());
      previousPeriodFilter = {
        date: {
          gte: previousStart,
          lte: previousEnd,
        },
      };
    }

    /* EXPENSES SUMMARY WITH AVERAGE CHANGE */
    const groupedExpenses = await prisma.transactions.groupBy({
      by: ["date"],
      _sum: { amount: true },
      where: { ...currentPeriodFilter, origin: "Gasto" },
      orderBy: { date: "asc" },
    });

    let previousExpense = 0;
    const expenseSummaryArray = groupedExpenses.map((e) => {
      const totalExpense = e._sum.amount ?? 0;
      const changePercentage = previousExpense === 0 ? 0 : ((totalExpense - previousExpense) / previousExpense) * 100;
      previousExpense = totalExpense;
      return { totalExpense, changePercentage, date: e.date.toISOString().split("T")[0] };
    });

    const averageExpenseChange =
      expenseSummaryArray.reduce((acc, curr, _, arr) => acc + curr.changePercentage / arr.length, 0) || 0;

    // DEPOSITS
    const groupedDeposits = await prisma.transactions.groupBy({
      by: ["date"],
      _sum: { amount: true },
      where: { ...currentPeriodFilter, origin: "Transacción", type: "Depósito" },
      orderBy: { date: "asc" },
    });

    let previousDeposit = 0;
    const depositArray = groupedDeposits.map((d) => {
      const total = d._sum.amount ?? 0;
      const changePercentage = previousDeposit === 0 ? 0 : ((total - previousDeposit) / previousDeposit) * 100;
      previousDeposit = total;
      return { total, changePercentage, date: d.date.toISOString().split("T")[0] };
    });

    const averageDepositChange =
      depositArray.reduce((acc, curr, _, arr) => acc + curr.changePercentage / arr.length, 0) || 0;

    // WITHDRAWALS
    const groupedWithdrawals = await prisma.transactions.groupBy({
      by: ["date"],
      _sum: { amount: true },
      where: { ...currentPeriodFilter, origin: "Transacción", type: "Retiro" },
      orderBy: { date: "asc" },
    });

    let previousWithdrawal = 0;
    const withdrawalArray = groupedWithdrawals.map((w) => {
      const total = w._sum.amount ?? 0;
      const changePercentage = previousWithdrawal === 0 ? 0 : ((total - previousWithdrawal) / previousWithdrawal) * 100;
      previousWithdrawal = total;
      return { total, changePercentage, date: w.date.toISOString().split("T")[0] };
    });

    const averageWithdrawalChange =
      withdrawalArray.reduce((acc, curr, _, arr) => acc + curr.changePercentage / arr.length, 0) || 0;

    // console.log(totalExpenseCurrent._sum.amount);
    res.json({
      salesSummary,
      purchaseSummary,
      loanSummary,
      expenseSummary: {
        totalExpense: expenseSummaryArray.reduce((acc, e) => acc + e.totalExpense, 0),
        changePercentage: averageExpenseChange,
      },
      transactionSummary: {
        deposit: {
          total: depositArray.reduce((acc, d) => acc + d.total, 0),
          changePercentage: averageDepositChange,
        },
        withdrawal: {
          total: withdrawalArray.reduce((acc, w) => acc + w.total, 0),
          changePercentage: averageWithdrawalChange,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving dashboard metrics" });
  }
};
