// hooks/useLoanSubmission.ts
import { useState } from "react";
import { useCreateLoanMutation, useCreateSalesDetailMutation, Transaction,
          Product, Client, useDeleteSaleDetailMutation, useUpdateLoanMutation,
          useUpdateSalesDetailMutation, 
          Loan, useCreateTransactionMutation, useUpdateTransactionMutation, 
          useDeleteTransactionMutation} from "@/state/api";
import { mergeDateWithCurrentTime } from "@/app/utils/date";

type DetailProduct = Product & {quantity: number, saleDetailId: string, status: string};

type LoanSubmissionResult = {
  handleSave: (args: {
    client: Client | null;
    date: string;
    loan: Loan | null;
    totalLoanedReturned: number;
    totalLoanedUnreturned: number;
    totalSold: number;
    loanedProducts: DetailProduct[];
    soldProducts: DetailProduct[];
    transactions: Partial<Transaction>[];
    prevSaleDetailIds: string[];
    prevTransactionIds: string[];
  }) => Promise<void>;
  lastLoanNumber: number;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  isSaving: boolean;
};

export function useLoanSubmission(): LoanSubmissionResult {
  const [createLoan] = useCreateLoanMutation();
  const [updateLoan] = useUpdateLoanMutation();
  const [deleteTransaction] = useDeleteTransactionMutation();
  const [createLoanDetail] = useCreateSalesDetailMutation();
  const [updateSalesDetail] = useUpdateSalesDetailMutation();
  const [deleteSaleDetail] = useDeleteSaleDetailMutation();
  const [createTransaction] = useCreateTransactionMutation();
  const [updateTransaction] = useUpdateTransactionMutation();
  const [lastLoanNumber, setLastLoanNumber] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const processLoan = async (loan: Loan | null, clientId: string, date: string, totalLoanedReturned: number, totalLoanedUnreturned: number, totalSold: number) => {
    if (loan) {
      const updatedLoan = {
        totalLoanedReturned: totalLoanedReturned,
        totalLoanedUnreturned: totalLoanedUnreturned,
        totalSold: totalSold,
        totalAmount: totalSold + totalLoanedUnreturned + totalLoanedReturned,
        state: totalLoanedUnreturned != 0 ? "POR DEVOLVER" : "DEVUELTO",
        date: mergeDateWithCurrentTime(date),
        clientId,
      };
      await updateLoan({ loanId: loan.loanId, data: updatedLoan }).unwrap();
      return loan;
    } else {
      const createdLoan = await createLoan({
        totalLoanedReturned: totalLoanedReturned,
        totalLoanedUnreturned: totalLoanedUnreturned,
        totalSold: totalSold,
        totalAmount: totalSold + totalLoanedUnreturned + totalLoanedReturned,
        state: totalLoanedUnreturned != 0 ? "POR DEVOLVER" : "DEVUELTO",
        clientId,
        userId: "u1",
        date: mergeDateWithCurrentTime(date),
      }).unwrap();
      return createdLoan;
    }
  };

  const syncLoanDetails = async (
    loanId: string,
    loanedProducts: DetailProduct[],
    soldProducts: DetailProduct[],
    createLoanDetail: ReturnType<typeof useCreateSalesDetailMutation>[0],
    updateSalesDetail: ReturnType<typeof useUpdateSalesDetailMutation>[0],
    prevSaleDetailIds: string[],
  ) => {
    const currIds = new Set<string>();
    
    const allProducts = [...loanedProducts, ...soldProducts];
    for (const item of allProducts) {
      try {
        if (!prevSaleDetailIds.includes(item.saleDetailId)) {
          await createLoanDetail({
            quantity: item.quantity,
            unitPrice: item.price,
            loanId,
            valueTax: item.valueTax,
            typeTax: item.typeTax,
            nameProduct: item.name,
            codeProduct: item.code,
            productId: item.productId,
            status: item.status as "POR_DEVOLVER" | "DEVUELTO" | "VENDIDO",
          }).unwrap();
        } else {
          await updateSalesDetail({
            saleDetailId: item.saleDetailId,
            data: {
              quantity: item.quantity,
              unitPrice: item.price,
              valueTax: item.valueTax,
              typeTax: item.typeTax,
              nameProduct: item.name,
              status: item.status as "POR_DEVOLVER" | "DEVUELTO" | "VENDIDO",
            },
          }).unwrap();
          currIds.add(item.saleDetailId);
        }
      } catch (error) {
        console.error("Error al procesar detalle de pase", error);
      }
    }
    return currIds;
  };

  const syncTransaction = async (
    loanId: string,
    number: number,
    transactions: Partial<Transaction>[],
    createTransaction: ReturnType<typeof useCreateTransactionMutation>[0],
    updateTransaction: ReturnType<typeof useUpdateTransactionMutation>[0],
    deleteTransaction: ReturnType<typeof useDeleteTransactionMutation>[0],
    prevTransactionIds: string[],
  ) => {
    try {
      const currIds = new Set<string>();

      for (const item of transactions) {
        if (!item.transactionId || item.transactionId === "") {
          await createTransaction({
            loanId,
            userId: "u1",
            type: "Depósito",
            description: `Pago de pase #${number ?? ""}`,
            date: mergeDateWithCurrentTime(item.date!),
            paymentMethod: item.paymentMethod!,
            amount: item.amount!,
            origin: "Pago de pase",
          }).unwrap();
        } else {
          await updateTransaction({
            transactionId: item.transactionId,
            data: {
              date: mergeDateWithCurrentTime(item.date!),
              paymentMethod: item.paymentMethod!,
              amount: item.amount!,
            },
          }).unwrap();
          currIds.add(item.transactionId);
        }
      }
      await deleteUnusedTransactions(prevTransactionIds, currIds, deleteTransaction);
    } catch (error) {
      console.error("Error al crear o actualizar transacción del pase", error);
    }
  };

  const deleteUnusedTransactions = async (
    prevIds: string[],
    currIds: Set<string>,
    deleteTransaction: ReturnType<typeof useDeleteTransactionMutation>[0]
  ) => {
    for (const id of prevIds) {
      if (!currIds.has(id)) {
        try {
          await deleteTransaction(id);
        } catch (error) {
          console.error("Error al eliminar la transacción del pase", error);
        }
      }
    }
  };

  const deleteUnusedDetails = async (
    prevIds: string[],
    currIds: Set<string>,
    deleteSaleDetail: ReturnType<typeof useDeleteSaleDetailMutation>[0]
  ) => {
    for (const id of prevIds) {
      if (!currIds.has(id)) {
        try {
          await deleteSaleDetail(id);
        } catch (error) {
          console.error("Error al eliminar el detalle del pase", error);
        }
      }
    }
  };

  const handleSave = async ({
    client,
    date,
    loan,
    totalLoanedReturned,
    totalLoanedUnreturned,
    totalSold,
    loanedProducts,
    soldProducts,
    transactions,
    prevTransactionIds,
    prevSaleDetailIds,
  }: {
    client: Client | null;
    date: string;
    loan: Loan | null;
    totalLoanedReturned: number;
     totalLoanedUnreturned: number;
    totalSold: number;
    loanedProducts: DetailProduct[];
    soldProducts: DetailProduct[];
    transactions: Partial<Transaction>[];
    prevSaleDetailIds: string[];
    prevTransactionIds: string[];
  }) => {
    if (!client) return alert("Seleccione un cliente antes de guardar el pase.");
    if (loanedProducts.length === 0) return alert("Seleccione al menos un producto.");

    try {
      setIsSaving(true);
      const savedLoan = await processLoan(loan, client.clientId, date, totalLoanedReturned, totalLoanedUnreturned, totalSold);
      setLastLoanNumber(savedLoan.number);

      await syncTransaction(savedLoan.loanId, loan?.sale?.number ?? 0, transactions, createTransaction, updateTransaction, deleteTransaction, prevTransactionIds);
      const currIds = await syncLoanDetails(savedLoan.loanId, loanedProducts, soldProducts, createLoanDetail, updateSalesDetail, prevSaleDetailIds);
      await deleteUnusedDetails(prevSaleDetailIds, currIds, deleteSaleDetail);
    } catch (error) {
      console.error("Error al guardar el pase:", error);
      alert("Ocurrió un error al guardar el pase.");
    } finally {
      setIsSaving(false);
      setIsModalOpen(true);
    }
  };

  return {
    handleSave,
    lastLoanNumber,
    isModalOpen,
    setIsModalOpen,
    isSaving,
  };
}