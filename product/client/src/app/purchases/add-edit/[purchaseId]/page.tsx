"use client";

import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import { es } from "date-fns/locale";
registerLocale("es", es);
import SavePurchaseModal from "../SavePurchaseModal";
import ClientSelectorPanel from "@/app/(components)/ClientSelectorPanel"
import TotalsSummary from "@/app/(components)/ProductSelectorPanel/TotalsSummary"
import { useGetPurchaseByIDQuery} from "@/state/api"; 
import { skipToken } from "@reduxjs/toolkit/query/react";
import { usePurchaseSubmission } from "@/app/hooks/submissions/usePurchaseSubmission";
import {Button} from "@/components/ui/button";
import { useParams } from "next/navigation";
import ProductSelectorPanel from "@/app/(components)/ProductSelectorPanel/index"
import QueryStateHandler from "@/app/(components)/QueryStateHandler";
import PaymentMethodsManager from "@/app/(components)/TransactionsPanel";
import { useLoadPurchaseData } from "@/app/hooks/loads/useLoadPurchaseData";
import TabMovilButtons from "@/app/(components)/TabMovilButtons"
import SaveButtons from "@/app/(components)/SaveButtons"
import { format } from "date-fns";

type PageSaleProps = {
  shouldFetchSale?: boolean;
};

const SalePage = ({
  shouldFetchSale = true,
} : PageSaleProps) => {
  const params = useParams();
  const purchaseId = params?.purchaseId as string;
  const [state, setState] = useState<string>("DEUDA");
  const [activeTab, setActiveTab] = useState<"products" | "payment">("products");
  const [IGVSearchBar, setIGVSearchBar] = useState<boolean>(true);

  // GET LOAN BY ID (conditionally)
  const {
    data: purchase,
    isError,
    isLoading,
  } = useGetPurchaseByIDQuery(shouldFetchSale ? purchaseId : skipToken);

  const {
    purchasedProducts,
    setPurchasedProducts,
    selectedSupplier,
    setSelectedSupplier,
    purchaseDate, setPurchaseDate,
    transactions, setTransactions,
    prevPurchaseDetailIds,
    prevTransactionIds,
    discount, setDiscount,
    isPercentageDiscount, setIsPercentageDiscount,
    billingNumber, setBillingNumber,
    billingType, setBillingType,
    shipping, setShipping,
  } = useLoadPurchaseData(purchase);

  const {
    handleSave,
    savedPurchase,
    isModalOpen,
    setIsModalOpen,
    isSaving,
  } = usePurchaseSubmission();

  {/* FUNCTION TO HANDLE LOGIC OF BUTTON CANCEL */}
  const handleCancel = () => {
    const confirmExit = window.confirm("Tiene cambios no guardados. ¿Desea descartarlos?");
    if (confirmExit) {
      window.history.back(); // Vuelve a la página anterior
    }
  };

  const subtotal = purchasedProducts.reduce(
    (acc, product) => acc + product.price * product.quantity,
    0
  );

  const totalPurchased = subtotal + shipping - 
        (isPercentageDiscount ? subtotal * (discount / 100) : discount);

  // FUNCTION TO HANDLE SAVE BUTTON
  const handleUpdatePurchase = () => {
    handleSave({
      supplier: selectedSupplier,
      transactions,
      date: purchaseDate,
      purchase: purchase ?? null,
      totalPurchased: totalPurchased,
      purchasedProducts,
      prevPurchaseDetailIds,
      prevTransactionIds,
      discount,
      isPercentageDiscount,
      state,
      billingNumber,
      billingType,
      shipping,
    });
  };

  return (
    <QueryStateHandler
      errors={[
        { isLoading: isLoading, isError: isError, name: "Compras" },
      ]}
    >
    <div className="flex flex-col md:flex-row md:items-start gap-4 ">
      {/* FOR TABS AND MOVILS */}
      <TabMovilButtons
        textBtn1="Productos"
        textBtn2="Pago"
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
        <div className={`${activeTab === "products" ? "block" : "hidden"} md:block flex-1 bg-white p-4 rounded-lg shadow-md relative`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button
                variant={"editAction"}
                className="px-3 py-1 rounded-md"
                onClick={handleCancel} 
              >
                Atrás
              </Button>
              <h2 className="text-xl font-semibold">Compras</h2>
            </div>
          </div>

          
          {/* PRODUCTS PANEL */}
          <ProductSelectorPanel
            selectedProducts={purchasedProducts}
            setSelectedProducts={setPurchasedProducts}
            IGVSearchBar = {IGVSearchBar}
            setIGVSearchBar = {setIGVSearchBar}
          />
          {purchasedProducts.length > 0 && (
          <>
            {/* TOTAL SUM OF ALL PRODUCTS */}
            <TotalsSummary
              selectedProducts={purchasedProducts}
              filterStatus={["POR_DEVOLVER", "VENDIDO"]}
              discount={discount}
              setDiscount={setDiscount}
              isPercentageDiscount={isPercentageDiscount}
              setIsPercentageDiscount={setIsPercentageDiscount}
              shipping={shipping}
              setShipping={setShipping}
            ></TotalsSummary>
          </>
          )}
          
          { /* SAVE AND CANCEL SALE */ }
          {purchasedProducts.length > 0 && (
            <SaveButtons
              onCancel={handleCancel}
              onSave={handleUpdatePurchase}
              isSaving={isSaving}
            />
          )}
        </div>

        <div className={`${activeTab === "payment" ? "block" : "hidden"} md:block w-full md:w-1/3 bg-white p-4 rounded-lg shadow-md`}>

          {/* TYPE OF RECEIPT && DATE */}
          <div className="mb-4 flex gap-4 items-start">
            <div className="flex-1 flex flex-col">
              <label className="block text-gray-700 mb-1">Tipo de Comprobante:</label>
               <select
                className="w-full h-10 px-2 border border-gray-300 rounded-md bg-white text-sm"
                value={billingType}
                onChange={(e) => setBillingType(e.target.value)}
              >
                <option value="Ninguno">Ninguno</option>
                <option value="Boleta">Boleta</option>
                <option value="Factura">Factura</option>
              </select>
            </div>

            <div className="flex-1 flex flex-col">
              <label className="block text-gray-700 mb-1">Fecha de Venta:</label>
              <DatePicker
                locale="es"
                selected={purchaseDate ? new Date(`${purchaseDate}T00:00:00`) : new Date()}
                onChange={(date) => {
                  if (date) {
                    setPurchaseDate(format(date, "yyyy-MM-dd"));
                  }
                }}
                dateFormat="yyyy-MM-dd"
                placeholderText="Seleccionar fecha"
                customInput={
                  <input className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white" />
                }
              />
            </div>
          </div>

          {/* NUMBER OF RECEIPT */}
            {billingType != "Ninguno" && 
            <div className="flex-1">
              <label className="block text-gray-700 mb-1">Número de {billingType}:</label>
              <input
                type="text"
                value={billingNumber}
                onChange={(e) => setBillingNumber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
              />
            </div>
            }

          {/* TRANSACTIONS PANEL */}
          <PaymentMethodsManager
            transactions={transactions}
            setTransactions={setTransactions}
            globalTotal={totalPurchased}
            setState={setState}
          />
          {/* CLIENTS PANEL */}
          <ClientSelectorPanel
            selectedClient={selectedSupplier}
            setSelectedClient={setSelectedSupplier}
          />
        </div>
      </div>
      {/* MODAL SAVE LOAN */}
      <SavePurchaseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        purchaseNumber={savedPurchase?.number || 0} 
      />
    </QueryStateHandler>
  ); 
}

export default SalePage;