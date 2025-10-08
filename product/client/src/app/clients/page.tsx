"use client";

import { useDeleteClientMutation, useGetClientsQuery, Client} from "@/state/api";
import Header from "@/app/(components)/Header";
import { DataGrid, GridColDef} from "@mui/x-data-grid";
import { Trash2, Edit, Menu, XCircle,PlusCircleIcon} from "lucide-react";
import { useState, useEffect, ReactNode, useMemo, useCallback } from "react";
import CreateClientModal from "./CreateClientModal";
import RemoveClientModal from "./RemoveClientModal";
import { esES } from "@mui/x-data-grid/locales";
import { useAppSelector } from "@/app/redux";
import getCustomTheme from "@/theme/customThemeDataGrid"; 
import { ThemeProvider } from "@mui/material/styles";
import useColumnSearch from "@/app/hooks/useColumnSearch";
import QueryStateHandler from "@/app/(components)/QueryStateHandler";
import { withSharedSearchableProps } from "@/app/(components)/SearchableHeader/whitSharedProps";
import ActionsCell from "@/app/(components)/ActionsCell";

type ClientDocument = {
  number: string;
  typeDocument: string;
}

type ClientFormData = {
  clientId: string;
  name: string;
  document?: ClientDocument | null;
  type: string;
  phone?: string;
  mail?: string;
  address?: string;
};

const DEFAULT_DOCUMENT_TYPE = "DNI";

const Clients = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [isOnButtonDelete, setIsOnButtonDelete] = useState(false);
  const { data: clients, isError, isLoading } = useGetClientsQuery();
  const [deleteClient] = useDeleteClientMutation();
  const [selectedClient, setSelectedClient] = useState<ClientFormData>({
    clientId: "",
    name: "",
    type: "Cliente",
    phone: "",
    mail: "",
    address: "",
    document: { number: "", typeDocument: DEFAULT_DOCUMENT_TYPE },
  });
  const [confirmDeleteCallback, setConfirmDeleteCallback] = useState<(() => void) | null>(null);
  const [deleteMessage, setDeleteMessage] = useState<ReactNode>("");
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const theme = useMemo(() => getCustomTheme(isDarkMode ? 'dark' : 'light'), [isDarkMode]);
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
  
  const handleDeleteSelected = useCallback(async () => {
    return new Promise((resolve) => {
      if (!selectedClient.clientId) return; 

      const message = (
        <>
          ¿Está seguro de eliminar al cliente <strong>{selectedClient.name}</strong>?
        </>
      );

      setDeleteMessage(message); 

      setConfirmDeleteCallback(() => async () => {
        await deleteClient(selectedClient.clientId); 
        setSelectedClient({
          clientId: "",
          name: "",
          type: "Cliente",
          phone: "",
          mail: "",
          address: "",
          document: { number: "", typeDocument: DEFAULT_DOCUMENT_TYPE },
      });
        setIsRemoveModalOpen(false);
        resolve(true);
      });

      setIsRemoveModalOpen(true); 
    });
  }, [selectedClient, deleteClient, setDeleteMessage, setConfirmDeleteCallback, setIsRemoveModalOpen, setSelectedClient]);


  useEffect(() => {
    if (isOnButtonDelete) {
      handleDeleteSelected(); // Luego llama a la función cuando selectedRows cambia
      setIsOnButtonDelete(false);
    }
  }, [handleDeleteSelected, isOnButtonDelete]);
  
  
  const getFieldValue = (client: Client, field: string): string => {
    if (field === "document") return client.document?.number?.toLowerCase() ?? "";
    return client[field as keyof Client]?.toString().toLowerCase() ?? "";
  };
  
  const filteredClients = useMemo(() => {
    return clients?.filter((client) => {
      return (
        Object.keys(searchTerms).every((field) => {
          const fieldValue = getFieldValue(client, field);
          return fieldValue.includes(searchTerms[field].toLowerCase());
        })
      );
    });
  }, [clients, searchTerms]);

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
      field: "name",
      flex: 2, 
      minWidth: 180, 
      headerClassName: "bg-gray-800 text-white",
      sortable: false,
      disableColumnMenu: true,
      renderHeader: () => (renderSearchableHeader("name", "Nombre/Razón Social")),
    },
    {
      field: "document",
      flex: 1,
      minWidth: 120,
      headerClassName: "bg-gray-800 text-white",
      sortable: false,
      disableColumnMenu: true,
      renderHeader: () => (renderSearchableHeader("document", "Documento")),
      renderCell: (params) => (
        <span>
          <strong>{params.formattedValue ? params.formattedValue.typeDocument : "SIN DOCUMENTO"}</strong> {" "}
          {params.formattedValue? params.formattedValue.number : "00000000"}
        </span>
      ),
    },
    {
      field: "type",
      flex: 1,
      minWidth: 120,
      headerClassName: "bg-gray-800 text-white",
      sortable: false,
      disableColumnMenu: true,
      renderHeader: () => 
        renderSearchableHeader("type", "Tipo", [
        { value: "", text: "Todos" },
        { value: "Cliente", text: "Cliente" },
        { value: "Proveedor", text: "Proveedor" },
        { value: "Cliente/Proveedor", text: "Cliente/Proveedor" },
        ]),
    },
    {
        field: "address",
        flex: 2,
        minWidth: 180,
        headerClassName: "bg-gray-800 text-white",
        sortable: false,
        disableColumnMenu: true,
        renderHeader: () => (renderSearchableHeader("address", "Dirección")),
    },
    {
        field: "phone",
        flex: 1,
        minWidth: 120,
        headerClassName: "bg-gray-800 text-white",
        sortable: false,
        disableColumnMenu: true,
        renderHeader: () => (renderSearchableHeader("phone", "Teléfono")),
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
              setSelectedClient(params.row);
              setIsCreateModalOpen(true);
            },
          },
          {
            label: "Editar",
            icon: <Trash2 size={16} className="text-red-600" />,
            onClick: () => {
              setSelectedClient(params.row);
              setIsOnButtonDelete(true);
            },
          }
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
        <Header name="Clientes"/>
        
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

          {/* BUTTON NEW CLIENT */}
          <button
            className="top-table-btn-add"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <PlusCircleIcon className="w-5 h-5 mr-2" />
            Nuevo cliente / proveedor
          </button>
        </div>

        {/* DATA GRID */}
        <div className="flex flex-col mt-5">
          < DataGrid
            rows={filteredClients || []}
            getRowId={(row) => row.clientId}
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
            onCellClick={(params, event) => {
              if (params.field === "actions") {
                event.stopPropagation();
                return;
              }
              setFieldFocus("");
              setSelectedClient(params.row);
              setIsCreateModalOpen(true);
            }}
          />
        </div>

        {/* MODAL CREATE/EDIT PRODUCT*/}
        <CreateClientModal
          isOpen={isCreateModalOpen} 
          onClose={() => {
            setSelectedClient({
              clientId: "",
              name: "",
              type: "Cliente",
              phone: "",
              mail: "",
              address: "",
              document: { number: "", typeDocument: DEFAULT_DOCUMENT_TYPE },
            });
            setIsCreateModalOpen(false);
          }}
          client = {selectedClient}
        />

        {/* MODAL REMOVE PRODUCTS */}
        <RemoveClientModal
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
  </QueryStateHandler>
  );
};

export default Clients;
