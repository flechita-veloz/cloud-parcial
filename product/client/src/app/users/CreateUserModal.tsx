import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { X, User, Mail, Briefcase, UserSquare, Contact2 } from "lucide-react";
import { useGetUserByIdQuery, useUpdateUserMutation } from "@/state/api";
import { useCreateUserMutation } from "@/state/api";

type UserFormData = {
  username: string;
  names: string;
  surnames: string;
  email: string;
  type: string;
};

type CreateUserModalProps = {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  isLoading?: boolean; 
};

const CreateUserModal = ({ isOpen, onClose, userId }: CreateUserModalProps) => {
  const [updateUser] = useUpdateUserMutation();
  const [createUser] = useCreateUserMutation();
  const {
    data: user,
    isLoading: isLoadingUserId,
    isError: isErrorUserId,
  } = useGetUserByIdQuery(userId, { skip: !userId });

  const handleCreateUser = async (userData: UserFormData) => {
    console.log(userData);
    try {
        await createUser(userData).unwrap();
    } catch(error) {
        console.error("Error al crear el usuario:", error);
    }
  };

  const [formData, setFormData] = useState<UserFormData>({
    username: "",
    names: "",
    surnames: "",
    email: "",
    type: "vendedor",
  });

  const restartFormData = () => {
    setFormData({
      username: "",
      names: "",
      surnames: "",
      email: "",
      type: "vendedor",
    });
  };

  useEffect(() => {
    if (userId && user) {
      setFormData(user);
    } else{
      restartFormData();
    }
  }, [user, userId]);

  if(userId){
    if (isLoadingUserId) {
      return <div className="py-4">Loading...</div>;
    }
    if (isErrorUserId) {
      return (
        <div className="text-center text-red-500 py-4">
          Failed to fetch selected user
        </div>
      );
    }
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement> | { name: string; value: string | null }
  ) => {
    const { name, value } = "target" in e ? e.target : e;
  
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleClose = () => {
    onClose();
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (userId) {
      handleUpdateUser(formData); 
    } else {
      handleCreateUser(formData);
    }
    handleClose();
    restartFormData();
  };
  
  const handleUpdateUser = async (updatedUser: UserFormData) => {
    try {
      await updateUser({
        userId: userId, 
        data: { 
          username: updatedUser.username,
          email: updatedUser.email,
          names: updatedUser.names,
          surnames: updatedUser.surnames,
          type: updatedUser.type,
        }, 
      }).unwrap();
    } catch (error) {
      console.error("Error al actualizar el usuario:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-30">
      {(
      <div className="modal-default relative bg-white p-6 rounded-2xl shadow-lg w-[40%] min-w-[450px] max-w-3xl min-h-[500px] animate-fadeIn">
        <button onClick={handleClose} className="absolute top-3 right-3 text-gray-500 hover:text-red-500">
          <X size={20} />
        </button>
        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-4">
          {userId ? "Editar Usuario" : "Crear Nuevo Usuario"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* USERNAME */}
          <div>
            <label>Nombre de usuario </label>
            <div className="relative">
              <User className="modal-default-icon" size={18} />
              <input
                type="text"
                name="username"
                onChange={handleChange}
                value={formData.username || ""}
                required
              />
            </div>
          </div>

          {/* EMAIL */}
          <div>
            <label>Email</label>
            <div className="relative">
              <Mail className="modal-default-icon" size={18} />
              <input
                type="text"
                name="email"
                onChange={handleChange}
                value={formData.email || ""}
              />
            </div>
          </div>
          
          {/* NAMES */}
          <div>
            <label>Nombres</label>
            <div className="relative">
              <UserSquare className="modal-default-icon" size={18} />
              <input
                type="text"
                name="names"
                onChange={handleChange}
                value={formData.names || ""}
              />
            </div>
          </div>

          {/* SURNAMES */}
          <div>
            <label>Apellidos</label>
            <div className="relative">
              <Contact2 className="modal-default-icon" size={18} />
              <input
                type="text"
                name="surnames"
                onChange={handleChange}
                value={formData.surnames || ""}
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
                <option value="Vendedor">Vendedor</option>
                <option value="Dueño">Dueño</option>
                <option value="Almacenero">Almacenero</option>
                <option value="Contador">Contador</option>
              </select>
            </div>
          </div>

          {/* BUTTONS */}
          <div className="flex justify-center gap-4">
            
            {/* CLOSE BUTTON */}
            <button
              onClick={handleClose}
              type="button"
              className="modal-default-btn-cancel"
            >
              Cancelar
            </button>

            {/* UPDATE OR CREATE BUTTON */}
            <button
              type="submit"
              className="modal-default-btn-accept"
            >
              {userId ? "Actualizar" : "Crear"}
            </button>
          </div>
        </form>
      </div>
      )}
    </div>
  );
};

export default CreateUserModal;
