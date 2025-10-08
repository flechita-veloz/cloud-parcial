"use client";

import { useState, useMemo } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import { es } from "date-fns/locale";
registerLocale("es", es);
import SaveLoanModal from "../SaveLoanModal";
import ClientSelectorPanel from "@/app/(components)/ClientSelectorPanel"
import ProductSelectorPanel from "@/app/(components)/ProductSelectorPanel/index"
import TotalsSummary from "@/app/(components)/ProductSelectorPanel/TotalsSummary"
import { useGetLoanByIDQuery} from "@/state/api"; 
import { skipToken } from "@reduxjs/toolkit/query/react";
import { useLoanSubmission } from "@/app/hooks/submissions/useLoanSubmission";
import {Button} from "@/components/ui/button";
import { useParams } from "next/navigation";
import SelectedProductsTable from "@/app/(components)/SelectedProductsTable";
import useRemoveSoldProductFromTable from "@/app/hooks/tableProducts/useRemoveSoldProductFromTable";
import useProductFieldUpdater from "@/app/hooks/tableProducts/useProductFieldUpdater";
import QueryStateHandler from "@/app/(components)/QueryStateHandler";
import PaymentMethodsManager from "@/app/(components)/TransactionsPanel";
import { useLoadLoanData } from "@/app/hooks/loads/useLoadLoanData";
import { getLoanedProductColumns } from "@/app/utils/loan/getLoanedProductColumns";
import TabMovilButtons from "@/app/(components)/TabMovilButtons"
import SaveButtons from "@/app/(components)/SaveButtons"
import { format } from "date-fns";

type PageLoanProps = {
  shouldFetchLoan?: boolean;
  additionalColumns?: boolean;
  showTransactionsPanel?: boolean;
};

const LoanPage = ({
  additionalColumns = true,
  shouldFetchLoan = true,
  showTransactionsPanel = true,
}: PageLoanProps) => {
  const params = useParams();
  const loanId = params?.loanId as string;
  const [activeTab, setActiveTab] = useState<"products" | "payment">("products");

  // GET LOAN BY ID (conditionally)
  const {
    data: loan,
    isError,
    isLoading,
  } = useGetLoanByIDQuery(shouldFetchLoan ? loanId : skipToken);

  const {
    loanedProducts,
    setLoanedProducts,
    soldProducts,
    setSoldProducts,
    selectedClient,
    setSelectedClient,
    loanDate,
    setLoanDate,
    transactions,
    setTransactions,
    prevSaleDetailIds,
    prevTransactionIds,
  } = useLoadLoanData(loan);

  const {
    handleSave,
    lastLoanNumber,
    isModalOpen,
    setIsModalOpen,
    isSaving,
  } = useLoanSubmission();

  {/* FUNCTION TO HANDLE LOGIC OF BUTTON CANCEL */}
  const handleCancel = () => {
    const confirmExit = window.confirm("Tiene cambios no guardados. ¿Desea descartarlos?");
    if (confirmExit) {
      window.history.back(); // Vuelve a la página anterior
    }
  };

  {/* FUNCTION TO HANDLE FIELDS OF PRODUCTS FROM TABLE */}
  const handleFieldChange = useProductFieldUpdater(setSoldProducts);

  const handleRemoveSoldProduct = useRemoveSoldProductFromTable(setSoldProducts, setLoanedProducts);

  const totalLoanedReturned = loanedProducts.reduce(
    (acc, product) => acc + product.price * product.quantity * (product.status === "DEVUELTO" ? 1 : 0),
    0
  );

  const totalLoanedUnreturned = loanedProducts.reduce(
    (acc, product) => acc + product.price * product.quantity * (product.status === "POR_DEVOLVER" ? 1 : 0),
    0
  );

  const totalSold = soldProducts.reduce(
    (acc, product) => acc + product.price * product.quantity,
    0
  );

  // FUNCTION TO HANDLE SAVE BUTTON
  const handleUpdateLoan = () => {
    console.log(totalLoanedReturned, totalLoanedUnreturned, totalSold);
    handleSave({
      client: selectedClient,
      transactions,
      date: loanDate,
      loan: loan ?? null,
      totalLoanedReturned,
      totalLoanedUnreturned,
      totalSold,
      loanedProducts,
      soldProducts,
      prevSaleDetailIds,
      prevTransactionIds,
    });
  };
  const computedColumns = useMemo(() => {
    return additionalColumns
      ? getLoanedProductColumns(loanedProducts, soldProducts, setLoanedProducts, setSoldProducts)
      : undefined;
  }, [additionalColumns, loanedProducts,  setLoanedProducts, soldProducts, setSoldProducts]);
  
  return (
    <QueryStateHandler
      errors={[
        { isLoading: isLoading, isError: isError, name: "Pases" },
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
              <h2 className="text-xl font-semibold">Pases</h2>
            </div>
          </div>
          {/* PRODUCTS PANEL */}
          <ProductSelectorPanel
            selectedProducts={loanedProducts}
            setSelectedProducts={setLoanedProducts}
            additionalColumns={computedColumns}
          />

          {/* TOTAL SUM OF ALL PRODUCTS */}
          {loanedProducts.length > 0 && (
            <TotalsSummary 
              selectedProducts={loanedProducts} 
              filterStatus={["POR_DEVOLVER", "DEVUELTO"]}
            />
          )}

          {/* SELECTED PRODUCTS TABLE */}
          {soldProducts.length > 0 && (
            <>
              <h2 className="text-xl font-semibold mt-4">Vendidos</h2>
              <SelectedProductsTable
                selectedProducts={soldProducts}
                onFieldChange={handleFieldChange}
                onRemoveProduct={handleRemoveSoldProduct}
              />
              <TotalsSummary 
                selectedProducts={soldProducts} 
                filterStatus={["VENDIDO"]}
              />
            </>
          )}
          
          { /* SAVE AND CANCEL LOAN */ }
          {loanedProducts.length > 0 && (
            <SaveButtons
              onCancel={handleCancel}
              onSave={handleUpdateLoan}
              isSaving={isSaving}
            />
          )}
        </div>

        <div className={`${activeTab === "payment" ? "block" : "hidden"} md:block w-full md:w-1/3 bg-white p-4 rounded-lg shadow-md`}>
          <h2 className="text-xl font-semibold mb-2">Fecha del pase</h2>
          <DatePicker
            locale="es"
            selected={
              loanDate
              ? new Date(`${loanDate}T00:00:00`)
              : new Date()
            }
            onChange={(date) => {
              if (date) {
                setLoanDate(format(date, "yyyy-MM-dd"));
              }
            }}
            dateFormat="yyyy-MM-dd"
            placeholderText="Seleccionar fecha"
            customInput={
              <input
                className="mb-4 w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
              />
            }
          />
          {/* TRANSACTIONS PANEL */}
          {showTransactionsPanel && (
            <PaymentMethodsManager
              transactions={transactions}
              setTransactions={setTransactions}
              globalTotal={totalSold}
            />
          )}
          {/* CLIENTS PANEL */}
          <ClientSelectorPanel
            selectedClient={selectedClient}
            setSelectedClient={setSelectedClient}
          />
        </div>
      </div>
      {/* MODAL SAVE LOAN */}
      <SaveLoanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        loanNumber={lastLoanNumber}
      />
    </QueryStateHandler>
  );
};

export default LoanPage;
