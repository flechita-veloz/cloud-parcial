import React from "react";
import  SalePage  from "@/app/sales/add-edit/[saleId]/page";

export default function Page() {
  return (
    <SalePage
      shouldFetchSale={false}
    />
  );
}