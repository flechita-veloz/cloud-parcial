import { Product } from "@/state/api";

type DetailProduct = Product & {quantity: number, saleDetailId: string, status: string};

const useAddProductToTable = (
  selectedProduct: DetailProduct | null,
  quantitySearchBar: number,
  priceSearchBar: number,
  clearSearch: () => void,
  setSelectedProducts: React.Dispatch<React.SetStateAction<DetailProduct[]>>,
  IGVSearchBar?: boolean,
) => {
  const handleAddProduct = () => {
    if (!selectedProduct) return;

    setSelectedProducts((prev) => {
      // const existingProduct = prev.find(
      //   (p) => p.productId === selectedProduct.productId
      // );

      // if (existingProduct) {
      //   return prev.map((p) =>
      //     p.productId === selectedProduct.productId
      //       ? {
      //           ...p,
      //           quantity: p.quantity + (quantitySearchBar || 0),
      //         }
      //       : p
      //   );
      // }

      return [
        ...prev,
        {
          ...selectedProduct,
          quantity: quantitySearchBar || 1,
          price: (priceSearchBar || selectedProduct.price) * 
                 (IGVSearchBar === false && selectedProduct.typeTax === "IGV (18.00%)" ? 1.18 : 1)
        },
      ];
    });

    clearSearch();
  };

  return handleAddProduct;
};

export default useAddProductToTable;