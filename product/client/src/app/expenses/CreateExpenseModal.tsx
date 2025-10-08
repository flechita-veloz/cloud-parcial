import React, { ChangeEvent, FormEvent, useCallback, useEffect, useState } from "react";
import { X, FileText, Calendar, CreditCard, DollarSign, Hash, Building2, Receipt } from "lucide-react";
import { useGetExpenseByIdQuery, useUpdateExpenseMutation, useCreateExpenseMutation,
         useCreateTransactionMutation, useUpdateTransactionMutation } from "@/state/api";

type ExpenseFormData = {
  userId:          string;
  hasVoucher:      boolean;
  companyName?:     string;
  RUC?:             string;
  billingNumber?:   string;
  billingType?:     string;
};

type TransactionFormData = {
  expenseId?: string;
  userId: string;
  date: string;
  paymentMethod: string;
  type: "Depósito" | "Retiro" | "";
  amount: number;
  description: string;
  origin: string;
};

type CreateExpenseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  expenseId: string;
  isLoading?: boolean; 
};

const CreateExpenseModal = ({ isOpen, onClose, expenseId}: CreateExpenseModalProps) => {
  const [updateExpense] = useUpdateExpenseMutation();
  const [createExpense] = useCreateExpenseMutation();
  const [updateTransaction] = useUpdateTransactionMutation();
  const [createTransaction] = useCreateTransactionMutation();
  const [hasVoucher, setHasVoucher] = useState(false);
  const today = new Date().toISOString().split("T")[0];
  
  const {
    data: expense,
    isLoading: isLoadingExpenseId,
    isError: isErrorExpenseId,
  } = useGetExpenseByIdQuery(expenseId, { skip: !expenseId });

  const [expenseFormData, setExpenseFormData] = useState<ExpenseFormData>({
    hasVoucher: false,
    userId: "", // CORREGIR
    companyName: "",
    RUC: "",
    billingNumber: "",
    billingType: "",
  });

  const [transactionFormData, setTransactionFormData] = useState<TransactionFormData>({
    expenseId: "",
    userId: "", // CORREGIR
    date: "",
    paymentMethod: "",
    type: "",
    amount: 0,
    description: "",
    origin: "",
  });

  const restartFormData = useCallback(() => {
    setExpenseFormData({
      hasVoucher: false,
      userId: "u1", // CORREGIR
      companyName: "",
      RUC: "",
      billingNumber: "",
      billingType: "",
    });

    setTransactionFormData({
      expenseId: expenseId,
      userId: "u1", // CORREGIR
      date: today,
      paymentMethod: "Efectivo",
      type: "Retiro",
      amount: 0,
      description: "",
      origin: "Gasto",
    });
  }, [expenseId, today, setExpenseFormData, setTransactionFormData]);

  useEffect(() => {
    if (expenseId && expense) {
      setExpenseFormData(expense);
      setTransactionFormData(expense.transaction);
      setHasVoucher(expense.hasVoucher);
    } else{
      restartFormData();
    }
  }, [expense, expenseId, restartFormData]);

  if(expenseId){
    if (isLoadingExpenseId) {
      return <div className="py-4">Cargando...</div>;
    }
    if (isErrorExpenseId) {
      return (
        <div className="text-center text-red-500 py-4">
          No se pudo recuperar el gasto seleccionado
        </div>
      );
    }
  };

  const handleChange = (type: string ,
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement> | { name: string; value: string | null }
  ) => {
    const { name, value } = "target" in e ? e.target : e;
    if(type === "transaction"){
      setTransactionFormData((prev) => ({
        ...prev,
        [name] : name === "amount" ? Number(value) || 0 : value ,
      }));
    }
    else if(type === "expense"){
      setExpenseFormData((prev) => ({
        ...prev,
        [name]: value ,
      }));
    }
  };

  const handleUpdateTransaction = async (updatedTransaction: TransactionFormData) => {
    if(!expense) return;
    try {
      await updateTransaction({ 
        transactionId: expense.transaction.transactionId, 
        data: updatedTransaction
      }).unwrap();
    } catch (error) {
      console.error("Error al actualizar la transacción:", error);
    }
  };

  const handleUpdateExpense = async (updatedExpense: ExpenseFormData) => {
    try {
      await updateExpense({ 
        expenseId: expenseId, 
        data: updatedExpense
      }).unwrap();
    } catch (error) {
      console.error("Error al actualizar el gasto:", error);
    }
  };

  const handleCreateExpense = async (expenseData: ExpenseFormData) => {
    try {
      const newExpenseId = (await createExpense(expenseData).unwrap()).expenseId;
  
      setTransactionFormData(prev => ({
        ...prev,
        expenseId: newExpenseId
      }));
  
      await createTransaction({
        ...transactionFormData,
        expenseId: newExpenseId 
      }).unwrap();
    } catch (error) {
      console.error("Error al crear gasto:", error);
    }
  };
  
  const handleClose = () => {
    onClose();
  };
  
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTransactionFormData({
      ...transactionFormData,
      date: mergeDateWithCurrentTime(transactionFormData.date)
    })
    if (expenseId) {
      handleUpdateTransaction(transactionFormData); 
      handleUpdateExpense(expenseFormData);
    } else {
      handleCreateExpense(expenseFormData);
    }
    restartFormData();
    setHasVoucher(false);
    handleClose();
  };

  {/* FUNCTION TO MERGE DATE AND CURRENT HOURS-MINUTES-SECONDS */}
  function mergeDateWithCurrentTime(dateString: string): string {
    if (dateString.includes("T")) {
      return new Date(dateString).toISOString(); 
    }
    const date = new Date(dateString + "T00:00:00Z"); // Force UTC
    const now = new Date(); 
    date.setUTCHours(now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), now.getUTCMilliseconds()); // Usar UTC
    return date.toISOString(); // Convert to format ISO-8601 accepted for Prisma
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-30">
      <div className="modal-default relative bg-white p-6 rounded-2xl shadow-lg w-[40%] min-w-[450px] max-w-3xl min-h-[300px] animate-fadeIn">
        <button onClick={handleClose} className="absolute top-3 right-3 text-gray-500 hover:text-red-500">
          <X size={20} />
        </button>

        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-4">
          {expenseId ? "Editar Transacción" : "Crear Nueva transacción"}
        </h2>

        {/* BUTTONS W/WO VOUCHER */}
        <div className="grid grid-cols-2 gap-4 mb-4 w-full">
          {[
            { label: "Sin comprobante", value: "sin" },
            { label: "Con comprobante", value: "con" },
          ].map(({ label, value }) => (
            <button
              key={value}
              type="button"
              onClick={() =>{ 
                setHasVoucher(value === "con" ? true : false)
                setExpenseFormData((prev) => ({
                  ...prev,
                  hasVoucher: value === "con" ? true : false,
                }));
              }}
              className={`w-full border py-3 px-4 text-center font-semibold rounded-lg transition-all duration-200
                ${(hasVoucher && value === "con" || !hasVoucher && value === "sin") ? "bg-blue-500 text-white border-blue-500" : "border-gray-400"}
                hover:bg-blue-500 hover:text-white hover:border-blue-500 focus:ring-2 focus:ring-blue-300`}
            >
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* DESCRIPTION */}
          <div>
            <label>Descripción</label>
            <div className="relative">
              <FileText className="modal-default-icon" size={18} />
              <input
                type="text"
                name="description"
                onChange={(e) => handleChange("transaction", e)}
                value={transactionFormData.description || ""}
                required
              />
            </div>
          </div>

          {/* PAYMENT METHOD + DATE */}
          <div className="flex space-x-4 mt-4">
            <div className="w-1/2">
              <label>Método de Pago</label>
              <div className="relative">
                <CreditCard className="modal-default-icon" size={18} />
                <select
                  name="paymentMethod"
                  onChange={(e) => handleChange("transaction", e)}
                  value={transactionFormData.paymentMethod}
                >
                  <option value="Efectivo">Efectivo</option>
                  <option value="Yape">Yape</option>
                  <option value="Plin">Plin</option>
                  <option value="Transferencia">Transferencia</option>
                  <option value="Tarjeta">Tarjeta</option>
                </select>
              </div>
            </div>
            <div className="w-1/2">
              <label>Fecha</label>
              <div className="relative">
                <Calendar className="modal-default-icon" size={18} />
                <input
                  type="date"
                  name="date"
                  value={transactionFormData.date?.split("T")[0] || ""}
                  onChange={(e) => handleChange("transaction", e)}
                  required
                />
              </div>
            </div>
          </div>

          {/* AMOUNT */}
          <div>
            <div className="relative">
              <DollarSign className="modal-default-icon" size={18} />
              <input
                type="number"
                name="amount"
                onChange={(e) => handleChange("transaction", e)}
                value={transactionFormData.amount || ""}
                placeholder="S/ 0.00"
                required
              />
            </div>
          </div>

          {/* ADITIONALS FIELDS */}
          {hasVoucher && (
            <div className="space-y-4">
              {/* RUC */}
              <div>
                <label>RUC</label>
                <div className="relative">
                  <Hash className="modal-default-icon" size={18} />
                  <input
                    type="text"
                    name="RUC"
                    onChange={(e) => handleChange("expense", e)}
                    value={expenseFormData.RUC || ""}
                  />
                </div>
              </div>
              {/* NAME COMPANY */}
              <div>
                <label>Nombre de la empresa</label>
                <div className="relative">
                  <Building2 className="modal-default-icon" size={18} />
                  <input
                    type="text"
                    name="companyName"
                    onChange={(e) => handleChange("expense", e)}
                    value={expenseFormData.companyName || ""}
                  />
                </div>
              </div>
              {/* VOUCHER TYPE + NUMBER */}
              <div className="flex space-x-4">
                <div className="w-1/2">
                  <label>Tipo de comprobante</label>
                  <div className="relative">
                    <Receipt className="modal-default-icon" size={18} />
                    <select
                      name="billingType"
                      onChange={(e) => handleChange("expense", e)}
                      value={expenseFormData.billingType|| ""}
                    >
                      <option value="">Seleccione</option>
                      <option value="Boleta">Boleta</option>
                      <option value="Factura">Factura</option>
                    </select>
                  </div>
                </div>
                <div className="w-1/2">
                  <label>Número</label>
                  <div className="relative">
                    <Hash className="modal-default-icon" size={18} />
                    <input
                      type="text"
                      name="billingNumber"
                      onChange={(e) => handleChange("expense", e)}
                      value={expenseFormData.billingNumber || ""}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* BUTTONS */}
          <div className="flex justify-center gap-4">
            <button
              onClick={handleClose}
              type="button"
              className="modal-default-btn-cancel"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="modal-default-btn-accept"
            >
              {expenseId ? "Actualizar" : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateExpenseModal;
