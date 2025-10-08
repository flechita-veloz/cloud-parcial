import { Response } from "express";
import axios from "axios";
import { PrismaClient } from "@prisma/client";
import numero2palabra from "./numero2palabra";

const prisma = new PrismaClient();

// Constants
export const SUNAT_API = {
  LAST_DOCUMENT_URL: "https://back.apisunat.com/personas/lastDocument",
  SEND_BILL_URL: "https://back.apisunat.com/personas/v1/sendBill",
  PERSONA_ID: process.env.PERSONA_ID,
  PERSONA_TOKEN: process.env.PERSONA_TOKEN,
  RUC: process.env.RUC
};

export const handleError = (res: Response, message: string, error: any): void => {
  console.error(`${message}:`, error);
  res.status(500).json({ message, error: error.message });
};

export const generateFileName = (type: string, suggestedNumber: string): string => {
  const serie = type === "Factura" ? "F001" : "B001";
  return `${SUNAT_API.RUC}-${type === "Factura" ? "01" : "03"}-${serie}-${suggestedNumber}`;
};

export const getSunatSuggestedNumber = async (type: string) => {
  return axios.post(SUNAT_API.LAST_DOCUMENT_URL, {
    personaId: SUNAT_API.PERSONA_ID,
    personaToken: SUNAT_API.PERSONA_TOKEN,
    type: type === "Factura" ? "01" : "03",
    serie: type === "Factura" ? "F001" : "B001",
  });
};

export const sendBillToSunat = async (jsonQuery: any) => {
  return axios.post(SUNAT_API.SEND_BILL_URL, jsonQuery, {
    headers: { "Content-Type": "application/json" }
  });
};

export const buildBillingRequest = async (saleId: string, suggestedNumber: string, type: 'Factura' | 'Boleta') => {
  const saleDetails = await prisma.salesDetail.findMany({
    where: { saleId },
    include: {
      product: true,
      sale: {
        include: {
          client: { include: { document: true } },
        },
      },
    },
  });

  if (!saleDetails.length) {
    throw new Error("No hay productos");
  }

  const client = saleDetails[0].sale!.client;
  const document = client.document;
  const taxExclAmount = saleDetails.reduce((sum, detail) => sum + detail.quantity * detail.unitPrice, 0);
  const taxAmount = taxExclAmount * 0.18;
  const totalAmount = taxExclAmount + taxAmount;
  const totalEnLetras = `${numero2palabra(String(totalAmount)).toUpperCase()} CON ${Math.round((totalAmount % 1) * 100).toString().padStart(2, "0")}/100 SOLES`;
  
  const peruDate = new Date().toLocaleString("es-PE", { timeZone: "America/Lima", hour12: false });
  const [datePart, timePart] = peruDate.split(", "); 
  const [day, month, year] = datePart.split("/").map(num => num.padStart(2, "0"));
  const formattedDate = `${year}-${month}-${day}`; 
  const formattedTime = timePart.trim();
  
  const serie = type === 'Factura' ? 'F001' : 'B001';
  const typeCode = type === 'Factura' ? '01' : '03';

  return {
    personaId: SUNAT_API.PERSONA_ID,
    personaToken: SUNAT_API.PERSONA_TOKEN,
    fileName: generateFileName(type, suggestedNumber),
    documentBody: {
      "cbc:UBLVersionID": { "_text": "2.1" },
      "cbc:CustomizationID": { "_text": "2.0" },
      "cbc:ID": { "_text": `${serie}-${suggestedNumber}` },
      "cbc:IssueDate": { "_text": formattedDate },
      "cbc:IssueTime": { "_text": formattedTime },
      "cbc:InvoiceTypeCode": { "_attributes": { "listID": "0101" }, "_text": typeCode },
      "cbc:Note": [{ "_text": totalEnLetras, "_attributes": { "languageLocaleID": "1000" } }],
      "cbc:DocumentCurrencyCode": { "_text": "PEN" },
      "cac:AccountingSupplierParty": {
        "cac:Party": {
          "cac:PartyIdentification": { 
            "cbc:ID": { "_attributes": { "schemeID": "6" }, "_text": SUNAT_API.RUC } 
          },
          "cac:PartyName": {
            "cbc:Name": {"_text": process.env.EMPRESA_NAME}
          },
          "cac:PartyLegalEntity": { 
            "cbc:RegistrationName": { "_text": process.env.EMPRESA_REGISTRATION_NAME},  
            "cac:RegistrationAddress": {
              "cbc:AddressTypeCode": {"_text": "0000"},
              "cac:AddressLine": {"cbc:Line": {"_text": process.env.EMPRESA_DIRECTION}}
            },
          },
        },
      },
      "cac:AccountingCustomerParty": {
        "cac:Party": {
          "cac:PartyIdentification": { 
            "cbc:ID": { 
              "_attributes": { "schemeID": document?.typeDocument === "RUC" ? "6" : "1" }, 
              "_text": document?.number 
            } 
          },
          "cac:PartyLegalEntity": { 
            "cbc:RegistrationName": { "_text": client.name },
            "cac:RegistrationAddress": { 
              "cac:AddressLine": {
                "cbc:Line": { "_text": client.address }
              }
            },
          },
        },
      },
      "cac:TaxTotal": { 
        "cbc:TaxAmount": { "_attributes": { "currencyID": "PEN" }, "_text": taxAmount.toFixed(2) },
        "cac:TaxSubtotal": [
          {
            "cbc:TaxableAmount": {
              "_attributes": { "currencyID": "PEN" },
              "_text": taxExclAmount.toFixed(2) 
            },
            "cbc:TaxAmount": {
              "_attributes": { "currencyID": "PEN" },
              "_text": taxAmount.toFixed(2) 
            },
            "cac:TaxCategory": {
              "cac:TaxScheme": {
                "cbc:ID": { "_text": "1000" }, 
                "cbc:Name": { "_text": "IGV" }, 
                "cbc:TaxTypeCode": { "_text": "VAT" } 
              }
            }
          }
        ]
      },
      "cac:LegalMonetaryTotal": {
        "cbc:LineExtensionAmount": { "_attributes": { "currencyID": "PEN" }, "_text": taxExclAmount.toFixed(2) },
        "cbc:TaxInclusiveAmount": { "_attributes": { "currencyID": "PEN" }, "_text": totalAmount.toFixed(2) },
        "cbc:PayableAmount": { "_attributes": { "currencyID": "PEN" }, "_text": totalAmount.toFixed(2) }
      },
      ...(type === "Factura" && {
        "cac:PaymentTerms": [
          {
            "cbc:ID": { "_text": "FormaPago" },
            "cbc:PaymentMeansID": { "_text": "Contado" }
          }
        ]
      }),
      "cac:InvoiceLine": saleDetails.map((detail, index) => ({
        "cbc:ID": { "_text": String(index + 1) },
        "cbc:InvoicedQuantity": { 
          "_attributes": { "unitCode": "NIU" }, 
          "_text": detail.quantity 
        },
        "cbc:LineExtensionAmount": { 
          "_attributes": { "currencyID": "PEN" }, 
          "_text": (detail.quantity * detail.unitPrice).toFixed(2) 
        },
        "cac:PricingReference": {
          "cac:AlternativeConditionPrice": {
            "cbc:PriceAmount": {
              "_attributes": { "currencyID": "PEN" },
              "_text": (detail.unitPrice * 1.18).toFixed(2)
            },
            "cbc:PriceTypeCode": { "_text": "01" }
          }
        },
        "cac:TaxTotal": {
          "cbc:TaxAmount": {
            "_attributes": { "currencyID": "PEN" },
            "_text": ((detail.quantity * detail.unitPrice) * 0.18).toFixed(2)
          },
          "cac:TaxSubtotal": [
            {
              "cbc:TaxableAmount": {
                "_attributes": { "currencyID": "PEN" },
                "_text": (detail.quantity * detail.unitPrice).toFixed(2)
              },
              "cbc:TaxAmount": {
                "_attributes": { "currencyID": "PEN" },
                "_text": ((detail.quantity * detail.unitPrice) * 0.18).toFixed(2)
              },
              "cac:TaxCategory": {
                "cbc:Percent": { "_text": String(18) }, 
                "cbc:TaxExemptionReasonCode": { "_text": "10" },
                "cac:TaxScheme": {
                  "cbc:ID": { "_text": "1000" },
                  "cbc:Name": { "_text": "IGV" },
                  "cbc:TaxTypeCode": { "_text": "VAT" }
                }
              }
            }
          ]
        },
        "cac:Item": { 
          "cbc:Description": { "_text": detail.product.name } 
        },
        "cac:Price": { 
          "cbc:PriceAmount": { 
            "_attributes": { "currencyID": "PEN" }, 
            "_text": detail.unitPrice.toFixed(2) 
          } 
        }
      }))
    }
  };
}; 