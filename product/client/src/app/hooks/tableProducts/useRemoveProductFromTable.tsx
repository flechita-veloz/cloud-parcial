import { Product } from "@/state/api";

type DetailProduct = Product & {quantity: number, saleDetailId: string, status: string};

const useRemoveProductFromTable = (
  setSelectedProducts: React.Dispatch<React.SetStateAction<DetailProduct[]>>
) => {
  const handleRemoveProductTable = (index: number) => {
    setSelectedProducts((prev) => prev.filter((_, i) => i !== index));
  };

  return handleRemoveProductTable;
};

export default useRemoveProductFromTable;