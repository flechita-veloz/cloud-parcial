"use client";

import { useGetTransactionsQuery, User, Transaction} from "@/state/api";
import Header from "@/app/(components)/Header";
import { useRouter } from "next/navigation";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import {  Edit, Menu, XCircle, PlusCircleIcon} from "lucide-react";
import { useState, useMemo } from "react";
import { useAppSelector } from "@/app/redux";
import CreateTransactionModal from "./CreateTransactionModal";
import { esES } from "@mui/x-data-grid/locales";
import { withSharedSearchableProps } from "@/app/(components)/SearchableHeader/whitSharedProps";
import ActionsCell from "@/app/(components)/ActionsCell"; 
import getCustomTheme from "@/theme/customThemeDataGrid"; 
import { ThemeProvider } from "@mui/material/styles";
import useColumnSearch from "@/app/hooks/useColumnSearch";
import QueryStateHandler from "@/app/(components)/QueryStateHandler";
import DateRangePicker from "@/app/(components)/DateRangePicker";

const Transactions = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { data: transactions, isError, isLoading } = useGetTransactionsQuery();
  const [selectedTransactionId, setSelectedTransactionId] = useState<string>("");
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const theme = useMemo(() => getCustomTheme(isDarkMode ? 'dark' : 'light'), [isDarkMode]);
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
  const router = useRouter();
  const {
    searchTerms,
    localSearchTerms,
    searchingFields,
    fieldFocus,
    setFieldFocus,
    setSearchingFields,
    handleSearchChange,
    clearSearch,
  } = useColumnSearch();

  const getFieldValue = (loan: Transaction, field: string): string => {
    // if (field === "user") return loan.user?.username?.toLowerCase() ?? "";
    return loan[field as keyof Transaction]?.toString().toLowerCase() ?? "";
  };
  
  const filteredTransactions = useMemo(() => {
    return transactions?.filter((purchase) => {
      const purchaseDate = new Date(
        purchase.date
      );
      const start = dateRange.startDate
        ? new Date(dateRange.startDate.split("/").reverse().join("-"))
        : null;
      const end = dateRange.endDate
        ? new Date(dateRange.endDate.split("/").reverse().join("-"))
        : null;
      const inRange =
        (!start || purchaseDate >= start) && (!end || purchaseDate <= end);

      const matchesSearch = Object.keys(searchTerms).every((field) => {
        const fieldValue = getFieldValue(purchase, field);
        if (field === "number") {
          const normalized = searchTerms[field].replace(/^0+/, "").toLowerCase();
          return fieldValue.includes(normalized);
        }
        return fieldValue.includes(searchTerms[field].toLowerCase());
      });

      return inRange && matchesSearch;
    });
  }, [transactions, searchTerms, dateRange]);

  const renderSearchableHeader = withSharedSearchableProps({
    fieldFocus,
    searchingFields,
    localSearchTerms,
    setFieldFocus,
    setSearchingFields,
    handleSearchChange,
  });
  
  const columns: GridColDef[] = [
    {
        field: "date",
        headerName: "Fecha",
        flex: 1,
        minWidth: 120,
        sortable: true,
        hideSortIcons: true,
        disableColumnMenu: true,
        type: "dateTime",
        headerClassName: "bg-gray-800 text-white",
        renderHeader: () => (renderSearchableHeader("date", "Fecha")),
        valueGetter: (value) => new Date(value),
        valueFormatter: (value) => {
          const date = new Date(value);
          return date.toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }) + 
          " " +
          date.toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false, // Format of 24 hours
          });
        },
      },
    {
      field: "description",
      flex: 2,
      minWidth: 180,
      headerClassName: "bg-gray-800 text-white",
      sortable: false,
      disableColumnMenu: true,
      renderHeader: () => (renderSearchableHeader("description", "Descripción")),
    },
    { 
        field: "user", 
        flex: 1, 
        minWidth: 120,
        headerClassName: "bg-gray-800 text-white",
        sortable: false,
        disableColumnMenu: true,
        renderHeader: () => (renderSearchableHeader("user", "Usuario")),
        valueGetter: (params: User) => { return params ? params.username : "-"}
    },
    {
        field: "origin",
        flex: 1,
        minWidth: 120,
        headerClassName: "bg-gray-800 text-white",
        sortable: false,
        disableColumnMenu: true,
        
        renderHeader: () => renderSearchableHeader("origin", "Origen", [
        { value: "", text: "Todos" },
        { value: "Pago de venta", text: "Pago de venta" },
        { value: "Pago de compra", text: "Pago de compra" },
        { value: "Gasto", text: "Gasto" },
        { value: "Transacción", text: "Transacción" },
        ]),
    },
    {
        field: "paymentMethod",
        flex: 1,
        minWidth: 120,
        headerClassName: "bg-gray-800 text-white",
        sortable: false,
        disableColumnMenu: true,
        renderHeader: () => renderSearchableHeader("paymentMethod", "Método de Pago",[
        { value: "", text: "Todos" },
        { value: "Efectivo", text: "Efectivo" },
        { value: "Yape", text: "Yape" },
        { value: "Plin", text: "Plin" },
        { value: "Transferencia", text: "Transferencia" },
        { value: "Tarjeta", text: "Tarjeta" },
        ]),
    },
    {
        field: "amount",
        flex: 1,
        minWidth: 120,
        headerClassName: "bg-gray-800 text-white",
        sortable: false,
        disableColumnMenu: true,
        renderHeader: () => (renderSearchableHeader("amount", "Monto")),
        renderCell: (params) => {
          const { row } = params;
          const symbol = row.type === "Depósito" ? "+" : "-";
          const formattedAmount = `${symbol} S/ ${Number(row.amount).toFixed(2)}`;
      
          return <span>{formattedAmount}</span>;
        },
    },
    {
      field: "actions",
      sortable: false,
      disableColumnMenu: true,
      width: 80, 
      headerClassName: "bg-gray-800 text-white",
      renderHeader: () => (
        <div className="flex justify-center">
          <Menu size={18} />
        </div>
      ),
      renderCell: (params: GridRenderCellParams) => (
        <ActionsCell 
          params={params} 
          actions={[
            {
              label: "Editar",
              icon: <Edit size={16} className="text-blue-600" />,
              onClick: () => {
                if(params.row.origin === "Transacción"){
                  setSelectedTransactionId(params.row.transactionId);
                  setIsCreateModalOpen(true);
                } 
                else if(params.row.origin === "Pago de venta") router.push(`/sales/add-edit/${params.row.saleId}`);
                else if(params.row.origin === "Pago de compra") router.push(`/purchases/add-edit/${params.row.purchaseId}`);
              }
            },
            {
              label: "Anular",
              icon: <XCircle size={16} className="text-red-600" />,
              onClick: () => {},
            },
          ]}
        />
      ),
    },
  ];

  return (
    <QueryStateHandler
      errors={[
        { isLoading: isLoading, isError: isError, name: "Compras" },
      ]}
    >
    <ThemeProvider theme={theme}>
      <div className="flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 gap-4">
          <Header name="Transacciones" />
          {/* BUTTON NEW SALE */}
          <button
            className="top-table-btn-add"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <PlusCircleIcon className="w-5 h-5 mr-2" /> Nuevo cliente / proveedor
          </button>
        </div>
        
        {/* TOP BUTTONS */}
        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center gap-2">
            {/* CLOSE FILTERS BUTTON */}
            {Object.keys(searchingFields).length > 0 && (
              <button
                onClick={clearSearch}
                className="top-table-btn-clear"
              >
              <XCircle className="w-5 h-5 mr-2" /> Limpiar Filtros
              </button>
            )}
          </div>
          <DateRangePicker
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            onChange={(range) => setDateRange(range)}
          />
        </div>

        {/* DATA GRID */}
        <div className="flex flex-col mt-5">
          < DataGrid
            rows={filteredTransactions || []}
            getRowId={(row) => row.transactionId}
            columns={columns}
            localeText={esES.components.MuiDataGrid.defaultProps.localeText} // Spanish Footer
            getRowClassName={(params) =>
              params.indexRelativeToCurrentPage % 2 === 0 ? "even" : "odd"
            }
            slotProps={{ // Footer
              pagination: {
                sx: {
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                },
              },
            }}
            pageSizeOptions={[]}
            disableRowSelectionOnClick
            className="bg-white shadow rounded-lg border border-gray-200 !text-gray-700 "
            onCellClick={(params, event) => {
              if (params.field === "actions") {
                event.stopPropagation();
                return;
              }
              setFieldFocus("");
              if(params.row.origin === "Transacción"){
                setSelectedTransactionId(params.row.transactionId);
                setIsCreateModalOpen(true);
              } 
              else if(params.row.origin === "Pago de venta") router.push(`/sales/add-edit/${params.row.saleId}`);
              else if(params.row.origin === "Pago de compra") router.push(`/purchases/add-edit/${params.row.purchaseId}`);
            }}
          />
        </div>

        {/* MODAL CREATE/EDIT PRODUCT*/}
        <CreateTransactionModal
          isOpen={isCreateModalOpen} 
          onClose={() => {
            setSelectedTransactionId("");
            setIsCreateModalOpen(false);
          }}
          transactionId={selectedTransactionId} 
        />

      </div>
    </ThemeProvider>
    </QueryStateHandler>
  );
};

export default Transactions;
