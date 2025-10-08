import { Trash2 } from "lucide-react";
import { Transaction } from "@/state/api"; // Adjust the path as needed
import DatePicker from "react-datepicker";
import { registerLocale } from "react-datepicker";
import { es } from "date-fns/locale";
import { format } from "date-fns";
registerLocale("es", es);

type TransactionRowProps = {
  index: number;
  transaction: Partial<Transaction> | null;
  onChange: (index: number, field: keyof Transaction, value: string | number) => void;
  onDelete: (index: number) => void;
  showDelete: boolean;
  disableAmountInput?: boolean;
};

const PAYMENT_METHODS = ["Efectivo", "Yape", "Plin", "Transferencia", "Tarjeta"];

export const TransactionRow = ({
  index,
  transaction,
  onChange,
  onDelete,
  showDelete,
  disableAmountInput,
}: TransactionRowProps) => (
  <div className="flex items-center gap-2">
    <select
      className="w-1/3 h-10 px-2 border border-gray-300 rounded-md bg-white text-sm"
      value={transaction?.paymentMethod || ""}
      onChange={(e) => onChange(index, "paymentMethod", e.target.value)}
    >
      {PAYMENT_METHODS.map((method) => (
        <option key={method} value={method}>
          {method}
        </option>
      ))}
    </select>

    <DatePicker
      locale="es"
      selected={
        transaction?.date  
        ? new Date(`${transaction.date}T00:00:00`) 
        : new Date()}
      onChange={(date) => {
        console.log(date);
        if (date) {
          onChange(index, "date", format(date, "yyyy-MM-dd"));
          console.log(date);
        }
      }}
      dateFormat="yyyy-MM-dd"
      placeholderText="Seleccionar fecha"
      customInput={
        <input
          className="w-full px-3 py-2 border rounded-md bg-white"
        />
      }
    />

    <div className="flex items-center border rounded px-2 w-1/3 h-10">
      <span className="mr-2 text-gray-500">S/</span>
      <input
        type="number"
        className="w-full h-full text-right outline-none bg-white"
        placeholder="0"
        value={transaction?.amount || ""}
        onChange={(e) => onChange(index, "amount", Number(e.target.value))}
        disabled={disableAmountInput}
      />
    </div>

    <button
      className="text-gray-600 hover:text-gray-700 min-w-[15px] flex justify-center"
      onClick={() => onDelete(index)}
      style={{ visibility: showDelete ? "visible" : "hidden" }}
    >
      <Trash2 size={20} />
    </button>
  </div>
);

export default TransactionRow;