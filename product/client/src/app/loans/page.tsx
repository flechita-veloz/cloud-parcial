"use client";

import { useGetLoansQuery } from "@/state/api";
import Header from "@/app/(components)/Header";
import { DataGrid, GridColDef} from "@mui/x-data-grid";
import { Menu, CircleCheck, CircleX, XCircle, PlusCircleIcon, Edit} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Client, User, Loan } from "@/state/api";
import { Tooltip } from "@mui/material";
import { esES } from "@mui/x-data-grid/locales";
import { useAppSelector } from "@/app/redux";
import getCustomTheme from "@/theme/customThemeDataGrid"; 
import { ThemeProvider } from "@mui/material/styles";
import { withSharedSearchableProps } from "@/app/(components)/SearchableHeader/whitSharedProps";
import ActionsCell from "@/app/(components)/ActionsCell"; 
import useColumnSearch from "@/app/hooks/useColumnSearch";
import QueryStateHandler from "@/app/(components)/QueryStateHandler";
import DateRangePicker from "@/app/(components)/DateRangePicker";

const Loans = () => {
  const { data: loans, isError, isLoading } = useGetLoansQuery();
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const theme = useMemo(() => getCustomTheme(isDarkMode ? 'dark' : 'light'), [isDarkMode]);
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

  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });

  const getFieldValue = (loan: Loan, field: string): string => {
    if (field === "client") return loan.client?.name?.toLowerCase() ?? "";
    if (field === "user") return loan.user?.username?.toLowerCase() ?? "";
    return loan[field as keyof Loan]?.toString().toLowerCase() ?? "";
  };

  const filteredLoans = useMemo(() => {
    return loans?.filter((loan) => {
      const loanDate = new Date(loan.date);
      const start = dateRange.startDate ? new Date(dateRange.startDate.split("/").reverse().join("-")) : null;
      const end = dateRange.endDate ? new Date(dateRange.endDate.split("/").reverse().join("-")) : null;
      const inRange =
        (!start || loanDate >= start) && (!end || loanDate <= end);

      return (
        inRange &&
        Object.keys(searchTerms).every((field) => {
          const fieldValue = getFieldValue(loan, field);
          if (field === "number") {
            const normalized = searchTerms[field].replace(/^0+/, '').toLowerCase();
            return fieldValue.includes(normalized);
          }
          return fieldValue.includes(searchTerms[field].toLowerCase());
        })
      );
    });
  }, [loans, searchTerms, dateRange]);
  
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
      field: "number",
      flex: 1,
      minWidth: 120,
      headerClassName: "bg-gray-800 text-white",
      sortable: false,
      disableColumnMenu: true,
      renderHeader: () => (renderSearchableHeader("number", "Pase")),
      renderCell: (params) => {
        const number = params.value;
        const formattedNumber = number < 10000 ? number.toString().padStart(4, '0') : number;
        return <span>{formattedNumber}</span>;
      },
    },
    { 
      field: "client", 
      flex: 2, 
      minWidth: 180,
      headerClassName: "bg-gray-800 text-white",
      sortable: false,
      disableColumnMenu: true,
      renderHeader: () => (renderSearchableHeader("client", "Cliente")),
      valueGetter: (params: Client) => { return params ? params.name : "-"}
    },

    {
      field: "state",
      flex: 1,
      minWidth: 120,
      headerClassName: "bg-gray-800 text-white",
      sortable: false,
      disableColumnMenu: true,
      renderHeader: () => 
        renderSearchableHeader("state", "Estado", [
        { value: "", text: "Todos" },
        { value: "POR DEVOLVER", text: "Por devolver" },
        { value: "DEVUELTO", text: "Devuelto" },
        ]),
      renderCell: (params) => {
        const isPaid = params.row.state === "DEVUELTO";
        const Icon = isPaid ? CircleCheck : CircleX;
        const stateStyle = isPaid
          ? "bg-green-100 text-green-700"
          : "bg-red-100 text-red-700";
  
        return (
          <div className="flex items-center gap-2">
            <Tooltip title={params.row.state} arrow>
              <div
                className={`w-6 h-6 flex items-center justify-center rounded-full ${stateStyle} cursor-pointer transition-all hover:scale-110`}
              >
                <Icon size={20} />
              </div>
            </Tooltip>
            <span> {params.row.state}</span>
          </div>
        );
      },
    },

    {
      field: "totalAmount",
      flex: 1,
      minWidth: 120,
      headerClassName: "bg-gray-800 text-white",
      sortable: false,
      disableColumnMenu: true,
      renderHeader: () => (renderSearchableHeader("totalAmount", "Total")),
      renderCell: (params) => {
        return (
          <div className="flex items-center gap-2">
            <span>S/ {params.row.totalAmount}</span>
          </div>
        );
      },
    },
    
    {
      field: "date",
      headerName: "Fecha",
      flex: 1,
      minWidth: 120,
      headerClassName: "bg-gray-800 text-white",
      sortable: true,
      hideSortIcons: true,
      disableColumnMenu: true,
      type: "dateTime",
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
      field: "user", 
      flex: 1,
      minWidth: 120,
      headerClassName: "bg-gray-800 text-white",
      sortable: false,
      disableColumnMenu: true,
      renderHeader: () => (renderSearchableHeader("user", "Usuario")),
      valueGetter: (params: User) => { return params.username }
    },
    {
      field: "actions",
      headerClassName: "bg-gray-800 text-white",
      sortable: false,
      disableColumnMenu: true,
      width: 80, 
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
            onClick: () => router.push(`/loans/add-edit/${params.row.loanId}`),
          },
        ]}
      />,
    },
  ];
  
  return (
    <QueryStateHandler
      errors={[
        { isLoading: isLoading, isError: isError, name: "Pases" },
      ]}
    >
      <ThemeProvider theme={theme}>
        <div className="flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 gap-4">
            <Header name="Pases" />
            {/* BUTTON NEW SALE */}
            <button
              className="top-table-btn-add"
              onClick={() => router.push("/loans/add-edit")}
            >
              <PlusCircleIcon className="w-5 h-5 mr-2" /> Nuevo Pase
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


          {/* COLUMNS */}
          <div className="flex flex-col mt-5">
            <DataGrid
              rows={filteredLoans || []}
              getRowId={(row) => row.loanId}
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
                router.push(`/loans/add-edit/${params.row.loanId}`);
              }}
            />
          </div>
        </div>
      </ThemeProvider>
    </QueryStateHandler>
  );
};

export default Loans;
