// hooks/usePurchaseSubmission.ts
import { useState } from "react";
import { useCreatePurchaseMutation,  Transaction,
          Product, Client, useDeleteSaleDetailMutation, useUpdatePurchaseMutation,
          useUpdateSalesDetailMutation, useCreateSalesDetailMutation,
          Purchase, useCreateTransactionMutation, useUpdateTransactionMutation, 
          useDeleteTransactionMutation} from "@/state/api";
import { mergeDateWithCurrentTime } from "@/app/utils/date";

type DetailProduct = Product & {quantity: number, saleDetailId: string, status: string};

type PurchaseSubmissionResult = {
  handleSave: (args: {
    supplier: Client | null;
    date: string;
    purchase: Purchase | null;
    totalPurchased: number;
    purchasedProducts: DetailProduct[];
    transactions: Partial<Transaction>[];
    prevPurchaseDetailIds: string[];
    prevTransactionIds: string[];
    discount: number;
    isPercentageDiscount: boolean;
    state: string;
    billingNumber: string;
    billingType: string;
    shipping: number;
  }) => Promise<void>;
  savedPurchase: Purchase | null;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  isSaving: boolean;
};

export function usePurchaseSubmission(): PurchaseSubmissionResult {
  const [createPurchase] = useCreatePurchaseMutation();
  const [updatePurchase] = useUpdatePurchaseMutation();
  const [deleteTransaction] = useDeleteTransactionMutation();
  const [createPurchaseDetail] = useCreateSalesDetailMutation();
  const [updatePurchasesDetail] = useUpdateSalesDetailMutation();
  const [deletePurchaseDetail] = useDeleteSaleDetailMutation();
  const [createTransaction] = useCreateTransactionMutation();
  const [updateTransaction] = useUpdateTransactionMutation();
  const [savedPurchase, setSavedPurchase] = useState<Purchase | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const processPurchase = async (purchase: Purchase | null, supplierId: string, date: string, 
    totalPurchased: number, discount: number, isPercentageDiscount: boolean, state: string,
    billingNumber: string, billingType: string, shipping: number) => {
    if (purchase) {
      const updatedPurchase = {
        totalAmount: totalPurchased,
        state: state,
        date: mergeDateWithCurrentTime(date),
        supplierId,
        discount: discount,
        isPercentageDiscount: isPercentageDiscount,
        billingNumber: billingNumber, 
        billingType: billingType, 
        shipping: shipping,
      };
      await updatePurchase({ purchaseId: purchase.purchaseId, data: updatedPurchase }).unwrap();
      return purchase;
    } else {
      const createdPurchase = await createPurchase({
        totalAmount: totalPurchased,
        state: state,
        supplierId,
        userId: "u1",
        date: mergeDateWithCurrentTime(date),
        discount: discount,
        isPercentageDiscount: isPercentageDiscount,
        billingNumber: billingNumber, 
        billingType: billingType, 
        shipping: shipping,
      }).unwrap();
      return createdPurchase;
    }
  };

  const syncPurchaseDetails = async (
    purchaseId: string,
    purchasedProducts: DetailProduct[],
    createPurchaseDetail: ReturnType<typeof useCreateSalesDetailMutation>[0],
    updatePurchasesDetail: ReturnType<typeof useUpdateSalesDetailMutation>[0],
    prevPurchaseDetailIds: string[],
  ) => {
    const currIds = new Set<string>();
    
    const allProducts = [...purchasedProducts];
    for (const item of allProducts) {
      try {
        if (!prevPurchaseDetailIds.includes(item.saleDetailId)) {
          await createPurchaseDetail({
            quantity: item.quantity,
            unitPrice: item.price,
            purchaseId,
            valueTax: item.valueTax,
            typeTax: item.typeTax,
            nameProduct: item.name,
            codeProduct: item.code,
            productId: item.productId,
            status: "VENDIDO",
          }).unwrap();
        } else {
          await updatePurchasesDetail({
            saleDetailId: item.saleDetailId,
            data: {
              quantity: item.quantity,
              unitPrice: item.price,
              valueTax: item.valueTax,
              typeTax: item.typeTax,
              nameProduct: item.name,
              status: "VENDIDO",
            },
          }).unwrap();
          currIds.add(item.saleDetailId);
        }
      } catch (error) {
        console.error("Error al procesar detalle de compra", error);
      }
    }
    return currIds;
  };

  const syncTransaction = async (
    purchaseId: string,
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
            purchaseId,
            userId: "u1", // CORREGIR
            type: "Depósito",
            description: `Pago de compra #${number ?? ""}`,
            date: mergeDateWithCurrentTime(item.date!),
            paymentMethod: item.paymentMethod!,
            amount: item.amount!,
            origin: "Pago de compra",
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
      console.error("Error al crear o actualizar transacción de compra", error);
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
          console.error("Error al eliminar la transacción de compra", error);
        }
      }
    }
  };

  const deleteUnusedDetails = async (
    prevIds: string[],
    currIds: Set<string>,
    deletePurchaseDetail: ReturnType<typeof useDeleteSaleDetailMutation>[0]
  ) => {
    for (const id of prevIds) {
      if (!currIds.has(id)) {
        try {
          await deletePurchaseDetail(id);
        } catch (error) {
          console.error("Error al eliminar el detalle del compra", error);
        }
      }
    }
  };

  const handleSave = async ({
    supplier,
    date,
    purchase,
    totalPurchased,
    purchasedProducts,
    transactions,
    prevTransactionIds,
    prevPurchaseDetailIds,
    discount,
    isPercentageDiscount,
    state,
    billingNumber, 
    billingType, 
    shipping,
  }: {
    supplier: Client | null;
    date: string;
    purchase: Purchase | null;
    totalPurchased: number;
    purchasedProducts: DetailProduct[];
    transactions: Partial<Transaction>[];
    prevPurchaseDetailIds: string[];
    prevTransactionIds: string[];
    discount: number,
    isPercentageDiscount: boolean,
    state: string,
    billingNumber: string, 
    billingType: string, 
    shipping: number
  }) => {
    if (!supplier) return alert("Seleccione un proveedor antes de guardar la compra");
    if (purchasedProducts.length === 0) return alert("Seleccione al menos un producto.");

    try {
      setIsSaving(true);
      const _savedPurchase = await processPurchase(purchase, supplier.clientId, date, totalPurchased, discount, isPercentageDiscount, state, billingNumber, billingType, shipping);
      setSavedPurchase(_savedPurchase);

      await syncTransaction(_savedPurchase.purchaseId, purchase?.number ?? 0, transactions, createTransaction, updateTransaction, deleteTransaction, prevTransactionIds);
      const currIds = await syncPurchaseDetails(_savedPurchase.purchaseId, purchasedProducts, createPurchaseDetail, updatePurchasesDetail, prevPurchaseDetailIds);
      await deleteUnusedDetails(prevPurchaseDetailIds, currIds, deletePurchaseDetail);
    } catch (error) {
      console.error("Error al guardar la compra", error);
      alert("Ocurrió un error al guardar la compra");
    } finally {
      setIsSaving(false);
      setIsModalOpen(true);
    }
  };

  return {
    handleSave,
    savedPurchase,
    isModalOpen,
    setIsModalOpen,
    isSaving,
  };
}