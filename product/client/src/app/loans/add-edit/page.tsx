import React from "react";
import  LoanPage  from "@/app/loans/add-edit/[loanId]/page";

export default function Page() {
  return (
    <LoanPage
      additionalColumns={false}
      shouldFetchLoan={false}
      showTransactionsPanel={false}
    />
  );
}