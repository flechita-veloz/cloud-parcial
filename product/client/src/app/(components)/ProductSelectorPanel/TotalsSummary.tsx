// TotalsSummary.tsx
import { Product } from "@/state/api";

type DetailProduct = Product & {quantity: number, saleDetailId: string, status: string};

type Props = {
  selectedProducts: DetailProduct[];
  filterStatus?: string[];
  discount?: number;
  setDiscount?: (val: number) => void;
  isPercentageDiscount?: boolean;
  setIsPercentageDiscount?: (val: boolean) => void;
  shipping?: number;
  setShipping?: (val: number) => void;
};

const calculateSubtotal = (product: DetailProduct) =>
  product.price * product.quantity / (1 + product.valueTax);

const calculateTotal = (product: DetailProduct) =>
  product.price * product.quantity;

export default function TotalsSummary({ 
  selectedProducts, 
  filterStatus, 
  discount = 0, 
  setDiscount, 
  isPercentageDiscount = false, 
  setIsPercentageDiscount,
  shipping = 0,
  setShipping,
  }: Props) {
  const filteredProducts = filterStatus && filterStatus.length > 0
    ? selectedProducts.filter(p => filterStatus.includes(p.status))
    : selectedProducts;

  const globalSubtotal = filteredProducts.reduce(
    (acc, product) => acc + calculateSubtotal(product), 0
  );

  const globalIGV = filteredProducts.reduce(
    (acc, product) => acc + product.valueTax * calculateSubtotal(product), 0
  );

  const globalTotal = filteredProducts.reduce(
    (acc, product) => acc + calculateTotal(product), 0
  );

  const discountAmount = isPercentageDiscount
    ? (discount / 100) * globalTotal
    : discount;

  const finalTotal = globalTotal - discountAmount + shipping;

  return (
    <div className="ml-auto max-w-sm w-full mt-8 bg-transparent">
      {/* DISCOUNT BUTTON*/}
      {setIsPercentageDiscount && setDiscount && (
        <div className="grid grid-cols-4 gap-4 items-center">
          <button
            className="px-2 py-1 text-sm border border-gray-300 rounded-md bg-transparent"
            onClick={() => setIsPercentageDiscount(!isPercentageDiscount)}
          >
            {isPercentageDiscount ? "%" : "Monto"}
          </button>

          <span className="text-gray-700 font-semibold">Descuento:</span>

          <span className="text-gray-900 font-medium">S/</span>

          <input
            type="number"
            placeholder="0"
            className="w-full text-right border rounded px-2 outline-none bg-transparent"
            value={discount || ""}
            onChange={(e) => setDiscount(Number(e.target.value) || 0)}
          />
        </div>
      )}

      {/* SUBTOTAL */}
      <div className="grid grid-cols-4 gap-4 items-center mt-2">
        <div></div>
        <span className="text-gray-700 font-semibold">Subtotal:</span>
        <span className="text-gray-900 font-medium">S/</span>
        <span className="text-right">{globalSubtotal.toFixed(2)}</span>
      </div>

      {/* IGV */}
      <div className="grid grid-cols-4 gap-4 items-center mt-2">
        <div></div>
        <span className="text-gray-700 font-semibold">IGV:</span>
        <span className="text-gray-900 font-medium">S/</span>
        <span className="text-right">{globalIGV.toFixed(2)}</span>
      </div>

      {/* SHIPPING */}
      {setShipping && (
      <div className="grid grid-cols-4 gap-4 items-center mt-2">
        <span></span> {/* Espacio vacío para mantener alineación */}
        <span className="text-gray-700 font-semibold">Envío:</span>
        <span className="text-gray-900 font-medium">S/</span>
        <input
          type="number"
          placeholder="0"
          className="w-full text-right border rounded px-2 outline-none bg-transparent"
          value={shipping || ""}
          onChange={(e) => setShipping(Number(e.target.value) || 0)}
        />
      </div>
      )}

      {/* TOTAL */}
      <div className="grid grid-cols-4 gap-4 items-center mt-2 border-t pt-2">
        <div></div>
        <span className="text-gray-900 text-lg font-semibold">Total:</span>
        <span className="text-gray-900 font-medium">S/</span>
        <span className="text-right text-lg font-semibold">{finalTotal.toFixed(2)}</span>
      </div>
    </div>
  );
}