import React, { ChangeEvent, FormEvent, useCallback, useEffect, useState } from "react";
import { v4 } from "uuid";
import { X, FileText, Calendar, ArrowLeftRight, CreditCard } from "lucide-react";
import { useGetTransactionByIdQuery, useUpdateTransactionMutation, useCreateTransactionMutation } from "@/state/api";

type TransactionFormData = {
  transactionId: string;
  saleId?: string;
  userId: string;
  purchaseId?: string;
  date: string;
  paymentMethod: string;
  type: "Depósito" | "Retiro" | "";
  amount: number;
  description: string;
  origin: string;
};

type CreateTransactionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  transactionId: string;
  isLoading?: boolean; 
};

const CreateTransactionModal = ({ isOpen, onClose, transactionId}: CreateTransactionModalProps) => {
  const [updateTransaction] = useUpdateTransactionMutation();
  const today = new Date().toISOString().split("T")[0];
  const [createTransaction] = useCreateTransactionMutation();
  const {
    data: transaction,
    isLoading: isLoadingTransactionId,
    isError: isErrorTransactionId,
  } = useGetTransactionByIdQuery(transactionId, { skip: !transactionId });

  const [formData, setFormData] = useState<TransactionFormData>({
    transactionId: "",
    userId: "u1", // CORREGIR
    date: today,
    paymentMethod: "",
    type: "",
    amount: 0,
    description: "",
    origin: "Transacción"
  });

  const restartFormData = useCallback(() => {
    setFormData({
      transactionId: v4(),
      userId: "u1", // CORREGIR
      date: today,
      paymentMethod: "Efectivo",
      type: "Depósito",
      amount: 0,
      description: "",
      origin: "Transacción",
    });
  },[today]);

  useEffect(() => {
    if (transactionId && transaction) {
      setFormData(transaction);
    } else{
      restartFormData();
    }
  }, [restartFormData, transaction, transactionId]);

  if(transactionId){
    if (isLoadingTransactionId) {
      return <div className="py-4">Cargando...</div>;
    }
    if (isErrorTransactionId) {
      return (
        <div className="text-center text-red-500 py-4">
          No se pudo recuperar la transacción seleccionada
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
      [name]: value ,
    }));
  };
  
  
  
  const handleClose = () => {
    onClose();
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (transactionId) {
      handleUpdateTransaction(formData); 
    } else {
      createTransaction(formData);
    }
    handleClose();
    restartFormData();
  };

  {/* FUNCTION TO MERGE DATE AND CURRENT HOURS-MINUTES-SECONDS */}
  function mergeDateWithCurrentTime(dateString: string): string {
    if (dateString.includes("T")) {
      return new Date(dateString).toISOString(); // Ya tiene hora, devolver como está
    }
    const date = new Date(dateString + "T00:00:00Z"); // Force UTC
    const now = new Date(); 
    date.setUTCHours(now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), now.getUTCMilliseconds()); // Usar UTC
    return date.toISOString(); // Convert to format ISO-8601 accepted for Prisma
  }
  
  const handleUpdateTransaction = async (updatedTransaction: TransactionFormData) => {
    try {
      await updateTransaction({
        transactionId: updatedTransaction.transactionId, 
        data: { 
          date: mergeDateWithCurrentTime(updatedTransaction.date),
          paymentMethod: updatedTransaction.paymentMethod,
          type: updatedTransaction.type,
          amount: updatedTransaction.amount,
          description: updatedTransaction.description,
        }, 
      }).unwrap();
    } catch (error) {
      console.error("Error al actualizar la transacción:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-30">
      {(
      <div className="modal-default relative bg-white p-6 rounded-2xl shadow-lg w-[40%] min-w-[450px] max-w-3xl min-h-[300px] animate-fadeIn">
        <button onClick={handleClose} className="absolute top-3 right-3 text-gray-500 hover:text-red-500">
          <X size={20} />
        </button>
        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-4">
          {transactionId ? "Editar Transacción" : "Crear Nueva transacción"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* DESCRIPTION */}
          <div>
            <label>Descripción</label>
            <div className="relative">
              <FileText className="absolute left-3 top-2.5 text-gray-500" size={18} />
              <input
                type="text"
                name="description"
                onChange={handleChange}
                value={formData.description || ""}
                required
              />
            </div>
          </div>

          {/* PAYMENT METHOD + DATE */}
          <div className="flex space-x-4 mt-4">
            {/* PAYMENT METHOD */}
            <div className="w-1/2">
              <label>Método de Pago</label>
              <div className="relative">
                <CreditCard className="modal-default-icon" size={18} />
                <select
                  name="paymentMethod"
                  onChange={handleChange}
                  value={formData.paymentMethod}
                >
                  <option value="Efectivo">Efectivo</option>
                  <option value="Yape">Yape</option>
                  <option value="Plin">Plin</option>
                  <option value="Transferencia">Transferencia</option>
                  <option value="Tarjeta">Tarjeta</option>
                </select>
              </div>
            </div>
            {/* DATE */}
            <div className="w-1/2">
              <label>Fecha</label>
              <div className="relative">
                <Calendar className="modal-default-icon" size={18} />
                <input
                  type="date"
                  name="date"
                  value={formData.date.split("T")[0] || ""}
                  onChange={(e) => {
                    handleChange(e);
                    setFormData((prev) => ({
                      ...prev,
                      date: e.target.value,
                    }));
                  }}
                  required
                />
              </div>
            </div>
          </div>

          {/* TYPE + AMOUNT */}
          <div className="flex space-x-4 mt-4">
            {/* TYPE */}
            <div className="w-1/2">
              <label>Tipo</label>
              <div className="relative">
                <ArrowLeftRight className="modal-default-icon" size={18} />
                <select
                  name="type"
                  onChange={handleChange}
                  value={formData.type}
                >
                  <option value="Depósito">Depósito</option>
                  <option value="Retiro">Retiro</option>
                </select>
              </div>
            </div>

            {/* MONTO */}
            <div className="w-1/2">
              <label>Monto</label>
              <div className="relative">
                <span className="modal-default-icon">S/</span>
                <input
                  type="number"
                  name="amount"
                  onChange={(e) => {
                    handleChange(e);
                    setFormData((prev) => ({
                      ...prev,
                      amount: Number(e.target.value) || 0,
                    }));
                  }}
                  value={formData.amount || ""}
                  placeholder="0.00"
                  required
                />
              </div>
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
              {transactionId ? "Actualizar" : "Crear"}
            </button>

          </div>
        </form>
      </div>
      )}
    </div>
  );
};

export default CreateTransactionModal;
