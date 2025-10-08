import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Loader2, CheckCircle, XCircle} from "lucide-react";
import { Billing } from "@/state/api";
import { useEffect, useState } from "react";

{ /* Interface for DownloadOptionsModal component props */ }
interface SaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: {
    number: number;
    totalAmount: number;
    billing?: {
      type: string;
    } | null;
  } | null;
  billing?: Billing | null;
  billingStatus: "PENDIENTE" | "EXCEPCION" | "ACEPTADO" | "RECHAZADO"; 
}

{ /* DownloadOptionsModal Component: Handles document download options and sharing */ }
const DownloadOptionsModal: React.FC<SaleModalProps> = ({ isOpen, onClose, sale, billing, billingStatus}) => {
  const [localBilling, setLocalBilling] = useState<Billing | null>(billing ?? null);
  const [email, setEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [whatsappStatus, setWhatsappStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  { /* Update local billing state when billing prop changes */ }
  useEffect(() => {
    if (billing) {
      setLocalBilling({ ...billing }); 
    }
  }, [billing]);

  { /* Handle document download with format options */ }
  const handleDownload = async (format: string, openInNewTab = false) => {
    if (!localBilling) return;
    
    const url = `https://back.apisunat.com/documents/${localBilling.idSunat}/getPDF/${format}/${localBilling.fileNameSunat}.pdf`;
    
    try {
      const response = await fetch(url, { method: "GET" });
      if (!response.ok) throw new Error("Error al obtener el PDF");
  
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
  
      if (openInNewTab) {
        window.open(downloadUrl, "_blank");
      } else {
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = `${localBilling.fileNameSunat}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(downloadUrl);
      }
    } catch (error) {
      console.error("Error al obtener el documento:", error);
      alert("No se pudo obtener el documento. Inténtalo nuevamente.");
    }
  };

  { /* Handle email sending */ }
  const handleSendEmail = async () => {
    if (!email) {
      alert("Por favor, ingresa un correo válido.");
      return;
    }
    if (!localBilling || !localBilling.idSunat || !localBilling.fileNameSunat) {
      alert("No se encontró la información del documento.");
      return;
    }
  
    setEmailStatus("loading");
    const format = "A4";
  
    try {
      const response = await fetch("http://localhost:3001/users/enviar-correo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          idSunat: localBilling.idSunat,
          format,
          fileNameSunat: localBilling.fileNameSunat,
        }),
      });
  
      if (response.ok) {
        setEmailStatus("success");
        setTimeout(() => setEmailStatus("idle"), 3000); 
      } else {
        setEmailStatus("error"); 
        setTimeout(() => setEmailStatus("idle"), 3000); 
      }
    } catch (error) {
      console.error("Error enviando correo:", error);
      setEmailStatus("error"); 
      setTimeout(() => setEmailStatus("idle"), 3000); 
    }
  };

  { /* Handle WhatsApp message sending */ }
  const handleSendWhatsApp = async () => {
    if (!whatsappNumber) {
      alert("Ingresa un número de WhatsApp");
      return;
    }
    
    setWhatsappStatus("loading");

    try {
      const response = await fetch("http://localhost:3001/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: whatsappNumber,
          template: "hello_world",
        }),
      });
  
      setWhatsappStatus(response.ok ? "success" : "error");
    } catch (error) {
      console.error("Error al enviar mensaje de WhatsApp:", error);
      setWhatsappStatus("error");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="fixed top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/6 bg-white shadow-lg rounded-lg">
        { /* Modal Header */ }
        <DialogHeader className="flex justify-between items-center">
          <DialogTitle className="text-lg font-semibold">
            Completar venta
          </DialogTitle>
        </DialogHeader>

        { /* Modal Content */ }
        {sale ? (
          <>
            { /* Pending State */ }
            {billingStatus === "PENDIENTE" && (
              <div className="flex flex-col items-center gap-3 p-4">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                <p className="text-blue-600 font-medium">Enviando a SUNAT...</p>
              </div>
            )}

            { /* Success State */ }
            {billingStatus === "ACEPTADO" && localBilling && (
              <div className="flex flex-col items-center gap-3 p-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
                <p className="text-green-600 font-medium">Factura/Boleta lista</p>
                
                { /* Download Options */ }
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleDownload("A4", true)}>🖨️ A4</Button>
                  <Button variant="outline" size="sm" onClick={() => handleDownload("A5", true)}>🖨️ A5</Button>
                  <Button variant="outline" size="sm" onClick={() => handleDownload("ticket58mm", true)}>🖨️ 58mm</Button>
                  <Button variant="outline" size="sm" onClick={() => handleDownload("ticket80mm", true)}>🖨️ 80mm</Button>
                  <Button variant="default" size="sm" className="col-span-2" onClick={() => handleDownload("A4")}>⬇️ Descargar</Button>
                </div>

                { /* Communication Options */ }
                <div className="w-full mt-4 space-y-3">
                  { /* WhatsApp Input */ }
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Número de WhatsApp"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      className="flex-1 border rounded-lg px-3 py-1 text-sm"
                    />
                    <Button variant="outline" size="sm" onClick={handleSendWhatsApp}>
                      {whatsappStatus === "loading" ? (
                        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                      ) : whatsappStatus === "success" ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : whatsappStatus === "error" ? (
                        <XCircle className="w-5 h-5 text-red-600" />
                      ) : (
                        <>📞 Enviar</>
                      )}
                    </Button>
                  </div>

                  { /* Email Input */ }
                  <div className="flex items-center gap-2">
                    <input
                      type="email"
                      placeholder="Correo electrónico"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 border rounded-lg px-3 py-1 text-sm"
                    />
                    <Button variant="outline" size="sm" onClick={handleSendEmail}>
                      {emailStatus === "loading" ? (
                        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                      ) : emailStatus === "success" ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : emailStatus === "error" ? (
                        <XCircle className="w-5 h-5 text-red-600" />
                      ) : (
                        <>✉️ Enviar</>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            { /* Error State */ }
            {(billingStatus === "RECHAZADO" || billingStatus === "EXCEPCION") && (
              <Alert variant="destructive" className="flex items-center gap-3 p-3 bg-red-100 text-red-800 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <div>
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    Hubo un problema al generar la boleta/factura.
                  </AlertDescription>
                </div>
              </Alert>
            )}
          </>
        ) : (
          <p className="text-gray-500">No hay información de la venta.</p>
        )}

        { /* Modal Footer */ }
        <DialogFooter className="flex justify-end">
          <Button onClick={onClose} variant="default">
            Finalizar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DownloadOptionsModal;