// hooks/useSaleSubmission.ts
import { useState } from "react";
import { useCreateSaleMutation, useCreateSalesDetailMutation, Transaction,
          Product, Client, useDeleteSaleDetailMutation, useUpdateSaleMutation,
          useUpdateSalesDetailMutation,  useCreateBillingMutation,
          Sale, useCreateTransactionMutation, useUpdateTransactionMutation, 
          useDeleteTransactionMutation} from "@/state/api";
import { mergeDateWithCurrentTime } from "@/app/utils/date";

type DetailProduct = Product & {quantity: number, saleDetailId: string, status: string};

type SaleSubmissionResult = {
  handleSave: (args: {
    client: Client | null;
    date: string;
    sale: Sale | null;
    totalSold: number;
    soldProducts: DetailProduct[];
    transactions: Partial<Transaction>[];
    prevSaleDetailIds: string[];
    prevTransactionIds: string[];
    receiptType: string;
    discount: number;
    isPercentageDiscount: boolean;
    state: string;
  }) => Promise<void>;
  savedSale: Sale | null;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  isSaving: boolean;
  billingStatus: "PENDIENTE" | "EXCEPCION" | "ACEPTADO" | "RECHAZADO";
};

export function useSaleSubmission(): SaleSubmissionResult {
  const [createSale] = useCreateSaleMutation();
  const [updateSale] = useUpdateSaleMutation();
  const [deleteTransaction] = useDeleteTransactionMutation();
  const [createSaleDetail] = useCreateSalesDetailMutation();
  const [updateSalesDetail] = useUpdateSalesDetailMutation();
  const [deleteSaleDetail] = useDeleteSaleDetailMutation();
  const [createTransaction] = useCreateTransactionMutation();
  const [updateTransaction] = useUpdateTransactionMutation();
  const [createBilling] = useCreateBillingMutation();
  const [savedSale, setSavedSale] = useState<Sale | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [billingStatus, setBillingStatus] = useState<"PENDIENTE" | "EXCEPCION" | "ACEPTADO" | "RECHAZADO">("PENDIENTE");

  const processSale = async (sale: Sale | null, clientId: string, date: string, 
    totalSold: number, discount: number, isPercentageDiscount: boolean, state: string) => {
    if (sale) {
      const updatedSale = {
        totalAmount: totalSold,
        state: state,
        date: mergeDateWithCurrentTime(date),
        clientId,
        discount: discount,
        isPercentageDiscount: isPercentageDiscount,
      };
      await updateSale({ saleId: sale.saleId, data: updatedSale }).unwrap();
      return sale;
    } else {
      const createdSale = await createSale({
        totalAmount: totalSold,
        state: state,
        clientId,
        userId: "u1",
        date: mergeDateWithCurrentTime(date),
        discount: discount,
        isPercentageDiscount: isPercentageDiscount,
      }).unwrap();
      return createdSale;
    }
  };

  const syncSaleDetails = async (
    saleId: string,
    soldProducts: DetailProduct[],
    createSaleDetail: ReturnType<typeof useCreateSalesDetailMutation>[0],
    updateSalesDetail: ReturnType<typeof useUpdateSalesDetailMutation>[0],
    prevSaleDetailIds: string[],
  ) => {
    const currIds = new Set<string>();
    
    const allProducts = [...soldProducts];
    for (const item of allProducts) {
      try {
        if (!prevSaleDetailIds.includes(item.saleDetailId)) {
          await createSaleDetail({
            quantity: item.quantity,
            unitPrice: item.price,
            saleId,
            valueTax: item.valueTax,
            typeTax: item.typeTax,
            nameProduct: item.name,
            codeProduct: item.code,
            productId: item.productId,
            status: "VENDIDO",
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
              status: "VENDIDO",
            },
          }).unwrap();
          currIds.add(item.saleDetailId);
        }
      } catch (error) {
        console.error("Error al procesar detalle de venta", error);
      }
    }
    return currIds;
  };

  const syncTransaction = async (
    saleId: string,
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
            saleId,
            userId: "u1",
            type: "Depósito",
            description: `Pago de venta #${number ?? ""}`,
            date: mergeDateWithCurrentTime(item.date!),
            paymentMethod: item.paymentMethod!,
            amount: item.amount!,
            origin: "Pago de venta",
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
      console.error("Error al crear o actualizar transacción de venta", error);
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
          console.error("Error al eliminar la transacción de venta", error);
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
          console.error("Error al eliminar el detalle del venta", error);
        }
      }
    }
  };

  const syncBilling = async (saleId: string, receiptType: string) => {
    setBillingStatus("PENDIENTE");
    if(receiptType != "Ninguno"){
      await createBilling({
        saleId: saleId,
        type: receiptType === "factura" ? "Factura" : "Boleta",
        state: "PENDIENTE",
      })
      .unwrap().then(() => {
        setBillingStatus("ACEPTADO");
      })
      .catch((error) => {
        setBillingStatus("RECHAZADO"); 
        console.error("Error al crear boleta o factura:", error);
      });
    } 
  }

  const handleSave = async ({
    client,
    date,
    sale,
    totalSold,
    soldProducts,
    transactions,
    prevTransactionIds,
    prevSaleDetailIds,
    receiptType,
    discount,
    isPercentageDiscount,
    state,
  }: {
    client: Client | null;
    date: string;
    sale: Sale | null;
    totalSold: number;
    soldProducts: DetailProduct[];
    transactions: Partial<Transaction>[];
    prevSaleDetailIds: string[];
    prevTransactionIds: string[];
    receiptType: string;
    discount: number,
    isPercentageDiscount: boolean,
    state: string,
  }) => {
    if (!client) return alert("Seleccione un cliente antes de guardar la venta");
    if (soldProducts.length === 0) return alert("Seleccione al menos un producto.");

    try {
      setIsSaving(true);
      const _savedSale = await processSale(sale, client.clientId, date, totalSold, discount, isPercentageDiscount, state);
      setSavedSale(_savedSale);
      syncBilling(_savedSale.saleId, receiptType);

      await syncTransaction(_savedSale.saleId, sale?.number ?? 0, transactions, createTransaction, updateTransaction, deleteTransaction, prevTransactionIds);
      const currIds = await syncSaleDetails(_savedSale.saleId, soldProducts, createSaleDetail, updateSalesDetail, prevSaleDetailIds);
      await deleteUnusedDetails(prevSaleDetailIds, currIds, deleteSaleDetail);
    } catch (error) {
      console.error("Error al guardar la venta", error);
      alert("Ocurrió un error al guardar la venta");
    } finally {
      setIsSaving(false);
      setIsModalOpen(true);
    }
  };

  return {
    handleSave,
    savedSale,
    isModalOpen,
    setIsModalOpen,
    isSaving,
    billingStatus,
  };
}