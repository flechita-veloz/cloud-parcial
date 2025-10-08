import { Transaction } from "@/state/api"; 
import React, { useCallback } from "react";
import {TransactionRow} from "@/app/(components)/TransactionRow";
import { convertToPeruDate } from "@/app/utils/date";
import { ChangeSummary } from "@/app/(components)/ChangeSummary";

type PaymentMethodsManagerProps = {
  transactions: Partial<Transaction>[];
  globalTotal: number;
  setTransactions: React.Dispatch<React.SetStateAction<Partial<Transaction>[]>>;
  showAddButton?: boolean;
  disableAmountInput?: boolean;
  setState?: React.Dispatch<React.SetStateAction<string>>;
};

const PaymentMethodsManager = ({
  transactions,
  globalTotal,
  setTransactions,
  showAddButton = true,
  disableAmountInput = false,
  setState,
}: PaymentMethodsManagerProps) => {
  const today = new Date().toString();

  const updateTransactionField = useCallback(
    (index: number, field: keyof Transaction, value: string | number) => {
      setTransactions((prev) =>
        prev.map((t, i) => (i === index ? { ...t, [field]: value } : t))
      );
    },
    [setTransactions]
  );

  const addNewTransaction = () => {
    const newTransaction: Partial<Transaction> = {
      transactionId: "",
      paymentMethod: "Efectivo",
      date: convertToPeruDate(today),
      amount: 0,
    };
    setTransactions((prev) => [...prev, newTransaction]);
  };

  const removeTransactionByIndex = (index: number) => {
    setTransactions((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="mb-4">
      <h2 className="text-xl font-semibold mb-2">Métodos de pago</h2>
      <div className="space-y-2">
        {transactions.map((tx, index) => (
          <TransactionRow
            key={index}
            index={index}
            transaction={tx}
            onChange={updateTransactionField}
            onDelete={removeTransactionByIndex}
            showDelete={transactions.length > 1 && index !== 0}
            disableAmountInput={disableAmountInput}
          />
        ))}

        {showAddButton && (
          <button
            className="mt-2 text-blue-500 hover:underline"
            onClick={addNewTransaction}
          >
            + Añadir Pago
          </button>
        )}
      </div>

      <ChangeSummary
        transactions={transactions}
        globalTotal={globalTotal}
        setState={setState}
      />

    </div>
  );
};

export default PaymentMethodsManager;
