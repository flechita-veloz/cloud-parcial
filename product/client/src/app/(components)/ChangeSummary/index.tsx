import React from "react";
import { Transaction } from "@/state/api"; 
import { CheckCircle, AlertCircle } from "lucide-react";

interface ChangeSummaryProps {
  transactions: Partial<Transaction>[];
  globalTotal: number;
  discount?: number;
  isPercentageDiscount?: boolean;
  setState?: React.Dispatch<React.SetStateAction<string>>;
}

export const ChangeSummary: React.FC<ChangeSummaryProps> = ({
  transactions,
  globalTotal,
  discount = 0,
  isPercentageDiscount = false,
  setState,
}) => {
  const globalChange =
    transactions.reduce(
      (total, transaction) => total + Number(transaction.amount),
      0
    ) -
    (isPercentageDiscount
      ? globalTotal * (1 - discount / 100)
      : globalTotal - discount);

  let label;
  let icon;

  if (globalChange >= 0) {
    label = "Vuelto:";
    icon = <CheckCircle className="text-green-600" size={18} />;
    if (setState) {
      setState("PAGADO");
    }
  } else {
    label = "Deuda:";
    icon = <AlertCircle className="text-red-600" size={18} />;
    if (setState) {
      setState("DEUDA");
    }
  }

  return (
    <div className="mt-2 flex justify-between border-t pt-2 text-base">
      <span className="font-semibold flex items-center gap-1">
        {icon}
        {label}
      </span>
      <div className="flex items-center">
        <span className="mr-2">S/</span>
        <span>{Math.abs(globalChange).toFixed(2)}</span>
      </div>
    </div>
  );
};

export default ChangeSummary;
