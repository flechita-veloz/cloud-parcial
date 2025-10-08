

import { Product } from "@/state/api";

const IGV_LABEL = "IGV (18.00%)";
const IGV_VALUE = 0.18;

type DetailProduct = Product & {quantity: number, saleDetailId: string, status: string};

const useProductFieldUpdater = (
  setSelectedProducts: React.Dispatch<React.SetStateAction<DetailProduct[]>>
) => {
  return (
    index: number,
    field: keyof Product | "quantity" | "status",
    value: number | string
  ) => {
    setSelectedProducts((prev) =>
      prev.map((p, i) =>
        i === index
          ? {
              ...p,
              [field]:
                field === "quantity" || field === "price"
                  ? value === ""
                    ? 0
                    : typeof value === "string"
                    ? parseFloat(value)
                    : value
                  : value,
              ...(field === "typeTax"
                ? {
                    valueTax: value === IGV_LABEL && p.typeTax !== value ? IGV_VALUE : 0,
                    price:
                      value === IGV_LABEL && p.typeTax !== value
                        ? p.price * (1 + IGV_VALUE)
                        : value !== IGV_LABEL && p.typeTax === IGV_LABEL
                        ? p.price / (1 + IGV_VALUE)
                        : p.price,
                  }
                : {}),
            }
          : p
      )
    );
  };
};

export default useProductFieldUpdater;