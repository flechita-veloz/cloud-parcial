import { useEffect, useState } from "react";
import { Product, Client, Transaction, Sale } from "@/state/api";
import { convertToPeruDate } from "@/app/utils/date"

export type DetailProduct = Product & {
  quantity: number;
  saleDetailId: string;
  status: string;
};

type UseLoadSaleDataResult = {
  soldProducts: DetailProduct[];
  selectedClient: Client | null;
  saleDate: string;
  globalTotal: number;
  transactions: Partial<Transaction>[];
  setSoldProducts: React.Dispatch<React.SetStateAction<DetailProduct[]>>;
  setSelectedClient: React.Dispatch<React.SetStateAction<Client | null>>;
  setSaleDate: React.Dispatch<React.SetStateAction<string>>;
  setTransactions: React.Dispatch<React.SetStateAction<Partial<Transaction>[]>>;
  setGlobalTotal: React.Dispatch<React.SetStateAction<number>>;
  setReceiptType: React.Dispatch<React.SetStateAction<string>>;
  setIsPercentageDiscount: React.Dispatch<React.SetStateAction<boolean>>;
  setDiscount: React.Dispatch<React.SetStateAction<number>>;
  prevSaleDetailIds: string[];
  prevTransactionIds: string[];
  receiptType: string;
  discount: number,
  isPercentageDiscount: boolean,
};

export const useLoadSaleData = (sale: Sale | null | undefined): UseLoadSaleDataResult => {
  const [soldProducts, setSoldProducts] = useState<DetailProduct[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [receiptType, setReceiptType] = useState("Ninguno");
  const today = new Date().toISOString().split("T")[0];
  const [saleDate, setSaleDate] = useState(today);
  const [prevSaleDetailIds, setPrevSaleDetailIds] = useState<string[]>([]);
  const [transactions, setTransactions] = useState<Partial<Transaction>[]>([]);
  const [globalTotal, setGlobalTotal] = useState(0);
  const [prevTransactionIds, setPrevTransactionIds] = useState<string[]>([]);
  const [discount, setDiscount] = useState(0);
  const [isPercentageDiscount, setIsPercentageDiscount] = useState(false);


  useEffect(() => {
    if (sale) {
      const prevSoldProducts: DetailProduct[] = [];
      const detailIds: string[] = [];
      const transactionIds: string[] = [];

      sale.saleDetails.forEach((detail) => {
        const product: DetailProduct = {
          quantity: detail.quantity,
          valueTax: detail.valueTax,
          typeTax: detail.typeTax,
          code: detail.codeProduct,
          name: detail.nameProduct,
          price: detail.unitPrice,
          productId: detail.productId,
          stockQuantity: detail.product.stockQuantity,
          includeTax: true,
          saleDetailId: detail.saleDetailId,
          status: detail.status,
        };
        if (detail.status === "DEVUELTO" || detail.status === "POR_DEVOLVER") {
          prevSoldProducts.push(product);
        } else {
          prevSoldProducts.push(product);
        }
        if (detail.saleDetailId) {
          detailIds.push(detail.saleDetailId);
        }
      });
      setPrevSaleDetailIds(detailIds);
      setSoldProducts(prevSoldProducts);
      setSoldProducts(prevSoldProducts);
      setReceiptType(sale.billing?.type || "Ninguno");
      setDiscount(sale.discount);
      setIsPercentageDiscount(sale.isPercentageDiscount);

      if (sale.transactions?.length) {
        const transactionsWithPeruDate = sale.transactions.map(tx => {
          transactionIds.push(tx.transactionId);
          return {
            ...tx,
            date: convertToPeruDate(tx.date),
          };
        });
        setTransactions(transactionsWithPeruDate);
        setPrevTransactionIds(transactionIds);
      }
      else{
        setTransactions([
          {
            paymentMethod: "Efectivo",
            date: convertToPeruDate(today),
            amount: 0,
          },
        ]);
      }
      setSelectedClient(sale.client);
      setSaleDate(convertToPeruDate(sale.date));
      setGlobalTotal(sale.totalAmount);
    }
    else{
      setTransactions([
        {
          paymentMethod: "Efectivo",
          date: convertToPeruDate(today),
          amount: 0,
        },
      ]);
    }
  }, [sale, today]);

  return {
    soldProducts,
    selectedClient,
    saleDate,
    transactions,
    globalTotal,
    setSoldProducts,
    setSelectedClient,
    setSaleDate,
    setTransactions,
    setGlobalTotal,
    prevSaleDetailIds,
    prevTransactionIds,
    receiptType,
    setReceiptType,
    discount,
    setDiscount,
    isPercentageDiscount,
    setIsPercentageDiscount
  };
};