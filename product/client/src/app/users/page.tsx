"use client";

import { useDeleteUserMutation, useGetUsersQuery, User} from "@/state/api";
import Header from "@/app/(components)/Header";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Search, MoreVertical, Trash2, Edit, Menu, XCircle, Filter, PlusCircleIcon} from "lucide-react";
import { useRef, useState, useEffect, ReactNode, useMemo, useCallback } from "react";
import CreateUserModal from "./CreateUserModal";
import RemoveUserModal from "./RemoveUserModal";
import { esES } from "@mui/x-data-grid/locales";
import { useAppSelector } from "@/app/redux";
import getCustomTheme from "@/theme/customThemeDataGrid"; 
import { ThemeProvider } from "@mui/material/styles";
import debounce from "lodash/debounce";

type selectedUser = {
  id: string;
  username: string;
}

const Users = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [isOnButtonDelete, setIsOnButtonDelete] = useState(false);
  const { data: users, isError, isLoading } = useGetUsersQuery();
  const [deleteUser] = useDeleteUserMutation();
  const [searchTerms, setSearchTerms] = useState<{ [key: string]: string }>({});
  const [searchingFields, setSearchingFields] = useState<{ [key: string]: boolean }>({});
  const [fieldFocus, setFieldFocus] = useState<string>("");
  const [localSearchTerms, setLocalSearchTerms] = useState<{ [key: string]: string }>({});
  const [selectedUser, setSelectedUser] = useState<selectedUser>({
      id: "",
      username: ""
  });
  const [confirmDeleteCallback, setConfirmDeleteCallback] = useState<(() => void) | null>(null);
  const [deleteMessage, setDeleteMessage] = useState<ReactNode>("");
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const theme = useMemo(() => getCustomTheme(isDarkMode ? 'dark' : 'light'), [isDarkMode]);
  
  const handleDeleteSelected = useCallback(async () => {
    return new Promise((resolve) => {
      if (!selectedUser.id) return;

      const message = (
        <>
          ¿Está seguro de eliminar al usuario <strong>{selectedUser.username}</strong>?
        </>
      );

      setDeleteMessage(message);

      setConfirmDeleteCallback(() => async () => {
        await deleteUser(selectedUser.id);
        setSelectedUser({ id: "", username: "" });
        setIsRemoveModalOpen(false);
        resolve(true);
      });

      setIsRemoveModalOpen(true);
    });
  }, [
    selectedUser,              // dependencias necesarias
    deleteUser,
    setDeleteMessage,
    setConfirmDeleteCallback,
    setSelectedUser,
    setIsRemoveModalOpen,
  ]);


  useEffect(() => {
    if (isOnButtonDelete) {
      handleDeleteSelected(); // Luego llama a la función cuando selectedRows cambia
      setIsOnButtonDelete(false);
    }
  }, [handleDeleteSelected, isOnButtonDelete]);

  
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

  
  const filteredUsers = useMemo(() => {
    if (!users) return [];

    return users.filter((user: User) =>
      Object.keys(searchTerms).every((field) => {
        const searchTerm = searchTerms[field].toLowerCase();
        const value = user[field as keyof User];
        return value?.toString().toLowerCase().includes(searchTerm);
      })
    );
  }, [users, searchTerms]);
  
  const clearSearch = () => {
    setSearchTerms({});
    setSearchingFields({});
    setLocalSearchTerms({});
    setFieldFocus("");
  }

  const SearchableHeader = ({ field, headerName }: { field: string, headerName: string }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    
    useEffect(() => {
      if (fieldFocus === field && inputRef.current) {
        inputRef.current.focus();
      }
    }, [field]);

    const Icon = field === "type" ? Filter : Search;
    return (
      <div
        className="searchable-header-default group"
        onClick={() => {
          setFieldFocus(field);
          setSearchingFields((prev) => ({ ...prev, [field]: true }));
        }}
      >
        {!searchingFields[field] ? (
          <>
            {headerName}
            <Icon size={16} className="icon" />
          </>
        ) : field === "type" ? (
          <select
            value={localSearchTerms[field] || ""}
            onChange={(e) => handleSearchChange(field, e.target.value)}
            onClick={(e) => e.stopPropagation()} 
          >
            <option value="">Todos</option>
            <option value="Dueño">Dueño</option>
            <option value="Vendedor">Vendedor</option>
            <option value="Almacenero">Almacenero</option>
            <option value="Contador">Contador</option>
          </select>
        ) : (
          <input
            ref={inputRef}
            type="text"
            placeholder={headerName}
            value={localSearchTerms[field] || ""}
            onChange={(e) => handleSearchChange(field, e.target.value)}
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
        {/* ACTIONS BUTTON */}
        <button
          ref={buttonRef}
          onClick={() => {
            setIsOpen((prev) => !prev);
          }}
          className="rounded hover:bg-gray-200 p-1"
        >
          <MoreVertical size={18} />
        </button>
  
        {/* ACTIONS */}
        {isOpen && (
          <div
            ref={menuRef}
            className="table-action w-36 "
            style={{
              top: 0, 
            }}
          >
            <button
              className="table-action-btn-edit"
              onClick={() => {
                setSelectedUser({
                  username: params.row.username,
                  id: params.row.userId
                });
                setIsCreateModalOpen(true);
              }}
            >
              <Edit size={16} className="text-blue-600" /> Editar
            </button>
            <button
              className="table-action-btn-delete"
              onClick={() => {
                setSelectedUser({
                  username: params.row.username,
                  id: params.row.userId
                });
                setIsOnButtonDelete(true);
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
      field: "username",
      flex: 2, 
      minWidth: 180, 
      headerClassName: "bg-gray-800 text-white",
      sortable: false,
      disableColumnMenu: true,
      renderHeader: () => <SearchableHeader field="username" headerName="Usuario" />,
    },
    {
      field: "names",
      flex: 2, 
      minWidth: 180, 
      headerClassName: "bg-gray-800 text-white",
      sortable: false,
      disableColumnMenu: true,
      renderHeader: () => <SearchableHeader field="names" headerName="Nombres" />,
    },
    {
      field: "surnames",
      flex: 2, 
      minWidth: 180, 
      headerClassName: "bg-gray-800 text-white",
      sortable: false,
      disableColumnMenu: true,
      renderHeader: () => <SearchableHeader field="surnames" headerName="Apellidos" />,
    },
    {
      field: "email",
      flex: 2, 
      minWidth: 180, 
      headerClassName: "bg-gray-800 text-white",
      sortable: false,
      disableColumnMenu: true,
      renderHeader: () => <SearchableHeader field="email" headerName="Email" />,
    },
    {
      field: "type",
      flex: 2, 
      minWidth: 180, 
      headerClassName: "bg-gray-800 text-white",
      sortable: false,
      disableColumnMenu: true,
      renderHeader: () => <SearchableHeader field="type" headerName="Tipo" />,
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
      renderCell: (params) => <ActionsCell params={params} />,
    },
  ];
  

  if (isLoading) {
    return <div className="py-4">Loading...</div>;
  }

  if (isError || !users) {
    return (
      <div className="text-center text-red-500 py-4">Failed to fetch users </div>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <div className="flex flex-col">
        <Header name="Usuarios"/>
        
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

          {/* BUTTON NEW USER */}
          <button
            className="top-table-btn-add"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <PlusCircleIcon className="w-5 h-5 mr-2" />
            Nuevo usuario
          </button>
        </div>

        {/* DATA GRID */}
        <div className="flex flex-col mt-5">
          < DataGrid
            rows={filteredUsers || []}
            getRowId={(row) => row.userId}
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
              setSelectedUser({
                username: params.row.username,
                id: params.row.userId
              });
              setIsCreateModalOpen(true);
            }}
          />
        </div>

        {/* MODAL CREATE/EDIT PRODUCT*/}
        <CreateUserModal
          isOpen={isCreateModalOpen} 
          onClose={() => {
            setSelectedUser({id: "", username: ""});
            setIsCreateModalOpen(false);
          }}
          userId={selectedUser.id}
        />

        {/* MODAL REMOVE PRODUCTS */}
        <RemoveUserModal
          isOpen={isRemoveModalOpen}
          message={deleteMessage}
          onClose={() => setIsRemoveModalOpen(false)}
          onConfirm={() => {
            if (confirmDeleteCallback) {
                confirmDeleteCallback();
            }
          }}
          username={selectedUser.username}
        />

      </div>
    </ThemeProvider>
  );
};

export default Users;
