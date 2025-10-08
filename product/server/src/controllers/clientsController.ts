import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
 
export const searchClients = async (req: Request, res: Response): Promise<void> => {
  try {
    const search = req.query.search?.toString();
    const clients = await prisma.clients.findMany({
      where: {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { document: search ? { is: { number: { contains: search, mode: "insensitive" } } } : undefined }
        ],
      },
      include: { document: true },
    });

    // Asegurar que siempre devuelva un array, aunque no haya resultados
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving clients" });
  }
};



export const getClients = async (req: Request, res: Response): Promise<void> => {
  try {
    const clients = await prisma.clients.findMany({
      include: {
        document: true,
      },
      }
    );
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving clients" });
  }
};

export const getClientById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { clientId } = req.params;

    if (!clientId) {
      res.status(400).json({ message: "Client ID is required" });
      return;
    }

    const client = await prisma.clients.findUnique({
      where: { clientId },
      include: { document: true },
    });

    if (!client) {
      res.status(404).json({ message: "Client not found" });
      return;
    }

    res.json(client);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving client" });
  }
};

export const createClient = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, type, phone, mail, address, document } = req.body;

    const client = await prisma.clients.create({
      data: {
        name,
        type,
        phone,
        mail,
        address,
        document: document
          ? {
              create: {
                number: document.number,
                typeDocument: document.typeDocument,
              },
            }
          : undefined,
      },
      include: { document: true },
    });

    res.status(201).json(client);
  } catch (error) {
    console.error("Error creating client:", error);
    res.status(500).json({ message: "Error creating client" });
  }
};

export const updateClient = async (req: Request, res: Response): Promise<void> => {
  try {
    const { clientId } = req.params;
    const { name, type, phone, mail, address, document} = req.body;
    console.log("aqui", req.body);
    if (!clientId) {
      res.status(400).json({ message: "Client ID is required" });
      return;
    }

    const updatedClient = await prisma.clients.update({
      where: { clientId },
      data: {
        name,
        type,
        phone,
        mail,
        address,
        document: document
          ? {
              upsert: {
                update: {
                  number: document.number,
                  typeDocument: document.typeDocument,
                },
                create: {
                  number: document.number,
                  typeDocument: document.typeDocument,
                },
              },
            }
          : undefined, 
      },
      include: { document: true },
    });

    if (!document) {
      await prisma.documents.deleteMany({
        where: { clientId },
      });
    }

    res.status(200).json(updatedClient);
  } catch (error) {
    res.status(500).json({ message: "Error updating client" });
  }
};

export const deleteClient = async (req: Request, res: Response) => {
  const { clientId } = req.params;
  try {
    await prisma.clients.delete({ where: { clientId } });
    res.json({ message: "Cliente eliminado correctamente" });
  } catch (error) {
    console.error("Error eliminando cliente:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

