"use client";

import { useDeleteProductsMutation, useGetProductsQuery, Product} from "@/state/api";
import Header from "@/app/(components)/Header";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Search, MoreVertical, Trash2, Edit, History, Menu, XCircle, PlusCircleIcon} from "lucide-react";
import { useRef, useState, useEffect, ReactNode, useMemo, useCallback} from "react";
import CreateProductModal from "./CreateProductModal";
import RemoveProductsModal from "./RemoveProductsModal";
import { esES } from "@mui/x-data-grid/locales";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/app/redux";
import debounce from "lodash/debounce";
import getCustomTheme from "@/theme/customThemeDataGrid"; 
import { ThemeProvider } from "@mui/material/styles";
import { Button } from "@/components/ui/button";

type ProductFormData = {
  productId: string;
  name: string;
  price: number;
  stockQuantity: number;
  code: string;
  typeTax: string;
  valueTax: number;
  includeTax: boolean;
};

const Products = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [isOnButtonDelete, setIsOnButtonDelete] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const { data: products, isError, isLoading } = useGetProductsQuery();
  const [deleteProducts] = useDeleteProductsMutation();
  const [searchTerms, setSearchTerms] = useState<{ [key: string]: string }>({});
  const [searchingFields, setSearchingFields] = useState<{ [key: string]: boolean }>({});
  const [fieldFocus, setFieldFocus] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<ProductFormData | null>(null);
  const [confirmDeleteCallback, setConfirmDeleteCallback] = useState<(() => void) | null>(null);
  const [deleteMessage, setDeleteMessage] = useState<ReactNode>("");
  const [localSearchTerms, setLocalSearchTerms] = useState<{ [key: string]: string }>({});
  const router = useRouter();
  const handleShowSalesHistory = (productId: string) => {
    router.push(`products/sales/${productId}`); // Redirige con el ID del producto
  };

  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const theme = useMemo(() => getCustomTheme(isDarkMode ? 'dark' : 'light'), [isDarkMode]);
  

  const handleDeleteSelected = useCallback(async () => {
    return new Promise((resolve) => {
      if (selectedRows.length === 0) return;

      const message = (
        <>
          ¿Está seguro de eliminar <strong>{selectedRows.length} producto(s)</strong>?
        </>
      );

      setDeleteMessage(message);

      setConfirmDeleteCallback(() => async () => {
        await deleteProducts(selectedRows);
        setSelectedRows([]);
        setIsRemoveModalOpen(false);
        resolve(true);
      });

      setIsRemoveModalOpen(true);
    });
  }, [
    selectedRows,
    deleteProducts,
    setDeleteMessage,
    setConfirmDeleteCallback,
    setIsRemoveModalOpen,
    setSelectedRows,
  ]);


  useEffect(() => {
    if (selectedRows.length > 0 && isOnButtonDelete) {
      handleDeleteSelected(); // Luego llama a la función cuando selectedRows cambia
      setIsOnButtonDelete(false);
      setSelectedRows([]);
    }
  }, [selectedRows, isOnButtonDelete, handleDeleteSelected]);


  const debouncedSetSearchTerms = useMemo(() => 
    debounce((field: string, value: string) => {
      setSearchTerms(prev => ({ ...prev, [field]: value }));
    }, 300), // 300 ms delay
    []
  );
  
  const handleSearchChange = (field: string, value: string) => {
    setLocalSearchTerms(prev => ({ ...prev, [field]: value })); // actualización inmediata
    debouncedSetSearchTerms(field, value); // actualización retrasada
  };

  useEffect(() => {
    return () => {
      debouncedSetSearchTerms.cancel();
    };
  }, [debouncedSetSearchTerms]);
  
  const filteredProducts = useMemo(() => {
    if (!products) return [];

    return products.filter((product) =>
      Object.keys(searchTerms).every((field) =>
        product[field as keyof Product]?.toString().toLowerCase().includes(
          searchTerms[field].toLowerCase()
        )
      )
    );
  }, [products, searchTerms]);
  
  const clearSearch = () => {
    setSearchTerms({});
    setSearchingFields({});
    setLocalSearchTerms({});
    setFieldFocus("");
  }

  const SearchableHeader = ({ field, headerName }: { field: string, headerName: string }) => { // functional component
    const inputRef = useRef<HTMLInputElement>(null);
    useEffect(() => {
      if (fieldFocus === field && inputRef.current) {
        inputRef.current.focus();
      }
    });
    return (
      <div
        className="searchable-header-default group"
        onClick={() => {
          setFieldFocus(field);
          setSearchingFields((prev) => ({ ...prev, [field]: true }))
        }}
      >
        {!searchingFields[field] ? (
          <>
            {headerName} <Search size={16} className="icon" />
          </>
        ) : (
          <input
            ref={inputRef}
            type="text"
            placeholder={headerName}
            value={localSearchTerms[field] || ""}
            onChange={(e) => {
              handleSearchChange(field, e.target.value);
            }}
          />
        )}
      </div>
    );
  };

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
  
        {/* Actions */}
        {isOpen && (
          <div
          ref={menuRef}
          className="table-action w-45"
          style={{
            top: 0, 
            right: "100%", 
          }}
        >
          <button className="w-35 table-action-btn-edit"
            onClick={() => {
              setSelectedProduct(params.row);
              setIsCreateModalOpen(true);
            }}
            >
            <Edit size={16} className="text-blue-600"/> Editar
          </button>
          <button
              className="table-action-btn-edit"
              onClick={() => handleShowSalesHistory(params.row.productId)}
          >
              <History size={16} className="text-blue-600" /> Historial de ventas
          </button>
          <button className="table-action-btn-delete"
            onClick={() => {
              setIsOnButtonDelete(true);
              setSelectedRows([params.row.productId]);
            }}
            >
            <Trash2 size={16} className="text-red-600" /> Eliminar
          </button>
        </div>
        
        )}
      </div>
    );
  };

  const columns: GridColDef[] = [
    {
      field: "code",
      flex: 1, 
      minWidth: 120, 
      headerClassName: "bg-gray-800 text-white",
      sortable: false,
      disableColumnMenu: true,
      renderHeader: () => <SearchableHeader field="code" headerName="Código" />,
      valueFormatter: (value) => { return value ? value : "-" }
    },
    {
      field: "name",
      flex: 2, 
      minWidth: 180,
      headerClassName: "bg-gray-800 text-white",
      sortable: false,
      disableColumnMenu: true,
      renderHeader: () => <SearchableHeader field="name" headerName="Nombre" />,
      valueFormatter: (value) => { return value ? value : "-" }
    },
    {
      field: "price",
      flex: 1,
      minWidth: 120,
      headerClassName: "bg-gray-800 text-white",
      sortable: false,
      disableColumnMenu: true,
      renderHeader: () => <SearchableHeader field="price" headerName="Precio" />,
      renderCell: (params) => {
        const { row } = params;
        const formattedPrice= `S/ ${Number(row.price).toFixed(2)}`;
        return <span> {formattedPrice} </span>;
      }
    },
    {
      field: "stockQuantity",
      flex: 1,
      minWidth: 120,
      headerClassName: "bg-gray-800 text-white",
      sortable: false,
      disableColumnMenu: true,
      renderHeader: () => <SearchableHeader field="stockQuantity" headerName="Cantidad" />,
      valueFormatter: (value) => { return value ? value : "-" }
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
  

  if (isLoading) {
    return <div className="py-4">Loading...</div>;
  }

  if (isError || !products) {
    return (
      <div className="text-center text-red-500 py-4">Failed to fetch products</div>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <div className="flex flex-col">
        <Header name="Productos" />

        {/* TOP BUTTONS */}
        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center gap-2">
            {/* DELETE SELECTED BUTTON */}
            {selectedRows.length > 0 && !isOnButtonDelete && (
              <Button
                onClick={handleDeleteSelected}
                variant="deleteAction"
                className="flex items-center font-bold py-2 px-4 rounded"
              >
                <Trash2 className="w-5 h-5 mr-2" /> Eliminar Productos Seleccionados
              </Button>
            )}

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

          {/* BUTTON NEW PRODUCT */}
          <button
            className="top-table-btn-add"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <PlusCircleIcon className="w-5 h-5 mr-2" /> Nuevo Producto
          </button>
        </div>

        {/* DATA GRID */}
        <div className="flex flex-col mt-5">
          <DataGrid
            rows={filteredProducts || []}
            columns={columns}
            getRowId={(row) => row.productId}
            localeText={esES.components.MuiDataGrid.defaultProps.localeText} 
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
            checkboxSelection
            disableRowSelectionOnClick
            onRowSelectionModelChange={(newSelection) => {
              setFieldFocus("");
              setSelectedRows(newSelection as string[])
            }}
            onCellClick={(params, event) => {
              if (params.field === "actions" || params.field === "__check__") {
                event.stopPropagation();
                return;
              }
              setFieldFocus("");
              setSelectedProduct(params.row);
              setIsCreateModalOpen(true);
            }}
          />
        </div>

        {/* MODAL CREATE/EDIT PRODUCT*/}
        <CreateProductModal
          isOpen={isCreateModalOpen} 
          onClose={() => {
            setSelectedProduct(null);
            setIsCreateModalOpen(false);
          }}
          product={selectedProduct}
          // onSuccess={}
        />

        {/* MODAL REMOVE PRODUCTS */}
        <RemoveProductsModal
          isOpen={isRemoveModalOpen}
          message={deleteMessage}
          onClose={() => setIsRemoveModalOpen(false)}
          onConfirm={() => {
            if (confirmDeleteCallback) {
                confirmDeleteCallback();
            }
          }}
        />

      </div>
    </ThemeProvider>
  );
};

export default Products;
