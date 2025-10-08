import { useEffect, useState } from "react";
import { Product, Client, Transaction, Purchase } from "@/state/api";
import { convertToPeruDate } from "@/app/utils/date"

export type DetailProduct = Product & {
  quantity: number;
  saleDetailId: string;
  status: string;
};

type UseLoadPurchaseDataResult = {
  purchasedProducts: DetailProduct[];
  selectedSupplier: Client | null;
  purchaseDate: string;
  globalTotal: number;
  transactions: Partial<Transaction>[];
  setPurchasedProducts: React.Dispatch<React.SetStateAction<DetailProduct[]>>;
  setSelectedSupplier: React.Dispatch<React.SetStateAction<Client | null>>;
  setPurchaseDate: React.Dispatch<React.SetStateAction<string>>;
  setTransactions: React.Dispatch<React.SetStateAction<Partial<Transaction>[]>>;
  setGlobalTotal: React.Dispatch<React.SetStateAction<number>>;
  setIsPercentageDiscount: React.Dispatch<React.SetStateAction<boolean>>;
  setDiscount: React.Dispatch<React.SetStateAction<number>>;
  setBillingNumber: React.Dispatch<React.SetStateAction<string>>;
  setBillingType: React.Dispatch<React.SetStateAction<string>>;
  setShipping: React.Dispatch<React.SetStateAction<number>>;
  prevPurchaseDetailIds: string[];
  prevTransactionIds: string[];
  discount: number,
  isPercentageDiscount: boolean,
  billingNumber: string;
  billingType: string;
  shipping: number;
};

export const useLoadPurchaseData = (purchase: Purchase | null | undefined): UseLoadPurchaseDataResult => {
  const [purchasedProducts, setPurchasedProducts] = useState<DetailProduct[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<Client | null>(null);
  const today = new Date().toISOString().split("T")[0];
  const [purchaseDate, setPurchaseDate] = useState(today);
  const [prevPurchaseDetailIds, setPrevPurchaseDetailIds] = useState<string[]>([]);
  const [transactions, setTransactions] = useState<Partial<Transaction>[]>([]);
  const [globalTotal, setGlobalTotal] = useState(0);
  const [prevTransactionIds, setPrevTransactionIds] = useState<string[]>([]);
  const [discount, setDiscount] = useState(0);
  const [isPercentageDiscount, setIsPercentageDiscount] = useState(false);
  const [billingNumber, setBillingNumber] = useState("");
  const [billingType, setBillingType] = useState("Ninguno");
  const [shipping, setShipping] = useState(0);

  useEffect(() => {
    if (purchase) {
      const prevPurchasedProducts: DetailProduct[] = [];
      const detailIds: string[] = [];
      const transactionIds: string[] = [];

      purchase.purchaseDetails.forEach((detail) => {
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
          prevPurchasedProducts.push(product);
        } else {
          prevPurchasedProducts.push(product);
        }
        if (detail.saleDetailId) {
          detailIds.push(detail.saleDetailId);
        }
      });
      setPrevPurchaseDetailIds(detailIds);
      setPurchasedProducts(prevPurchasedProducts);
      setPurchasedProducts(prevPurchasedProducts);
      setDiscount(purchase.discount);
      setIsPercentageDiscount(purchase.isPercentageDiscount);
      setBillingNumber(purchase.billingNumber);
      setBillingType(purchase.billingType);
      setShipping(purchase.shipping);

      if (purchase.transactions?.length) {
        const transactionsWithPeruDate = purchase.transactions.map(tx => {
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
      setSelectedSupplier(purchase.supplier);
      setPurchaseDate(convertToPeruDate(purchase.date));
      setGlobalTotal(purchase.totalAmount);
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
  }, [purchase, today]);

  return {
    purchasedProducts,
    selectedSupplier, setSelectedSupplier,
    purchaseDate,
    transactions,
    globalTotal,
    setPurchasedProducts,
    setPurchaseDate,
    setTransactions,
    setGlobalTotal,
    prevPurchaseDetailIds,
    prevTransactionIds,
    discount, setDiscount,
    isPercentageDiscount,
    setIsPercentageDiscount,
    billingNumber, setBillingNumber,
    billingType, setBillingType,
    shipping, setShipping,
  };
};