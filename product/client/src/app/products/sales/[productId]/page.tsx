"use client";

import { useRef, useState, useEffect, useMemo} from "react";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { esES } from "@mui/x-data-grid/locales";
import { useParams, useRouter } from "next/navigation";
import { useGetSalesByProductIdQuery, useGetProductByIdQuery } from "@/state/api";
import { Menu, MoreVertical, Eye, ArrowLeft } from "lucide-react";
import { useAppSelector } from "@/app/redux";
import getCustomTheme from "@/theme/customThemeDataGrid"; 
import { ThemeProvider } from "@mui/material/styles";

const SalesHistory = () => {
    const params = useParams();
    const productId = params?.productId as string;

    const { data: sales, error: isErrorSalesByProductId, isLoading: isLoadingSalesByProductId} =
        useGetSalesByProductIdQuery(productId, { skip: !productId });

    const { data: product, error: isErrorProductById, isLoading: isLoadingProductById} =
        useGetProductByIdQuery(productId, { skip: !productId });

    const router = useRouter();
    const handleSeeSales = (saleId: string) => {
        router.push(`/sales/add-edit/${saleId}`);
    };

    const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
    const theme = useMemo(() => getCustomTheme(isDarkMode ? 'dark' : 'light'), [isDarkMode]);
        
    const ActionsCell: React.FC<{ params: GridRenderCellParams }> = ({ params }) => {
        const [isOpen, setIsOpen] = useState(false);
        const menuRef = useRef<HTMLDivElement | null>(null);
        const buttonRef = useRef<HTMLButtonElement | null>(null);
    
        useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node) &&
                buttonRef.current !== event.target &&
                !buttonRef.current?.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
            };
    
            document.addEventListener("mousedown", handleClickOutside);
            return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            };
        }, []);
    
        return (
            <div className="absolute">
                {/* Botón de acciones */}
                <button
                    ref={buttonRef}
                    onClick={() => {
                        setIsOpen((prev) => !prev);
                    }}
                    className="rounded hover:bg-gray-200 p-1"
                >
                    <MoreVertical size={18} />
                </button>
    
                {/* Menú desplegable */}
                {isOpen && (
                    <div
                    ref={menuRef}
                    className="table-action w-45"
                    style={{
                        top: 0, 
                        right: "100%",
                    }}
                >
                    <button
                        className="w-35 table-action-btn-edit"
                        onClick={() => handleSeeSales(params.row.saleId)}
                    >
                        <Eye size={14} className="text-blue-600"/> Ver Venta
                    </button>
                </div>
                )}
            </div>
        );
    };

    const columns: GridColDef[] = [
        {
            field: "number",
            headerClassName: "bg-gray-800 text-white",
            sortable: false,
            disableColumnMenu: true,
            flex: 1,
            minWidth: 120,
            renderHeader: () => <strong>Venta</strong>,
        },
        {
            field: "date",
            headerClassName: "bg-gray-800 text-white",
            sortable: false,
            disableColumnMenu: true,
            type: "dateTime",
            valueGetter: (val) => new Date(val),
            flex: 2,
            minWidth: 180,
            renderHeader: () => <strong>Fecha</strong>,
        },
        {
            field: "user",
            headerClassName: "bg-gray-800 text-white",
            sortable: false,
            disableColumnMenu: true,
            flex: 2,
            minWidth: 180,
            renderHeader: () => <strong>Usuario</strong>,
        },
        {
            field: "client",
            headerClassName: "bg-gray-800 text-white",
            sortable: false,
            disableColumnMenu: true,
            flex: 2,
            minWidth: 180,
            renderHeader: () => <strong>Cliente</strong>,
        },
        {
            field: "price",
            headerClassName: "bg-gray-800 text-white",
            sortable: false,
            disableColumnMenu: true,
            flex: 1,
            minWidth: 120,
            renderHeader: () => <strong>Precio</strong>,
        },
        {
            field: "quantity",
            headerClassName: "bg-gray-800 text-white",
            sortable: false,
            disableColumnMenu: true,
            flex: 1,
            minWidth: 120,
            renderHeader: () => <strong>Cantidad</strong>,
        },
        {
            field: "total",
            headerClassName: "bg-gray-800 text-white",
            sortable: false,
            disableColumnMenu: true,
            flex: 1,
            minWidth: 120,
            renderHeader: () => <strong>Total</strong>,
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
            renderCell: (params) => <ActionsCell params={params} />,
          },
    ];

    const newSales = sales?.map((sale) => {
        return {
            ...sale,
            user: sale.user.names,
            client: sale.client.name,
            price: sale.saleDetails?.[0]?.unitPrice?.toFixed(2) || "0.00",
            quantity: sale.saleDetails?.[0]?.quantity || 0,
            total: sale.saleDetails?.[0] 
                ? (sale.saleDetails[0].unitPrice * sale.saleDetails[0].quantity).toFixed(2) 
                : "0.00",
        };
    }) || [];

    if (isLoadingSalesByProductId || isLoadingProductById) 
        return <div className="py-4 text-center">Cargando historial de ventas...</div>;

    if (isErrorSalesByProductId || isErrorProductById){
        return <div className="py-4 text-center">Error al obtener historial de ventas del producto...</div>;
    }
        

    return (
        <ThemeProvider theme={theme}>
            <div className="flex flex-col mt-5">
                <div className="flex items-center gap-3 mb-1">
                    <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700">
                    <ArrowLeft size={20} />
                    </button>
                    <p className="text-sm text-gray-500 uppercase tracking-wide">Historial de ventas</p>
                </div>
                <h1 className="text-2xl mb-4 font-semibold text-gray-700">{product?.name}</h1>
                <DataGrid
                    rows={newSales} // Usamos el nuevo array con datos de ventas
                    columns={columns}
                    getRowId={(row) => row.saleId}
                    localeText={esES.components.MuiDataGrid.defaultProps.localeText}
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
                    className="bg-white shadow rounded-lg border border-gray-200 !text-gray-700"
                    onCellClick={(params, event) => {
                        if (params.field === "actions") {
                        event.stopPropagation();
                        return;
                        }
                    }}
                />
            </div>
        </ThemeProvider>
    );
};

export default SalesHistory;
