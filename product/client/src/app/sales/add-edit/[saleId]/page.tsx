"use client";

import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import { es } from "date-fns/locale";
registerLocale("es", es);
import SaveSaleModal from "../SaveSaleModal";
import ClientSelectorPanel from "@/app/(components)/ClientSelectorPanel"
import TotalsSummary from "@/app/(components)/ProductSelectorPanel/TotalsSummary"
import { useGetSaleByIDQuery} from "@/state/api"; 
import { skipToken } from "@reduxjs/toolkit/query/react";
import { useSaleSubmission } from "@/app/hooks/submissions/useSaleSubmission";
import {Button} from "@/components/ui/button";
import { useParams } from "next/navigation";
import ProductSelectorPanel from "@/app/(components)/ProductSelectorPanel/index"
import QueryStateHandler from "@/app/(components)/QueryStateHandler";
import PaymentMethodsManager from "@/app/(components)/TransactionsPanel";
import { useLoadSaleData } from "@/app/hooks/loads/useLoadSaleData";
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
  const saleId = params?.saleId as string;
  const [state, setState] = useState<string>("DEUDA");
  const [activeTab, setActiveTab] = useState<"products" | "payment">("products");

  // GET LOAN BY ID (conditionally)
  const {
    data: sale,
    isError,
    isLoading,
  } = useGetSaleByIDQuery(shouldFetchSale ? saleId : skipToken);

  const {
    soldProducts,
    setSoldProducts,
    selectedClient,
    setSelectedClient,
    saleDate,
    setSaleDate,
    transactions,
    setTransactions,
    prevSaleDetailIds,
    prevTransactionIds,
    receiptType,
    setReceiptType,
    discount, 
    setDiscount,
    isPercentageDiscount,
    setIsPercentageDiscount
  } = useLoadSaleData(sale);

  const {
    handleSave,
    savedSale,
    isModalOpen,
    setIsModalOpen,
    isSaving,
    billingStatus,
  } = useSaleSubmission();

  {/* FUNCTION TO HANDLE LOGIC OF BUTTON CANCEL */}
  const handleCancel = () => {
    const confirmExit = window.confirm("Tiene cambios no guardados. ¿Desea descartarlos?");
    if (confirmExit) {
      window.history.back(); // Vuelve a la página anterior
    }
  };

  const subtotal = soldProducts.reduce(
    (acc, product) => acc + product.price * product.quantity,
    0
  );

  const totalSold= subtotal + 
    (isPercentageDiscount ? subtotal * (discount / 100) : discount);

  // FUNCTION TO HANDLE SAVE BUTTON
  const handleUpdateSale = () => {
    handleSave({
      client: selectedClient,
      transactions,
      date: saleDate,
      sale: sale ?? null,
      totalSold,
      soldProducts,
      prevSaleDetailIds,
      prevTransactionIds,
      receiptType,
      discount,
      isPercentageDiscount,
      state: state,
    });
  };

  return (
    <QueryStateHandler
      errors={[
        { isLoading: isLoading, isError: isError, name: "Ventas" },
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
              <h2 className="text-xl font-semibold">Ventas</h2>
            </div>
          </div>

          
          {/* PRODUCTS PANEL */}
          <ProductSelectorPanel
            selectedProducts={soldProducts}
            setSelectedProducts={setSoldProducts}
          />
          {soldProducts.length > 0 && (
          <>
            {/* TOTAL SUM OF ALL PRODUCTS */}
            <TotalsSummary
              selectedProducts={soldProducts}
              filterStatus={["POR_DEVOLVER", "VENDIDO"]}
              discount={discount}
              setDiscount={setDiscount}
              isPercentageDiscount={isPercentageDiscount}
              setIsPercentageDiscount={setIsPercentageDiscount}
            ></TotalsSummary>
          </>
          )}
          
          { /* SAVE AND CANCEL SALE */ }
          {soldProducts.length > 0 && (
            <SaveButtons
              onCancel={handleCancel}
              onSave={handleUpdateSale}
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
                value={receiptType}
                onChange={(e) => setReceiptType(e.target.value)}
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
                selected={saleDate ? new Date(`${saleDate}T00:00:00`) : new Date()}
                onChange={(date) => {
                  if (date) {
                    setSaleDate(format(date, "yyyy-MM-dd"));
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

          {/* TRANSACTIONS PANEL */}
          <PaymentMethodsManager
            transactions={transactions}
            setTransactions={setTransactions}
            globalTotal={totalSold}
            setState={setState}
          />
          {/* CLIENTS PANEL */}
          <ClientSelectorPanel
            selectedClient={selectedClient}
            setSelectedClient={setSelectedClient}
          />
        </div>
      </div>
      {/* MODAL SAVE LOAN */}
      <SaveSaleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        sale={savedSale} 
        billingStatus={billingStatus} 
      />
    </QueryStateHandler>
  );
}

export default SalePage;