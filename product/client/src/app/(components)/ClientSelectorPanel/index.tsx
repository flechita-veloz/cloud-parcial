import React, { useMemo } from "react";
import CreateClientModal from "@/app/clients/CreateClientModal";
import QueryStateHandler from "@/app/(components)/QueryStateHandler";
import SearchBar from "@/app/(components)/SearchBar";
import { Client, useSearchClientsQuery} from "@/state/api";
import { User, IdCard, MapPin, Edit, Trash2 } from "lucide-react";
import useBarSearch from "@/app/hooks/useBarSearch";
import DropDown from "@/app/(components)/DropDown";
import { Button } from "@/components/ui/button";

const DEFAULT_DOCUMENT_TYPE = "Sin Documento";
const DEFAULT_DOCUMENT_NUMBER = "00000000";
const DEFAULT_ADDRESS = "Dirección no especificada";

type ClientSelectorPanelProps = {
  selectedClient: Client | null;
  setSelectedClient: React.Dispatch<React.SetStateAction<Client | null>>;
};

const ClientSelectorPanel = ({ selectedClient, setSelectedClient }: ClientSelectorPanelProps) => {

  const {
    searchTerm,
    setSearchTerm,
    localSearchTerm,
    setLocalSearchTerm,
    handleSearchChange,
    clearSearch,
  } = useBarSearch();

  const {
    data: clients,
    isLoading: isLoadingClients,
    isError: isErrorClients,
  } = useSearchClientsQuery(searchTerm);

  const filteredClients = useMemo(() => {
    if (!searchTerm.trim()) return [];
    return (
      clients?.filter((client: Client) =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.document?.number.toLowerCase().includes(searchTerm.toLowerCase())
      ) || []
    );
  }, [searchTerm, clients]);

  const handleSelectClient = (client: Client) => {
    setSelectedClient(client);
    setSearchTerm(client.name);
    setLocalSearchTerm(client.name);
  };

  const handleRemoveClient = () => {
    setSelectedClient(null);
    clearSearch();
  };

  const [isCreateClientModalOpen, setIsCreateClientModalOpen] = React.useState(false);

  return (
    <QueryStateHandler
      errors={[
        { isLoading: isLoadingClients, isError: isErrorClients, name: "clientes" },
      ]}
    >
      <h2 className="text-xl font-semibold mb-4">Cliente</h2>
      <div className="mb-6 mt-1 relative w-full">
        <SearchBar
          value={localSearchTerm? localSearchTerm : selectedClient?.name || ""}
          onChange={handleSearchChange}
          disabled={selectedClient !== null}
          onClear={handleRemoveClient}
          placeholder="Buscar cliente"
          widthFull={true}
        />
        <DropDown
          items={filteredClients}
          selectedItem={selectedClient}
          searchTerm={searchTerm}
          onSelectItem={handleSelectClient}
          onCreateItem={() => setIsCreateClientModalOpen(true)}
          keyExtractor={(client: Client) => client.clientId}
          renderItem={(client: Client) => (
            <>
              <p className="font-medium">{client.name}</p>
              <p className="text-sm text-black-400">
                {client.document?.typeDocument || DEFAULT_DOCUMENT_TYPE}:{" "}
                {client.document?.number || DEFAULT_DOCUMENT_NUMBER}
              </p>
            </>
          )}
        />
      </div>
      {/* BODY */}
      {selectedClient && (
        <div className="grid grid-cols-2 gap-x-6 gap-y-4 items-start">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 font-semibold">
              <User className="w-5 h-5 text-gray-600" />
              Nombre:
            </div>
            <div className="flex items-center gap-2 font-semibold">
              <IdCard className="w-5 h-5 text-gray-600" />
              {selectedClient.document?.typeDocument || DEFAULT_DOCUMENT_TYPE}:
            </div>
            <div className="flex items-center gap-2 font-semibold">
              <MapPin className="w-5 h-5 text-gray-600" />
              Dirección:
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <p>{selectedClient.name}</p>
            <p>{selectedClient.document?.number || DEFAULT_DOCUMENT_NUMBER}</p>
            <p>{selectedClient.address || DEFAULT_ADDRESS}</p>
          </div>
        </div>
      )}
      {/* BUTTONS */}
      {selectedClient && (
        <div className="mt-4 grid grid-cols-2 gap-4 w-full">
          <div className="flex">
            <Button
              variant="editAction"
              onClick={() => setIsCreateClientModalOpen(true)}
              className="w-full"
            >
              <Edit size={16} />
              <span className="text-center">Editar Cliente</span>
            </Button>
          </div>
          <div className="flex">
            <Button
              variant="editAction"
              onClick={handleRemoveClient}
              className="w-full"
            >
              <Trash2 size={16} />
              <span className="text-center">Eliminar Cliente</span>
            </Button>
          </div>
        </div>
      )}
      {/* MODAL CREATE/EDIT CLIENT*/}
      <CreateClientModal
        isOpen={isCreateClientModalOpen}
        onClose={() => {
          setIsCreateClientModalOpen(false);
        }}
        client={selectedClient}
        inputSearchBar={localSearchTerm}
      />
    </QueryStateHandler>
  );
};

export default ClientSelectorPanel;