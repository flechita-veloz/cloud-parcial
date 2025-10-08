import React, { ChangeEvent, FormEvent, useState, useEffect } from "react";
import { v4 } from "uuid";
import { X, MapPin, User, Phone, Mail, IdCard, Briefcase } from "lucide-react";
import { useCreateClientMutation, useUpdateClientMutation } from "@/state/api";
import { Button } from "@/components/ui/button";
const DOCUMENT_TYPE_OPTIONS = [
  { label: "DNI", value: "DNI" },
  { label: "RUC", value: "RUC" },
  { label: "SIN DOCUMENTO", value: null },
];

const CLIENT_TYPE_OPTIONS = ["Cliente", "Proveedor", "Cliente/Proveedor"];

const DEFAULT_DOCUMENT_TYPE = "DNI";

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

type CreateClientModalProps = {
  isOpen: boolean;
  onClose: () => void;
  client?: ClientFormData | null;
  inputSearchBar?: string;
};

const CreateClientModal = ({ isOpen, onClose, client, inputSearchBar }: CreateClientModalProps) => {
  const [createClient] = useCreateClientMutation();
  const [updateClient] = useUpdateClientMutation();
  const [formData, setFormData] = useState<ClientFormData>({
    clientId: "",
    name: "",
    type: "Cliente",
    phone: "",
    mail: "",
    address: "",
    document: { number: "", typeDocument: DEFAULT_DOCUMENT_TYPE },
  });
  const [selectedTypeDocument, setSelectedTypeDocument] = useState<string | null>(DEFAULT_DOCUMENT_TYPE);

  useEffect(() => {
    if (isOpen) {
      if (client) {
        setFormData(client);
        setSelectedTypeDocument(client.document?.typeDocument ?? DEFAULT_DOCUMENT_TYPE);
      } else {
        setFormData({
          clientId: v4(),
          name: inputSearchBar || "",
          type: "Cliente",
          phone: "",
          mail: "",
          address: "",
          document: { number: "", typeDocument: DEFAULT_DOCUMENT_TYPE },
        });
        setSelectedTypeDocument(DEFAULT_DOCUMENT_TYPE);
      }
    }
  }, [isOpen, client, inputSearchBar]);

  const restartFormData = () => {
    setFormData({
      clientId: v4(),
      name: "",
      type: "Cliente",
      phone: "",
      mail: "",
      address: "",
      document: { number: "", typeDocument: DEFAULT_DOCUMENT_TYPE },
    });
    setSelectedTypeDocument(DEFAULT_DOCUMENT_TYPE);
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement> | { name: string; value: string | null }
  ) => {
    const { name, value } = "target" in e ? e.target : e;

    if (name === "documentType") {
      setSelectedTypeDocument(value);
      setFormData((prev) => ({
        ...prev,
        document: value ? { typeDocument: value, number: prev.document?.number ?? "" } : null,
      }));
    } else if (name === "documentNumber") {
      setFormData((prev) => ({
        ...prev,
        document: prev.document
          ? { ...prev.document, number: value ?? "" }
          : { typeDocument: "", number: value ?? "" },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleClose = () => {
    restartFormData();
    onClose();
  };

  const handleUpdateClient = async () => {
    try {
      await updateClient({
        clientId: formData.clientId,
        updatedData: {
          name: formData.name,
          type: formData.type,
          phone: formData.phone,
          mail: formData.mail,
          address: formData.address,
          document: formData.document
            ? {
                number: formData.document.number,
                typeDocument: formData.document.typeDocument,
              }
            : null,
        },
      }).unwrap();
    } catch (error) {
      console.error("Error al actualizar el cliente:", error);
    }
  };


  const handleCreateClient = async () => {
    try {
      await createClient(formData).unwrap();
    } catch (error) {
      console.error("Error al crear el cliente:", error);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (client?.clientId) {
      await handleUpdateClient();
      handleClose();
    } else {
      await handleCreateClient();
      handleClose();
    }
  };


  if (!isOpen) return null;

return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-30">
      {(
      <div className="modal-default relative bg-white p-6 rounded-2xl shadow-lg w-[40%] min-w-[450px] max-w-3xl min-h-[500px] animate-fadeIn" onClick={e => e.stopPropagation()}>
        <button onClick={handleClose} className="absolute top-3 right-3 text-gray-500 hover:text-red-500">
          <X size={20} />
        </button>
        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-4">
          {client ? "Editar Cliente" : "Crear Nuevo Cliente"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* TYPE DOCUMENT BUTTONS */}
          <div className="grid grid-cols-3 gap-4 mb-4 w-full">
            {DOCUMENT_TYPE_OPTIONS.map(({ label, value }) => (
              <button
                key={label}
                type="button"
                onClick={() => handleChange({ name: "documentType", value })}
                className={`w-full border py-1 px-4 text-center font-semibold rounded-lg transition-all duration-200
                          ${selectedTypeDocument === value ? "bg-blue-500 text-white border-blue-500" : "border-gray-400"}
                          hover:bg-blue-500 hover:text-white hover:border-blue-500 focus:ring-2 focus:ring-blue-300`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* NUMBER DOCUMENT */}
          {selectedTypeDocument && (
            <div>
              <label>Nº de Documento</label>
              <div className="relative">
                <IdCard className="modal-default-icon" size={18} />
                <input
                  type="text"
                  name="documentNumber"
                  onChange={handleChange}
                  value={formData.document?.number || ""}
                  required
                />
              </div>
            </div>
          )}

          {/* NAME */}
          <div>
            <label>Nombre Legal</label>
            <div className="relative">
              <User className="modal-default-icon" size={18} />
              <input
                type="text"
                name="name"
                onChange={handleChange}
                value={formData.name || ""}
                required
              />
            </div>
          </div>

          {/* ADDRESS */}
          <div>
            <label>Dirección</label>
            <div className="relative">
              <MapPin className="modal-default-icon" size={18} />
              <input
                type="text"
                name="address"
                onChange={handleChange}
                value={formData.address || ""}
              />
            </div>
          </div>

          {/* TYPE */}
          <div>
            <label>Tipo</label>
            <div className="relative">
              <Briefcase className="modal-default-icon" size={18} />
              <select
                name="type"
                onChange={handleChange}
                value={formData.type}
              >
                {CLIENT_TYPE_OPTIONS.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          {/* PHONE */}
          <div>
            <label>Teléfono</label>
            <div className="relative">
              <Phone className="modal-default-icon" size={18} />
              <input
                type="tel"
                name="phone"
                onChange={handleChange}
                value={formData.phone || ""}
                maxLength={15}  // Opcional: límite de caracteres
              />
            </div>
          </div>

          {/* MAIL */}
          <div>
            <label>Correo Electrónico</label>
            <div className="relative">
              <Mail className="modal-default-icon" size={18} />
              <input
                type="email"
                name="mail"
                onChange={handleChange}
                value={formData.mail || ""}
              />
            </div>
          </div>

          {/* BUTTONS */}
          <div className="flex gap-4">
            {/* CLOSE BUTTON */}
            <Button
              onClick={handleClose}
              type="button"
              variant="editAction"
              className="w-full flex-1"
            >
              Cancelar
            </Button>

            {/* UPDATE OR CREATE BUTTON */}
            <Button
              type="submit"
              variant="confirmAction"
              className="w-full flex-1"
            >
              Guardar
            </Button>
          </div>
        </form>
      </div>
      )}
    </div>
  );
};

export default CreateClientModal;
