import React from "react";
import  PurchasePage  from "@/app/purchases/add-edit/[purchaseId]/page";

export default function Page() {
  return (
    <PurchasePage
      shouldFetchSale={false}
    />
  );
}