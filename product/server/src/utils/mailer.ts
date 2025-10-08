import nodemailer from "nodemailer";
import axios from "axios";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  },
});

export const sendEmail = async (to: string, subject: string, text: string, attachmentUrl?: string) => {
  try {
    let attachments = [];

    if (attachmentUrl) {

      const response = await axios.get(attachmentUrl, { responseType: "arraybuffer" });
      const pdfBuffer = Buffer.from(response.data, "binary");

      attachments.push({
        filename: "Factura-Boleta.pdf",
        content: pdfBuffer,
        contentType: "application/pdf",
      });
    }

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
      attachments, 
    });

    console.log("Correo enviado correctamente a:", to);
  } catch (error) {
    console.error("Error al enviar correo:", error);
    throw new Error("No se pudo enviar el correo.");
  }
};
