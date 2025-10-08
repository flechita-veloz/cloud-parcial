import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const searchProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const search = req.query.search?.toString();
    const products = await prisma.products.findMany({
      where: {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { code: { contains: search, mode: "insensitive" } }
        ]
      }
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving products" });
  }
};

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const products = await prisma.products.findMany();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving products" });
  }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;

    if (!productId) {
      res.status(400).json({ message: "Product ID is required" });
      return;
    }

    const product = await prisma.products.findUnique({
      where: { productId },
    });

    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving product" });
  }
};

export const createProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { productId, name, price, stockQuantity, code, typeTax, valueTax, includeTax } = req.body;
    const product = await prisma.products.create({
      data: {
        productId,
        name,
        price,
        stockQuantity,
        code,
        typeTax,
        valueTax, 
        includeTax
      }
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: "Error creating product" });
  }
};

export const getSalesByProductId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;

    if (!productId) {
      res.status(400).json({ message: "Product ID is required" });
      return;
    }

    const sales = await prisma.sales.findMany({
      where: {
        saleDetails: {
          some: { productId } // Filtra ventas que contengan el productId en algún saleDetail
        },
      },
      select: {
        saleId: true,
        number: true,
        date: true,
        user: {
          select: { username: true }
        },
        client: {
          select: { name: true }
        },
        saleDetails: {
          where: { productId }, 
          select: {
            quantity: true,
            unitPrice: true,
          },
        }
      },
    });

    if (sales.length === 0) {
      res.json([]);
      return;
    }

    res.json(sales);
  } catch (error) {
    console.error("Error retrieving sales by productId:", error);
    res.status(500).json({ message: "Error retrieving sales" });
  }
};




export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    const { name, price, stockQuantity, code, typeTax, valueTax, includeTax } = req.body;

    if (!productId) {
      res.status(400).json({ message: "Product ID is required" });
      return;
    }

    const updatedProduct = await prisma.products.update({
      where: { productId },
      data: {
        name,
        price,
        stockQuantity,
        code,
        typeTax,
        valueTax, 
        includeTax
      },
    });

    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: "Error updating product" });
  }
};

export const deleteProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { productIds } = req.body;
    if (!Array.isArray(productIds) || productIds.length === 0) {
      res.status(400).json({ message: "Invalid product IDs" });
      return;
    }
    await prisma.products.deleteMany({
      where: {
        productId: { in: productIds }
      }
    });
    res.status(200).json({ message: "Products deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting products" });
  }
};

