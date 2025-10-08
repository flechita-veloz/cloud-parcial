"use client";

import { useGetSalesQuery } from "@/state/api";
import Header from "@/app/(components)/Header";
import { DataGrid, GridColDef} from "@mui/x-data-grid";
import { CircleCheck, CircleX, Menu, Edit, Download, 
          XCircle,PlusCircleIcon} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useMemo, useCallback } from "react";
import { Tooltip } from "@mui/material";
import { Billing, Client, User, Sale } from "@/state/api";
import { esES } from "@mui/x-data-grid/locales";
import DownloadOptionsModal from "@/app/sales/DownloadOptionsModal"; 
import { useAppSelector } from "@/app/redux";
import getCustomTheme from "@/theme/customThemeDataGrid"; 
import { ThemeProvider } from "@mui/material/styles";
import { withSharedSearchableProps } from "@/app/(components)/SearchableHeader/whitSharedProps";
import useColumnSearch from "@/app/hooks/useColumnSearch";
import ActionsCell from "@/app/(components)/ActionsCell"; 
import QueryStateHandler from "@/app/(components)/QueryStateHandler";
import DateRangePicker from "@/app/(components)/DateRangePicker";

const Sales = () => {
  const { data: sales, isError, isLoading } = useGetSalesQuery();
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const theme = useMemo(() => getCustomTheme(isDarkMode ? 'dark' : 'light'), [isDarkMode]);
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [billing, setBilling] = useState<Billing | null>(null);
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

  // COLORS FOR DIFFERENTS STATES OF BILLINGS
  const getBillingStateColor = (state: string): { text: string; bg: string } => {
    switch (state) {
      case "ACEPTADO":
        return { text: "text-green-600", bg: "bg-green-100" };
      case "PENDIENTE":
        return { text: "text-yellow-600", bg: "bg-yellow-100" };
      case "EXCEPCION":
        return { text: "text-orange-600", bg: "bg-orange-100" };
      case "RECHAZADO":
        return { text: "text-red-600", bg: "bg-red-100" };
      default:
        return { text: "text-gray-600", bg: "bg-gray-200" };
    }
  };
  
  // STANDARD FORMAT OF BILLING IN PERU
  const formatBillingNumber = useCallback((billing: Billing) => {
    const prefix = billing.type === "Boleta" ? "B00" : "F00";
    const branchCode = "01"; 
    const formattedNumber = billing.number.toString().padStart(4, "0");

    return `${prefix}${branchCode} ${formattedNumber}`;
  }, []);

  const getFieldValue = useCallback((sale: Sale, field: string): string => {
    if (field === "client") return sale.client?.name?.toLowerCase() ?? "";
    if (field === "user") return sale.user?.username?.toLowerCase() ?? "";
    if (field === "billing") {
      if (!sale.billing) return "";
      return sale.billing ? formatBillingNumber(sale.billing).toLowerCase() : "";
    }
    return sale[field as keyof Sale]?.toString().toLowerCase() ?? "";
  }, [formatBillingNumber]);

  
  const filteredSales = useMemo(() => {
    return sales?.filter((sale) => {
      const saleDate = new Date(sale.date);
      const start = dateRange.startDate ? new Date(dateRange.startDate) : null;
      const end = dateRange.endDate ? new Date(dateRange.endDate) : null;
      
      const inRange =
        (!start || saleDate >= start) && (!end || saleDate <= end);

      const matchesSearch = Object.keys(searchTerms).every((field) => {
        const fieldValue = getFieldValue(sale, field);
        if (field === "number") {
          const normalized = searchTerms[field].replace(/^0+/, '').toLowerCase();
          return fieldValue.includes(normalized);
        }
        return fieldValue.includes(searchTerms[field].toLowerCase());
      });

      return inRange && matchesSearch;
    });
  }, [sales, dateRange.startDate, dateRange.endDate, searchTerms, getFieldValue]);

  const renderSearchableHeader = withSharedSearchableProps({
    fieldFocus,
    searchingFields,
    localSearchTerms,
    setFieldFocus,
    setSearchingFields,
    handleSearchChange,
  });

  const handleOpenModal = (row: Sale) => {
    setSelectedSale(row);
    setBilling(row.billing ?? null);
    setIsModalOpen(true);
  };

  const columns: GridColDef[] = [
    {
      field: "number",
      flex: 1,
      minWidth: 120,
      headerClassName: "bg-gray-800 text-white",
      sortable: false,
      disableColumnMenu: true,
      renderHeader: () => (renderSearchableHeader("number", "Venta")),
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
      field: "totalAmount",
      flex: 1,
      minWidth: 120,
      headerClassName: "bg-gray-800 text-white",
      sortable: false,
      disableColumnMenu: true,
      renderHeader: () => 
        renderSearchableHeader("state", "Estado", [
          { value: "", text: "Todos" },
          { value: "Pagado", text: "Pagado" },
          { value: "Deuda", text: "Deuda" },
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
      field: "origin", 
      flex: 1, 
      minWidth: 120,
      headerClassName: "bg-gray-800 text-white",
      sortable: false,
      disableColumnMenu: true,
      renderHeader: () => (renderSearchableHeader("origin", "Origen")),
    },
    {
      field: "billing",
      headerClassName: "bg-gray-800 text-white",
      flex: 1,
      minWidth: 150,
      sortable: false,
      disableColumnMenu: true,
      renderHeader: () => (renderSearchableHeader("billing", "Boleta/Factura")),
      renderCell: (params) => {
        const billing = params.row.billing;
        if (billing) {
          const { text, bg } = getBillingStateColor(billing.state);
          const formattedNumber = formatBillingNumber(billing);
          return (
            <div className="flex items-center gap-2">
              <span>{formattedNumber}</span>
              <div
                className={`px-2 py-0.5 rounded-full text-xs font-semibold ${text} ${bg}`}
              >
                {billing.state}
              </div>
            </div>
          );
        }
        return <span className="text-gray-400">-</span>;
      },
      valueGetter: (params: Billing) => { return params ? params.number : "-"}
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
      renderCell: (params) => (
        <ActionsCell
          params={params}
          actions={[
            {
              label: "Editar",
              icon: <Edit size={16} />,
              onClick: () => router.push(`/sales/add-edit/${params.row.saleId}`),
            },
            {
              label: "Descargar",
              icon: <Download size={16} />,
              onClick: () => handleOpenModal(params.row),
            },
          ]}
        />
      ),
    }
  ];

  return (
    <QueryStateHandler
      errors={[
        { isLoading: isLoading, isError: isError, name: "Ventas" },
      ]}
    >
    <ThemeProvider theme={theme}>
      <div className="flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 gap-4">
          <Header name="Ventas" />
          {/* BUTTON NEW SALE */}
          <button
            className="top-table-btn-add"
            onClick={() => router.push("/sales/add-edit")}
          >
            <PlusCircleIcon className="w-5 h-5 mr-2" /> Nueva venta
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
            rows={filteredSales || []}
            getRowId={(row) => row.saleId}
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
              router.push(`/sales/add-edit/${params.row.saleId}`);
            }}
          />
        </div>
      </div>
      {isModalOpen && selectedSale && billing && (
        <DownloadOptionsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          sale={selectedSale}
          billing={billing}
          billingStatus="PENDIENTE"
        />
      )}
    </ThemeProvider>
    </QueryStateHandler>
  );
};

export default Sales;
