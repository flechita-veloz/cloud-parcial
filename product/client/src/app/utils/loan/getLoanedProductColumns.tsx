import { GridColDef } from "@mui/x-data-grid";
import { Button } from "@/components/ui/button";
import { Product } from "@/state/api";

export type DetailProduct = Product & {
  quantity: number;
  saleDetailId: string;
  status: string;
};

export const getLoanedProductColumns = (
  loanedProducts: DetailProduct[],
  soldProducts: DetailProduct[],
  setLoanedProducts: React.Dispatch<React.SetStateAction<DetailProduct[]>>,
  setSoldProducts: React.Dispatch<React.SetStateAction<DetailProduct[]>>,
): GridColDef[] => {
  return [
    {
      field: "customToggle",
      flex: 0.5,
      minWidth: 80,
      headerClassName: "bg-gray-800 text-white",
      sortable: false,
      disableColumnMenu: true,
      renderHeader: () => <span className="font-bold">Devuelto</span>,
      renderCell: (params) => {
        const saleDetailId = params.row.saleDetailId;
        const product = loanedProducts.find(p => p.saleDetailId === saleDetailId);
        const isChecked = product?.status === "DEVUELTO";

        return (
          <div className="w-full h-full flex justify-center items-center gap-2">
            <label className="inline-flex relative items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={isChecked}
                onChange={(e) => {
                  const newStatus = e.target.checked ? "DEVUELTO" : "POR_DEVOLVER";
                  setLoanedProducts(prev =>
                    prev.map(p =>
                      p.saleDetailId === saleDetailId ? { ...p, status: newStatus } : p
                    )
                  );
                }}
              />
              <div
                className={`w-14 h-6 bg-gray-200 rounded-full peer peer-focus:ring-blue-400 peer-focus:ring-4
                transition relative 
                before:content-['No'] before:absolute before:top-1/2 before:left-1 before:-translate-y-1/2 before:text-xs before:font-bold before:text-white before:transition-all
                peer-checked:bg-blue-600
                peer-checked:before:content-['Si'] peer-checked:before:left-[50%]`}
              ></div>
            </label>
          </div>
        );
      },
    },
    {
      field: "customButton",
      flex: 0.5,
      minWidth: 80,
      headerClassName: "bg-gray-800 text-white",
      sortable: false,
      disableColumnMenu: true,
      renderHeader: () => <span className="font-bold">Acción</span>,
      renderCell: (params) => {
        const saleDetailId = params.row.saleDetailId;
        const product = loanedProducts.find(p => p.saleDetailId === saleDetailId);

        return (
          <div className="w-full h-full flex justify-center items-center">
            <Button
              variant="greenAction"
              className="px-2 py-1 text-sm rounded w-full font-bold"
              onClick={() => {
                if (!product) return;

                setLoanedProducts(prev =>
                  prev.filter(p => p.saleDetailId !== saleDetailId)
                );

                setSoldProducts(prev => [
                  ...prev,
                  { ...product, status: "VENDIDO" },
                ]);
              }}
            >
              Vender
            </Button>
          </div>
        );
      },
    },
  ];
};