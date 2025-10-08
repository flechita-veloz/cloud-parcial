import React, { ChangeEvent, FormEvent, useState, useEffect } from "react";
import { v4 } from "uuid";
import { X, Barcode, Tag, CheckCircle, XCircle, Package, Percent } from "lucide-react";
import { useUpdateProductMutation, useCreateProductMutation } from "@/state/api";
import { Button } from "@/components/ui/button";

const TAX_OPTIONS = [
  "IGV (18.00%)",
  "Exonerado (0.00%)",
  "Inafecto (0.00%)",
  "Gratuita (0.00%)",
  "Exportación (0.00%)",
];

const DEFAULT_TYPE_TAX = "IGV (18.00%)";
const DEFAULT_VALUE_TAX = 0.18;

type ProductFormData = {
  productId: string;
  name: string;
  price: number;
  stockQuantity: number;
  code: string;
  typeTax: string;
  valueTax: number;
  includeTax: boolean;
};

type CreateProductModalProps = {
  isOpen: boolean;
  onClose: () => void;
  product?: ProductFormData | null;
  inputSearchBar?: string;
};

// const CreateProductModal = ({ isOpen, onClose, onSuccess, product, inputSearchBar}: CreateProductModalProps) => {
const CreateProductModal = ({ isOpen, onClose, product, inputSearchBar}: CreateProductModalProps) => {
  const [updateProduct] = useUpdateProductMutation();
  const [createProduct] = useCreateProductMutation();

  const [formData, setFormData] = useState<ProductFormData>({
    productId: "",
    name: product?.name ?? "",
    price: 0,
    stockQuantity: 0,
    code: "",
    typeTax: DEFAULT_TYPE_TAX,
    valueTax: DEFAULT_VALUE_TAX,
    includeTax: true,
  });

  useEffect(() => {
    if (isOpen) {
      if (product) {
        setFormData(product);
      } else {
        setFormData({
          productId: v4(),
          name: inputSearchBar || "",
          price: 0,
          stockQuantity: 0,
          code: "",
          typeTax: DEFAULT_TYPE_TAX,
          valueTax: DEFAULT_VALUE_TAX,
          includeTax: true,
        });
      }
    }
  }, [isOpen, product, inputSearchBar]);

  const restartFormData = () => {
    setFormData({
      productId: v4(),
      name: "",
      price: 0,
      stockQuantity: 0,
      code: "",
      typeTax: DEFAULT_TYPE_TAX,
      valueTax: DEFAULT_VALUE_TAX,
      includeTax: true,
    });
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
  
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" || name === "stockQuantity" ? (value === "" ? 0 : parseFloat(value)) : value,
      valueTax: name === "typeTax" ? (value === "IGV (18.00%)" ? 0.18 : 0.0) : prev.valueTax,
    }));
  };
  
  const handleClose = () => {
    restartFormData();
    onClose();
  };

  const handleUpdateProduct = async () => {
    try {
      await updateProduct({
        productId: formData.productId, 
        updatedData: { 
          name: formData.name,
          price: formData.price,
          stockQuantity: formData.stockQuantity,
          code: formData.code,
          typeTax: formData.typeTax,
          valueTax: formData.valueTax,
          includeTax: formData.includeTax
        }, 
      }).unwrap();
    } catch (error) {
      console.error("Error al actualizar el producto:", error);
    }
  };

  const handleCreateProduct = async () => {
    try {
      await createProduct(formData).unwrap();
      // onSuccess(formData);
    } catch (error) {
      console.error("Error al crear el producto:", error);
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (product?.productId) {
      await handleUpdateProduct();
      handleClose();
    } else {
      await handleCreateProduct();
      handleClose();
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
          {product?.productId ? "Editar Producto" : "Crear Nuevo Producto"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* NAME */}
          <div>
            <label>Nombre del Producto</label>
            <div className="relative">
              <Tag className="modal-default-icon" size={18} />
              <input
                type="text"
                name="name"
                onChange={handleChange}
                value={formData.name || ""}
                required
              />
            </div>
          </div>

          {/* CODE */}
          <div>
            <label>Código del Producto</label>
            <div className="relative">
              <Barcode className="modal-default-icon" size={18} />
              <input
                type="text"
                name="code"
                onChange={handleChange}
                value={formData.code}
                required
              />
            </div>
          </div>

          {/* PRICE */}
          <div>
            <label>Precio</label>
            <div className="flex flex-col sm:flex-row items-stretch gap-2">
              {/* INPUT TAX */}
              <div className="relative flex-1">
                <span className="modal-default-icon">S/</span>
                <input
                  type="number"
                  name="price"
                  placeholder="0.00"
                  onChange={handleChange}
                  value={formData.price || ""}
                />
              </div>

              {/* BUTTON WITH OR WITHOUT TAX */}
              <Button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, includeTax: !prev.includeTax }))}
                variant={formData.includeTax ? "greenAction" : "deleteAction"}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium rounded-md transition"
              >
                {formData.includeTax ? <CheckCircle size={16} className="inline mr-1" /> : <XCircle size={16} className="inline mr-1" />}
                {formData.includeTax ? "Con impuestos" : "Sin impuestos"}
              </Button>
            </div>

            {/* SUMMARY PRICES */}
            <div className="mt-3 p-4 bg-gray-100 border border-gray-300 rounded-lg text-sm">
              <div className="grid grid-cols-3 gap-4 text-center text-gray-600 font-medium pb-2 border-b border-gray-300">
                <p>Unitario</p>
                <p>IGV</p>
                <p>Total</p>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center mt-2 text-gray-800 font-semibold">
                <p>S/ {formData.includeTax ? (formData.price / (1 + formData.valueTax)).toFixed(2) : formData.price.toFixed(2)}</p>
                <p>S/ {formData.includeTax ? (formData.price - formData.price / (1 + formData.valueTax)).toFixed(2) : (formData.price * formData.valueTax).toFixed(2)}</p>
                <p>S/ {formData.includeTax ? formData.price.toFixed(2) : (formData.price * (1 + formData.valueTax)).toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* TAX */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mt-4">Impuesto</label>
            <div className="relative">
              <Percent className="modal-default-icon" size={18} />
              <select
                name="typeTax"
                onChange={handleChange}
                value={formData.typeTax}
              >
                {TAX_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>

          {/* STOCK QUANTITY */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Stock</label>
            <div className="relative">
              <Package className="modal-default-icon" size={18} />
              <input
                type="number"
                name="stockQuantity"
                placeholder="0"
                onChange={handleChange}
                value={formData.stockQuantity || ""}
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
              {product?.productId ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </form>
      </div>
      )}
    </div>
  );
};

export default CreateProductModal;
