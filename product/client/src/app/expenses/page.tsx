"use client";

import { useGetExpensesQuery, User, Expense} from "@/state/api";
import DateRangePicker from "@/app/(components)/DateRangePicker";
import Header from "@/app/(components)/Header";
import { DataGrid, GridColDef} from "@mui/x-data-grid";
import { Edit, Menu, XCircle, PlusCircleIcon} from "lucide-react";
import { useState, useMemo } from "react";
import CreateExpenseModal from "./CreateExpenseModal";
import { esES } from "@mui/x-data-grid/locales";
import { withSharedSearchableProps } from "@/app/(components)/SearchableHeader/whitSharedProps";
import { useAppSelector } from "@/app/redux";
import useColumnSearch from "@/app/hooks/useColumnSearch";
import QueryStateHandler from "@/app/(components)/QueryStateHandler";
import ActionsCell from "@/app/(components)/ActionsCell"; 
import getCustomTheme from "@/theme/customThemeDataGrid"; 
import { ThemeProvider } from "@mui/material/styles";

const Expenses = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { data: expenses, isError, isLoading } = useGetExpensesQuery();
  const [selectedExpenseId, setSelectedExpenseId] = useState<string>("");
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });
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

  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const theme = useMemo(() => getCustomTheme(isDarkMode ? 'dark' : 'light'), [isDarkMode]);
  
  const getFieldValue = (expense: Expense, field: string): string => {
    if (field === "user") return expense.user?.username?.toLowerCase() ?? "";
    return expense[field as keyof Expense]?.toString().toLowerCase() ?? "";
  };

  const normalizedExpenses = expenses?.map((expense) => ({
    ...expense,
    description: expense.transaction?.description ?? "",
    date: expense.transaction?.date ?? "",
    paymentMethod: expense.transaction?.paymentMethod ?? "",
    amount: expense.transaction?.amount ?? "",
  }));

  const filteredExpenses = useMemo(() => {
    return normalizedExpenses?.filter((expense) => {
      const expenseDate = new Date(expense.date);
      const start = dateRange.startDate
        ? new Date(dateRange.startDate.split("/").reverse().join("-"))
        : null;
      const end = dateRange.endDate
        ? new Date(dateRange.endDate.split("/").reverse().join("-"))
        : null;
      const inRange =
        (!start || expenseDate >= start) && (!end || expenseDate <= end);

      return (
        inRange &&
        Object.keys(searchTerms).every((field) => {
          const fieldValue = getFieldValue(expense, field);
          if (field === "number") {
            const normalized = searchTerms[field].replace(/^0+/, "").toLowerCase();
            return fieldValue.includes(normalized);
          }
          return fieldValue.includes(searchTerms[field].toLowerCase());
        })
      );
    });
  }, [normalizedExpenses, searchTerms, dateRange]);

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
        valueFormatter: (value) => {
          if (!value) return "-";
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
        flex: 1, 
        minWidth: 120,
        headerClassName: "bg-gray-800 text-white",
        sortable: false,
        disableColumnMenu: true,
        renderHeader: () => (renderSearchableHeader("description", "Descripción")),
        valueFormatter: (value) => { return value ? value : "-" }
    },
    {
        field: "paymentMethod",
        headerName: "Método de Pago",
        flex: 1,
        minWidth: 120,
        headerClassName: "bg-gray-800 text-white",
        sortable: false,
        disableColumnMenu: true,
        renderHeader: () => (renderSearchableHeader("paymentMethod", "Método de Pago")),
        valueFormatter: (value) => { return value ? value : "-" }
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
      renderCell: (params) => 
      <ActionsCell 
        params={params} 
        actions={[
          {
            label: "Editar",
            icon: <Edit size={16} className="text-blue-600" />,
            onClick: () => {
              setSelectedExpenseId(params.row.expenseId);
              setIsCreateModalOpen(true);
            },
          },
          {
            // {params.row.state !== "Anulado" && (
            label: "Anular",
            icon: <XCircle size={16} className="text-red-600" />,
            onClick: () => {},
          },
        ]}
      />,
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
          <Header name="Gastos" />
          {/* BUTTON NEW EXPENSE */}
          <button
            className="top-table-btn-add"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <PlusCircleIcon className="w-5 h-5 mr-2 " /> Nuevo gasto
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
          <DataGrid
            rows={filteredExpenses || []}
            getRowId={(row) => row.expenseId}
            columns={columns}
            localeText={esES.components.MuiDataGrid.defaultProps.localeText} // Spanish Footer
            getRowClassName={(params) =>
              params.indexRelativeToCurrentPage % 2 === 0 ? "even" : "odd"
            }
            slotProps={{
              // Footer
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
              setSelectedExpenseId(params.row.expenseId);
              setIsCreateModalOpen(true);
            }}
          />
        </div>

        {/* MODAL CREATE/EDIT PRODUCT*/}
        <CreateExpenseModal
          isOpen={isCreateModalOpen} 
          onClose={() => {
            setSelectedExpenseId("");
            setIsCreateModalOpen(false);
          }}
          expenseId={selectedExpenseId} 
        />

      </div>
    </ThemeProvider>
    </QueryStateHandler>
  );
};

export default Expenses;
