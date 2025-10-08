import { useEffect, useState } from "react";
import { Product, Client, Transaction, Loan } from "@/state/api";
import { convertToPeruDate } from "@/app/utils/date"

export type DetailProduct = Product & {
  quantity: number;
  saleDetailId: string;
  status: string;
};

type UseLoadLoanDataResult = {
  loanedProducts: DetailProduct[];
  soldProducts: DetailProduct[];
  selectedClient: Client | null;
  loanDate: string;
  globalTotal: number;
  transactions: Partial<Transaction>[];
  setLoanedProducts: React.Dispatch<React.SetStateAction<DetailProduct[]>>;
  setSoldProducts: React.Dispatch<React.SetStateAction<DetailProduct[]>>;
  setSelectedClient: React.Dispatch<React.SetStateAction<Client | null>>;
  setLoanDate: React.Dispatch<React.SetStateAction<string>>;
  setTransactions: React.Dispatch<React.SetStateAction<Partial<Transaction>[]>>;
  setGlobalTotal: React.Dispatch<React.SetStateAction<number>>;
  prevSaleDetailIds: string[];
  prevTransactionIds: string[];
};

export const useLoadLoanData = (loan: Loan | null | undefined): UseLoadLoanDataResult => {
  const [loanedProducts, setLoanedProducts] = useState<DetailProduct[]>([]);
  const [soldProducts, setSoldProducts] = useState<DetailProduct[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const today = new Date().toISOString().split("T")[0];
  const [loanDate, setLoanDate] = useState(today);
  const [prevSaleDetailIds, setPrevSaleDetailIds] = useState<string[]>([]);
  const [transactions, setTransactions] = useState<Partial<Transaction>[]>([]);
  const [globalTotal, setGlobalTotal] = useState(0);
  const [prevTransactionIds, setPrevTransactionIds] = useState<string[]>([]);

  useEffect(() => {
    if (loan) {
      const prevLoanedProducts: DetailProduct[] = [];
      const prevSoldProducts: DetailProduct[] = [];
      const detailIds: string[] = [];
      const transactionIds: string[] = [];

      loan.loanDetails.forEach((detail) => {
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
          prevLoanedProducts.push(product);
        } else {
          prevSoldProducts.push(product);
        }
        if (detail.saleDetailId) {
          detailIds.push(detail.saleDetailId);
        }
      });
      setPrevSaleDetailIds(detailIds);
      setLoanedProducts(prevLoanedProducts);
      setSoldProducts(prevSoldProducts);

      if (loan.transactions?.length) {
        const transactionsWithPeruDate = loan.transactions.map(tx => {
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
            date: "",
            amount: 0,
          },
        ]);
      }
      setSelectedClient(loan.client);
      setLoanDate(convertToPeruDate(loan.date));
      setGlobalTotal(loan.totalAmount);
    }
  }, [loan]);

  return {
    loanedProducts,
    soldProducts,
    selectedClient,
    loanDate,
    transactions,
    globalTotal,
    setLoanedProducts,
    setSoldProducts,
    setSelectedClient,
    setLoanDate,
    setTransactions,
    setGlobalTotal,
    prevSaleDetailIds,
    prevTransactionIds,
  };
};