import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getSaleDetails = async (req: Request, res: Response) => {
  try {
    const saleDetails = await prisma.salesDetail.findMany();
    res.json(saleDetails);
  } catch (error) {
    console.error("Error al obtener detalles de venta:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};


export const getSaleDetailsBySaleId = async (req: Request, res: Response) => {
  try {
    const { saleId } = req.params;
    const saleDetails = await prisma.salesDetail.findMany({ where: { saleId } });
    res.json(saleDetails);
  } catch (error) {
    console.error("Error al obtener detalles de venta:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};


export const createSaleDetail = async (req: Request, res: Response) => {
  try {
    const { status, productId, loanId, saleId, purchaseId, quantity, unitPrice, nameProduct, typeTax, valueTax, codeProduct} = req.body;

    const newSaleDetail = await prisma.salesDetail.create({
      data: {
        productId,
        saleId,
        loanId,
        purchaseId,
        quantity,
        unitPrice,
        nameProduct, 
        typeTax,
        valueTax,
        codeProduct,
        status,
      },
    });

    const product = await prisma.products.findUnique({ where: { productId } });
    if (product && !!saleId) {
      await prisma.products.update({
        where: { productId },
        data: {
          stockQuantity: {
            decrement: quantity,
          },
        },
      });
    }
    else if (product && !!purchaseId) {
      await prisma.products.update({
        where: { productId },
        data: {
          stockQuantity: {
            increment: quantity,
          },
        },
      });
    }

    res.status(201).json(newSaleDetail);
  } catch (error) {
    console.error("Error al crear detalle de venta/compra/préstamo:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const updateSalesDetail = async (req: Request, res: Response) => {
  try {
    const { saleDetailId } = req.params;
    const { status, quantity, unitPrice, nameProduct, typeTax, valueTax} = req.body;

    const originalDetail = await prisma.salesDetail.findUnique({
      where: { saleDetailId },
    });

    if (originalDetail?.saleId || originalDetail?.purchaseId) {
      const quantityDiff = quantity - originalDetail.quantity;
      const updateOp = originalDetail.purchaseId ? "increment" : "decrement";

      await prisma.products.update({
        where: { productId: originalDetail.productId },
        data: {
          stockQuantity: {
            [updateOp]: quantityDiff > 0 ? quantityDiff : -quantityDiff,
          },
        },
      });
    }

    const updatedSalesDetail = await prisma.salesDetail.update({
      where: { saleDetailId: saleDetailId },
      data: { 
        quantity, 
        unitPrice, 
        nameProduct, 
        typeTax, 
        valueTax,
        status,
      },
    });

    res.json(updatedSalesDetail);
  } catch (error) {
    console.error("Error al actualizar detalle de venta:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const deleteSaleDetail = async (req: Request, res: Response) => {
  try {
    const { saleDetailId } = req.params;

    const detail = await prisma.salesDetail.findUnique({
      where: { saleDetailId },
    });

    await prisma.salesDetail.delete({ where: { saleDetailId: saleDetailId } });

    if (detail?.saleId) {
      await prisma.products.update({
        where: { productId: detail.productId },
        data: {
          stockQuantity: {
            increment: detail.quantity,
          },
        },
      });
    }
    else if (detail?.purchaseId) {
      await prisma.products.update({
        where: { productId: detail.productId },
        data: {
          stockQuantity: {
            decrement: detail.quantity,
          },
        },
      });
    }

    res.status(204).send();
  } catch (error) {
    console.error("Error al eliminar detalle de venta:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
