import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { sendEmail } from "../utils/mailer";
const prisma = new PrismaClient();

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.users.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving users" });
  }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!userId) {
      res.status(400).json({ message: "ID de usuario es requerido" });
      return;
    }

    const user = await prisma.users.findUnique({
      where: { userId },
    });

    if (!user) {
      res.status(404).json({ message: "Usuario no encontrado" });
      return;
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error al recuperar usuario" });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { names, email, username, surnames, type} = req.body;
    const data: any = {
      names,
      email,
      username,
      surnames,
      type,
    };
    const newUser = await prisma.users.create({ data });
    res.status(201).json(newUser);
  } catch (error) {
    console.error("Error creando usuario:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { names, email, username, surnames, type} = req.body;
  try {
    const data: any = {
      names,
      email,
      username,
      surnames,
      type,
    };

    const updatedUser = await prisma.users.update({
      where: { userId },
      data,
    });

    res.json(updatedUser);
  } catch (error) {
    console.error("Error actualizando usuario:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};


export const deleteUser = async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    await prisma.users.delete({ where: { userId } });
    res.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error("Error eliminando usuario:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const enviarCorreo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, idSunat, format, fileNameSunat } = req.body;

    if (!email || !idSunat || !format || !fileNameSunat) {
      res.status(400).json({ error: "Faltan datos en la solicitud" });
      return;
    }

    const url = `https://back.apisunat.com/documents/${idSunat}/getPDF/${format}/${fileNameSunat}.pdf`;

    await sendEmail(email, "Tu Factura/Boleta", "¡Hola!\nLe adjuntamos su recibo.\n\n\n¡Gracias por su preferencia!.", url);

    res.json({ message: "Correo enviado correctamente con la boleta adjunta" });
  } catch (error) {
    console.error("Error al enviar correo:", error);
    res.status(500).json({ error: "Error al enviar el correo" });
  }
};
