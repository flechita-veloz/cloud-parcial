"use client";
import { useGetPurchasesQuery } from "@/state/api";
import Header from "@/app/(components)/Header";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Menu, Edit,XCircle, PlusCircleIcon, CircleCheck, CircleX } from "lucide-react";
import { useRouter } from "next/navigation";
import { Tooltip } from "@mui/material";
import { Client, User, Purchase} from "@/state/api";
import { esES } from "@mui/x-data-grid/locales";
import { useAppSelector } from "@/app/redux";
import getCustomTheme from "@/theme/customThemeDataGrid"; 
import { ThemeProvider } from "@mui/material/styles";
import { withSharedSearchableProps } from "@/app/(components)/SearchableHeader/whitSharedProps";
import ActionsCell from "@/app/(components)/ActionsCell"; 
import useColumnSearch from "@/app/hooks/useColumnSearch";
import QueryStateHandler from "@/app/(components)/QueryStateHandler";
import { useMemo, useState } from "react";
import DateRangePicker from "@/app/(components)/DateRangePicker";

const Purchases = () => {
  const { data: purchases, isError, isLoading } = useGetPurchasesQuery();
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
  
  const getFieldValue = (loan: Purchase, field: string): string => {
    if (field === "supplier") return loan.supplier?.name?.toLowerCase() ?? "";
    if (field === "user") return loan.user?.username?.toLowerCase() ?? "";
    return loan[field as keyof Purchase]?.toString().toLowerCase() ?? "";
  };

  const filteredPurchases = useMemo(() => {
    return purchases?.filter((purchase) => {
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
  }, [purchases, searchTerms, dateRange]);

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
      renderHeader: () => (renderSearchableHeader("number", "Compra")),
      renderCell: (params) => {
        const number = params.value;
        const formattedNumber = number < 10000 ? number.toString().padStart(4, '0') : number;
        return <span>{formattedNumber}</span>;
      },
    },
    { 
        field: "billingNumber", 
        flex: 1, 
        minWidth: 120,
        headerClassName: "bg-gray-800 text-white",
        sortable: false,
        disableColumnMenu: true,
        renderHeader: () =>  (renderSearchableHeader("billingNumber", "Boleta / Factura")),
        valueGetter: (value) => { return value ? value : "-"}
    },
    { 
        field: "supplier", 
        flex: 2, 
        minWidth: 180,
        headerClassName: "bg-gray-800 text-white",
        sortable: false,
        disableColumnMenu: true,
        renderHeader: () =>  (renderSearchableHeader("supplier", "Proveedor")),
        valueGetter: (params: Client) => { return params ? params.name : "-"}
    },
    {
      field: "totalAmount",
      flex: 1,
      minWidth: 120,
      headerClassName: "bg-gray-800 text-white",
      sortable: false,
      disableColumnMenu: true,
      renderHeader: () => 
        renderSearchableHeader("state", "Estado", [
        { value: "", text: "Todos" },
        { value: "PAGADO", text: "Pagado" },
        { value: "DEUDA", text: "Deuda" },
        { value: "CANCELADO", text: "Cancelado" },
        ]),
      renderCell: (params) => {
        const isPaid = params.row.state === "Pagado";
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
      sortable: false,
      headerClassName: "bg-gray-800 text-white",
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
              onClick: () => router.push(`/purchases/add-edit/${params.row.purchaseId}`),
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
          <Header name="Compras" />
          {/* BUTTON NEW SALE */}
          <button
            className="top-table-btn-add"
            onClick={() => router.push("/purchases/add-edit")}
          >
            <PlusCircleIcon className="w-5 h-5 mr-2" /> Nueva compra
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

          {/* DATE RANGE PICKER */}
          <DateRangePicker
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            onChange={(range) => setDateRange(range)}
          />
          </div>

        {/* COLUMNS */}
        <div className="flex flex-col mt-5">
          <DataGrid
            rows={filteredPurchases || []}
            getRowId={(row) => row.purchaseId}
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
              router.push(`/purchases/add-edit/${params.row.purchaseId}`);
            }}
          />
        </div>
      </div>
    </ThemeProvider>
    </QueryStateHandler>
  );
};

export default Purchases;
