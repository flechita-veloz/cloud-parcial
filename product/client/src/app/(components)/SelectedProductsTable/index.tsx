"use client";

import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Product } from "@/state/api";
import getCustomTheme from "@/theme/customThemeDataGrid"; 
import { ThemeProvider } from "@mui/material/styles";
import { useAppSelector } from "@/app/redux";
import { useMemo } from "react";
import { Trash } from "lucide-react";

type Row = Product & {
  quantity: number;
  saleDetailId: string;
  status: string;
};
type Props = {
  selectedProducts: Row[];
  onFieldChange: (
    index: number,
    field: keyof Product | "quantity" | "status",
    value: string | number
  ) => void;
  onRemoveProduct: (index: number) => void;
  additionalColumns?: GridColDef[];
};

export default function SelectedProductsTable({ selectedProducts, onFieldChange, onRemoveProduct, additionalColumns }: Props) {
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const theme = useMemo(() => getCustomTheme(isDarkMode ? 'dark' : 'light'), [isDarkMode]);

  const baseColumns: GridColDef[] = [
    {
      field: "delete",
      headerName: "",
      width: 30,
      headerClassName: "bg-gray-800 text-white ",
      headerAlign: "right",
      align: "right",
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) => {
        const index = selectedProducts.findIndex(p => p.saleDetailId === params.row.saleDetailId);
        return (
          <div className="w-full h-full flex justify-center items-center">
            <button
              className="p-1 rounded text-gray-600 hover:text-red-600"
              onClick={() => {
                if (index !== -1) {
                  onRemoveProduct(index);
                }
              }}
            >
              <Trash size={18}/>
            </button>
          </div>
        );
      },
    },
  ];

  const remainingColumns: GridColDef[] = [
    {
      field: "name",
      headerName: "Producto",
      flex: 1.5,
      minWidth: 150,
      headerClassName: "bg-gray-800 text-white",
      sortable: false,
      disableColumnMenu: true,
      renderHeader: () => <span className="font-bold px-1">Producto</span>,
      renderCell: (params) => {
        const index = selectedProducts.findIndex(p => p.saleDetailId === params.row.saleDetailId);
        const product = selectedProducts[index];
        return (
          <div className="w-full h-full flex flex-col justify-center items-start gap-1 text-left">
            <textarea
              className="w-full text-sm text-gray-700 border rounded px-1 py-2 resize-none bg-white"
              value={params.value}
              onChange={(e) => {
                if (index !== -1) {
                  onFieldChange(index, "name", e.target.value);
                }
              }}
              onKeyDown={(e) => e.stopPropagation()}
            />
            <p className="text-gray-400 text-xs px-1">{product?.code || "-"}</p>
          </div>
        );
      },
    },
    {
      field: "quantity",
      headerName: "Cantidad",
      type: "number",
      flex: 1,
      minWidth: 100,
      headerClassName: "bg-gray-800 text-white ",
      headerAlign: "right",
      align: "right",
      sortable: false,
      disableColumnMenu: true,
      renderHeader: () => <span className="font-bold">Cantidad</span>,
      renderCell: (params) => (
        <div className="w-full h-full flex justify-end items-center">
          <input
            type="number"
            className="w-full border rounded px-2 py-1 text-sm bg-white"
            value={params.value}
            onChange={(e) => {
              const index = selectedProducts.findIndex(p => p.saleDetailId === params.row.saleDetailId);
              if (index !== -1) {
                onFieldChange(index, "quantity", Number(e.target.value));
              }
            }}
            onKeyDown={(e) => e.stopPropagation()}
          />
        </div>
      ),
    },
    {
      field: "price",
      headerName: "Precio U.",
      type: "number",
      flex: 1,
      minWidth: 100,
      headerClassName: "bg-gray-800 text-white ",
      headerAlign: "right",
      align: "right",
      sortable: false,
      disableColumnMenu: true,
      renderHeader: () => <span className="font-bold">Precio U.</span>,
      renderCell: (params) => (
        <div className="w-full h-full flex justify-end items-center">
          <input
            type="number"
            className="w-full border rounded px-2 py-1 text-sm bg-white"
            value={params.value}
            onChange={(e) => {
              const index = selectedProducts.findIndex(p => p.saleDetailId === params.row.saleDetailId);
              if (index !== -1) {
                onFieldChange(index, "price", Number(e.target.value));
              }
            }}
            onKeyDown={(e) => e.stopPropagation()}
          />
        </div>
      ),
    },
    {
      field: "typeTax",
      headerName: "Impuesto",
      flex: 1,
      minWidth: 120,
      headerClassName: "bg-gray-800 text-white ",
      headerAlign: "right",
      align: "right",
      sortable: false,
      disableColumnMenu: true,
      renderHeader: () => <span className="font-bold">Impuesto</span>,
      renderCell: (params) => (
        <div className="w-full h-full flex justify-end items-center">
          <select
            className="w-full border rounded px-2 py-1 text-sm bg-white"
            value={params.value}
            onChange={(e) => {
              const index = selectedProducts.findIndex(p => p.saleDetailId === params.row.saleDetailId);
              if (index !== -1) {
                onFieldChange(index, "typeTax", e.target.value);
              }
            }}
          >
            <option value="IGV (18.00%)">IGV (18.00%)</option>
            <option value="Exonerado (0.00%)">Exonerado (0.00%)</option>
            <option value="Inafecto (0.00%)">Inafecto (0.00%)</option>
            <option value="Gratuita (0.00%)">Gratuita (0.00%)</option>
            <option value="Exportación (0.00%)">Exportación (0.00%)</option>
          </select>
        </div>
      ),
    },
    {
      field: "subtotal",
      headerName: "Subtotal",
      type: "number",
      flex: 1,
      minWidth: 120,
      headerClassName: "bg-gray-800 text-white ",
      headerAlign: "right",
      align: "right",
      renderHeader: () => <span className="font-bold">Subtotal</span>,
      renderCell: (params) => {
        const { quantity, price, valueTax } = params.row;
        const subtotal = (quantity * price) / (1 + valueTax);
        return (
          <div className="w-full h-full flex justify-end items-center">
            <span>S/ {subtotal.toFixed(2)}</span>
          </div>
        );
      },
      sortable: false,
      disableColumnMenu: true,
    },
    {
      field: "total",
      headerName: "Total",
      type: "number",
      flex: 1,
      minWidth: 120,
      headerClassName: "bg-gray-800 text-white",
      headerAlign: "right",
      align: "right",
      renderHeader: () => <span className="font-bold">Total</span>,
      renderCell: (params) => {
        const { quantity, price } = params.row;
        const total = quantity * price;
        return (
          <div className="w-full h-full flex justify-end items-center">
            <span>S/ {total.toFixed(2)}</span>
          </div>
        );
      },
      sortable: false,
      disableColumnMenu: true,
    },
  ];

  const columns: GridColDef[] = [
    ...baseColumns,
    ...(additionalColumns ?? []),
    ...remainingColumns,
  ];

  return (
    <ThemeProvider theme={theme}>
      <div className="flex flex-col mt-5">
        <DataGrid
          getRowHeight={() => 'auto'}
          rows={selectedProducts}
          columns={columns}
          getRowId={(row) => row.saleDetailId}
          disableRowSelectionOnClick
          hideFooter
          className="bg-white shadow rounded-lg border border-gray-200 !text-gray-700"
        />
      </div>
    </ThemeProvider>
  );
}