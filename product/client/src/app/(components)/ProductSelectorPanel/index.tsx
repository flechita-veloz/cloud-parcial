import React, { useMemo, useState, useRef } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { v4 as uuid } from 'uuid';
import useBarSearch from "@/app/hooks/useBarSearch";
import useProductFieldUpdater from "@/app/hooks/tableProducts/useProductFieldUpdater";
import useAddProductToTable from "@/app/hooks/tableProducts/useAddProductToTable";
import SearchBar from "@/app/(components)/SearchBar";
import QueryStateHandler from "@/app/(components)/QueryStateHandler";
import GenericDropDown from "@/app/(components)/DropDown";
import SelectedProductsTable from "@/app/(components)/SelectedProductsTable";
import CreateProductModal from "@/app/products/CreateProductModal";
import { useSearchProductsQuery, Product } from "@/state/api";
import useRemoveProductFromTable from "@/app/hooks/tableProducts/useRemoveProductFromTable";

import { GridColDef } from "@mui/x-data-grid";

type DetailProduct = Product & {quantity: number, saleDetailId: string, status: string};

type ProductSelectorPanelProps = {
  selectedProducts: (DetailProduct)[];
  setSelectedProducts: React.Dispatch<React.SetStateAction<(DetailProduct)[]>>;
  additionalColumns?: GridColDef[];
  IGVSearchBar?: boolean;
  setIGVSearchBar?: React.Dispatch<React.SetStateAction<boolean>>;
};

const ProductSelectorPanel = (props: ProductSelectorPanelProps) => {
  const { selectedProducts, setSelectedProducts, additionalColumns, IGVSearchBar, setIGVSearchBar } = props;
  const quantityInputRef = useRef<HTMLInputElement>(null);

  const [isCreateProductModalOpen, setIsCreateProductModalOpen] = useState(false);
  const [quantitySearchBar, setQuantitySearchBar] = useState(0);
  const [priceSearchBar, setPriceSearchBar] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<(DetailProduct | null)>(null);

  const onClearExtra = () => {
    setSelectedProduct(null);
    setQuantitySearchBar(0);
    setPriceSearchBar(0);
  };

  const {
    searchTerm,
    setSearchTerm,
    localSearchTerm,
    setLocalSearchTerm,
    handleSearchChange,
    clearSearch,
  } = useBarSearch(onClearExtra);

  {/* GET PRODUCTS */}
  const {
    data: products,
    isLoading: isLoadingProducts,
    isError: isErrorProducts,
  } = useSearchProductsQuery(searchTerm);

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return [];
    return (products ?? []).filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, products]);


  {/* FUNCTION TO ADD PRODUCT TO TABLE */}
  const handleAddProduct = useAddProductToTable(
    selectedProduct,
    quantitySearchBar,
    priceSearchBar,
    clearSearch,
    setSelectedProducts,
    IGVSearchBar,
  );

  {/* FUNCTION TO HANDLE FIELDS OF PRODUCTS FROM TABLE */}
  const handleFieldChange = useProductFieldUpdater(setSelectedProducts);

  {/* FUNCTION TO REMOVE PRODUCTS BY ROW OF TABLE */}
  const handleRemoveProductTable = useRemoveProductFromTable(setSelectedProducts);

  {/* FUNCTION TO REMOVE PRODUCT OF SEARCHBAR */}
  const handleRemoveProductSearchBar = () => {
    setSelectedProduct(null);
    clearSearch();
  };

  const calculatePriceSearchBar = (product: Product) => {
    if (product.includeTax) {
      setPriceSearchBar(product.price);
    } else {
      setPriceSearchBar(product.price * (1 + product.valueTax));
    }
  }

  const handleSelectProduct = async (product: Product) => {
    const newproduct = { ...product, quantity: 1, saleDetailId: uuid(), status: "POR_DEVOLVER"};
    setSelectedProduct(newproduct);
    setQuantitySearchBar(1);
    calculatePriceSearchBar(product);
    setSearchTerm(product.name);
    setLocalSearchTerm(product.name);
  };

  return (
    <QueryStateHandler
      errors={[
        { isLoading: isLoadingProducts, isError: isErrorProducts, name: "productos" },
      ]}
    >
      <div className="relative">
        {/* SEARCH BAR PRODUCTS */}
        <SearchBar
          value={localSearchTerm}
          onChange={handleSearchChange}
          disabled={selectedProduct !== null}
          onClear={handleRemoveProductSearchBar}
          placeholder="Buscar producto"
        >
          {/* QUANTITY INPUT */}
          <input
            ref={quantityInputRef}
            type="number"
            className="w-full py-2 px-4 bg-white md:border-l "
            placeholder="Cantidad"
            value={quantitySearchBar || ""}
            onChange={(e) => setQuantitySearchBar(Number(e.target.value) || 0)}
          />

          {IGVSearchBar !== undefined && setIGVSearchBar && (
            <select
              // className="h-full border-l px-2 py-2 outline-none"
              className="w-full h-10 px-2 border-l bg-white text-sm"
              value={IGVSearchBar ? "with-igv" : "without-igv"}
              onChange={(e) => setIGVSearchBar(e.target.value === "with-igv")}
            >
              <option value="with-igv">Con IGV</option>
              <option value="without-igv">Sin IGV</option>
            </select>
          )}
          
          {/* PRICE INPUT */}
          <input
            type="number"
            className="w-full py-2 px-4 bg-white border-l"
            placeholder="Precio"
            value={priceSearchBar || ""}
            onChange={(e) => setPriceSearchBar(Number(e.target.value) || 0)}
          />

          {/* BUTTON TO ADD PRODUCT */}
          <Button
            variant="confirmAction"
            onClick={handleAddProduct}
            disabled={!selectedProduct}
          >
            <Plus size={20} />
          </Button>
        </SearchBar>
      

        <GenericDropDown
          items={filteredProducts}
          selectedItem={selectedProduct}
          searchTerm={searchTerm}
          onSelectItem={(product: Product) => {
            handleSelectProduct(product);
            quantityInputRef.current?.focus();
          }}
          onCreateItem={() => setIsCreateProductModalOpen(true)}
          keyExtractor={(product: Product) => product.productId}
          renderItem={(product: Product) => (
            <div className="flex items-center">
              <p className="font-bold flex-1">{product.code}</p>
              <p className="text-sm text-gray-600 flex-1">{product.name}</p>
              <p className="text-sm text-gray-600 flex-1">Stock: {product.stockQuantity}</p>
              <p className="text-sm text-gray-700 flex-1">PEN {product.price.toFixed(2)}</p>
            </div>
          )}
        />
      </div>

        {/* SELECTED PRODUCTS TABLE */}
        {selectedProducts.length > 0 && (
          <SelectedProductsTable
            selectedProducts={selectedProducts}
            onFieldChange={handleFieldChange}
            onRemoveProduct={handleRemoveProductTable}
            additionalColumns={additionalColumns}
          />
        )}

        {/* MODAL CREATE/EDIT PRODUCT */}
        <CreateProductModal
          isOpen={isCreateProductModalOpen}
          onClose={() => setIsCreateProductModalOpen(false)}
          product={selectedProduct ?? undefined}
          inputSearchBar={localSearchTerm}
          // onSuccess={(product) => {
          //   handleSelectProduct(product);
          // }}
        />
    </QueryStateHandler>
  );
};

export default ProductSelectorPanel;
