import { Product } from "@/state/api";

type DetailProduct = Product & { quantity: number, saleDetailId: string, status: string };

const useRemoveSoldProductFromTable = (
  setSoldProducts: React.Dispatch<React.SetStateAction<DetailProduct[]>>,
  setLoanedProducts: React.Dispatch<React.SetStateAction<DetailProduct[]>>
) => {
  const handleRemoveProductTable = (index: number) => {
    setSoldProducts((prev) => {
      const removed = prev[index];
      const updated = prev.filter((_, i) => i !== index);
      if (removed) {
        setLoanedProducts((loaned) => {
          const alreadyExists = loaned.some((p) => p.productId === removed.productId);
          if (alreadyExists) return loaned;
          return [...loaned, { ...removed, status: "POR_DEVOLVER" }];
        });
      }
      return updated;
    });
  };

  return handleRemoveProductTable;
};

export default useRemoveSoldProductFromTable;