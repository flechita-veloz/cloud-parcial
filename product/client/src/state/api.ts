import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface Product {
  productId: string;
  name: string;
  price: number;
  rating?: number;
  stockQuantity: number;
  code: string;
  typeTax: string,
  valueTax: number,
  includeTax: boolean
}

export interface Document {
  documentId: string;
  typeDocument: string;
  number: string;
}

export interface NewProduct {
  name: string;
  price: number;
  rating?: number;
  stockQuantity: number;
  code: string;
  typeTax: string,
  valueTax: number,
  includeTax: boolean
}

export interface SalesSummary {
  totalSold: number;
  changePercentage?: number;
  date: string;
}

export interface PurchaseSummary {
  totalPurchased: number;
  changePercentage?: number;
  date: string;
}

export interface LoanSummary {
  totalLoanedReturned: number;
  totalLoanedUnreturned: number;
  totalSold: number;    
  date: string;
}

export interface ExpenseSummary {
  totalExpense: number;
  changePercentage: number;
}

export interface TransactionTypeSummary {
  total: number;
  changePercentage: number;
}

export interface TransactionSummary {
  deposit: TransactionTypeSummary;
  withdrawal: TransactionTypeSummary;
}

export interface DashboardMetrics {
  salesSummary: SalesSummary[];
  purchaseSummary: PurchaseSummary[];
  loanSummary: LoanSummary[];
  expenseSummary: ExpenseSummary;
  transactionSummary: TransactionSummary;
}

export interface User {
  userId: string;
  names: string;
  email: string;
  username: string;
  surnames: string;
  type: string;
}

export interface NewUser {
  names: string;
  email: string;
  username: string;
  surnames: string;
  type: string;
}

interface ClientDocument {
  number: string;
  typeDocument: string;
}

export interface Client {
  clientId: string;
  name: string;
  type: string;
  phone?: string;
  mail?: string;
  address?: string;
  document?: ClientDocument | null;
}

export interface NewClient {
  name: string;
  type: string;
  phone?: string;
  mail?: string;
  address?: string;
  document?: ClientDocument | null;
}

export interface SalesDetail {
  saleDetailId: string;
  saleId?: string;
  productId: string;
  purchaseId?: string;
  loanId?: string;
  quantity: number;
  unitPrice: number;
  nameProduct: string;  
  typeTax: string;
  valueTax: number;
  codeProduct: string;
  status: "DEVUELTO" | "POR_DEVOLVER" | "VENDIDO",
  product: Product;
}

export interface NewSalesDetail {
  saleId?: string;
  productId: string;
  purchaseId?: string;
  loanId?: string;
  quantity: number;
  unitPrice: number;
  nameProduct: string;  
  typeTax: string;
  valueTax: number;
  codeProduct: string;
  status: "DEVUELTO" | "POR_DEVOLVER" | "VENDIDO",
}


export interface Sale {
  saleId: string;
  clientId: string;
  totalAmount: number;
  date: string;
  userId: string;
  state: "PAGADO" | "DEUDA";
  number: number;
  discount: number;
  isPercentageDiscount: boolean;
  saleDetails: SalesDetail[];
  transactions: Transaction[];
  client: Client;
  user: User;
  billing?: Billing | null; // Opcional, porque no todas las ventas tienen facturación
}

export interface NewSale {
  clientId: string;
  totalAmount: number;
  date: string;
  userId: string;
  state: string;
  discount?: number;
  isPercentageDiscount?: boolean;
}

export interface Loan {
  loanId: string;
  clientId: string;
  userId: string;
  date: string;
  state: "PAGADO" | "DEUDA";
  number: number;
  totalLoanedReturned: number;
  totalLoanedUnreturned: number;
  totalSold: number;      
  totalAmount: number;
  loanDetails: SalesDetail[];
  transactions: Transaction[];
  client: Client;
  user: User;
  sale: Sale;
}

export interface NewLoan {
  clientId: string;
  userId: string;
  date: string;
  totalLoanedReturned: number;
  totalLoanedUnreturned: number;
  totalSold: number;      
  totalAmount: number;
  state: string;
}


export interface Purchase {
  purchaseId: string;
  supplierId: string;
  totalAmount: number;
  date: string;
  userId: string;
  state: "PAGADO" | "DEUDA" | "CANCELADO";
  number: number;
  discount: number;
  isPercentageDiscount: boolean;
  billingNumber: string;
  billingType: string;
  shipping: number;
  supplier: Client;
  user: User;
  purchaseDetails: SalesDetail[];
  transactions: Transaction[];
}

export interface NewPurchase {
  supplierId: string;
  totalAmount: number;
  date: string;
  userId: string;
  state: string;
  discount: number;
  isPercentageDiscount: boolean;
  billingNumber: string;
  billingType: string;
  shipping: number;
}

export interface Billing {
  billingId: string;
  saleId: string;
  type: "Factura" | "Boleta" | "";
  state: "PENDIENTE" | "EXCEPCION" | "ACEPTADO" | "RECHAZADO";
  number: number;
  idSunat: string;
  fileNameSunat: string;
}

export interface NewBilling {
  saleId: string;
  type: "Factura" | "Boleta" | "";
  state: "PENDIENTE" | "EXCEPCION" | "ACEPTADO" | "RECHAZADO";
}

export interface Transaction {
  transactionId: string;
  saleId?: string;
  userId: string;
  purchaseId?: string;
  expenseId?: string;
  loanId?: string;
  date: string;
  paymentMethod: string;
  type: "Depósito" | "Retiro" | "";
  amount: number;
  description: string;
  origin: string;
}

export interface NewTransaction {
  saleId?: string;
  userId: string;
  purchaseId?: string;
  expenseId?: string;
  loanId?: string;
  date: string;
  paymentMethod: string;
  type: "Depósito" | "Retiro" | "";
  amount: number;
  description: string;
  origin: string;
}

export interface Expense {
  expenseId:        string;
  userId:           string;
  hasVoucher:       boolean;
  companyName?:     string;
  RUC?:             string;
  billingNumber?:   string;
  billingType?:     string;
  transaction:      Transaction;
  user:             User;
}

export interface NewExpense {
  userId:           string;
  hasVoucher:       boolean;
  companyName?:     string;
  RUC?:             string;
  billingNumber?:   string;
  billingType?:     string;
}

export const api = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_API_URL }),
  reducerPath: "api",
  tagTypes: ["DashboardMetrics", "Products", "Users", "Expenses", "Sales", "Clients", 
             "Transactions", "Billings", "SalesDetails", "Purchases", "Loans"],
  /* ENDPOINTS */
  endpoints: (build) => ({

    /* DASHBOARD METRICS */
    getDashboardMetrics: build.query<
      DashboardMetrics,
      { startDate?: string; endDate?: string } | void>({
      query: (params) => {
        // Si no hay fechas, devuelve el endpoint base
        if (!params || (!params.startDate && !params.endDate)) {
          return "/dashboard";
        }

        const queryParams = new URLSearchParams();
        if (params.startDate) queryParams.append("startDate", params.startDate);
        if (params.endDate) queryParams.append("endDate", params.endDate);

        return `/dashboard?${queryParams.toString()}`;
      },
      providesTags: ["DashboardMetrics"],
    }),

    /* PRODUCTS */
    getProducts: build.query<Product[], string | void>({
      query: () => "/products",
      providesTags: ["Products"],
    }),
    getSalesByProductId: build.query<Sale[], string | void>({
      query: (productId) => `/products/sales/${productId}`,
      providesTags: (result) =>
        result
          ? [...result.map((sale) => ({ type: "Sales" as const, id: sale.saleId })), { type: "Sales" }]
          : [{ type: "Sales" }],
    }),
    searchProducts: build.query<Product[], string | undefined>({
      query: (search) => ({
        url: "/products/search",
        params: search ? { search } : {},
      }),
      providesTags: ["Products"],
    }),
    getProductById: build.query<Product, string>({
      query: (productId) => `/products/${productId}`,
      providesTags: ["Products"],
    }),
    createProduct: build.mutation<Product, NewProduct>({
      query: (newProduct) => ({
        url: "/products",
        method: "POST",
        body: newProduct,
      }),
      invalidatesTags: ["Products"],
    }),
    updateProduct: build.mutation<Product, { productId: string; updatedData: Partial<Product> }>({
      query: ({ productId, updatedData }) => ({
        url: `/products/${productId}`,
        method: "PUT", 
        body: updatedData,
      }),
      invalidatesTags: ["Products"], 
    }),
    deleteProducts: build.mutation<void, string[]>({
      query: (productIds) => ({
        url: "/products",
        method: "DELETE",
        body: { productIds },
      }),
      invalidatesTags: ["Products"],
    }),

    /* USERS */
    getUsers: build.query<User[], void>({
      query: () => "/users",
      providesTags: ["Users"],
    }),

    getUserById: build.query<User, string>({
      query: (userId) => `/users/${userId}`,
      providesTags: ["Users"],
    }),

    createUser: build.mutation<User, NewUser>({
      query: (newUser) => ({
        url: "/users",
        method: "POST",
        body: newUser,
      }),
      invalidatesTags: ["Users"]
    }),

    updateUser: build.mutation<User, { userId: string; data: Partial<NewUser> }>({
      query: ({ userId, data }) => ({
        url: `/users/${userId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Users"]
    }),
    
    deleteUser: build.mutation<void, string>({
      query: (userId) => ({
        url: `/users/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Users"]
    }),


    /* CLIENTS */
    getClients: build.query<Client[], void>({
      query: () => "/clients",
      providesTags: ["Clients"],
    }),
    getClientById: build.query<Client, string>({
      query: (clientId) => `/clients/${clientId}`,
      providesTags: ["Clients"],
    }),
    searchClients: build.query<Client[], string | undefined>({
      query: (search) => ({
        url: "/clients/search",
        params: search ? { search } : {},
      }),
      providesTags: ["Clients"],
      transformResponse: (clients: Client[]): Client[] => {
        return clients.map(client => ({
          ...client,
          document: client.document
            ? { number: client.document.number, typeDocument: client.document.typeDocument }
            : null, 
        }));
      }
    }),
    createClient: build.mutation<Client, NewClient>({
      query: (newClient) => ({
        url: "/clients",
        method: "POST",
        body: newClient,
      }),
      invalidatesTags: ["Clients"],
    }),
    updateClient: build.mutation<Client, { clientId: string; updatedData: Partial<NewClient> }>({
      query: ({ clientId, updatedData }) => ({
        url: `/clients/${clientId}`,
        method: "PUT",
        body: updatedData,
      }),
      invalidatesTags: ["Clients"],
    }),
    deleteClient: build.mutation<{ message: string }, string>({
      query: (clientId) => ({
        url: `/clients/${clientId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Clients"],
    }),
    

    /* SALES */
    getSales: build.query<Sale[], void>({
      query: () => "/sales",
      transformResponse: (sales: Sale[]) => {
        return sales.map((sale) => ({
          ...sale,
          billing: sale.billing ?? null, 
        }));
      },
      providesTags: ["Sales"],
    }),
    getLastSaleNumber: build.query<{ number: number }, void>({
      query: () => "/sales/last-sale-number",
      providesTags: ["Sales"],
    }),
    getSaleByID: build.query<Sale, string>({
      query: (saleId) => `/sales/${saleId}`,
      providesTags: (result, error, saleId) => [{ type: "Sales", id: saleId }],
    }),
    createSale: build.mutation<Sale, NewSale>({
      query: (newSale) => ({
        url: "/sales",
        method: "POST",
        body: newSale,
      }),
      invalidatesTags: ["Sales"],
    }),
    updateSale: build.mutation<Sale, { saleId: string; data: Partial<NewSale> }>({
      query: ({ saleId, data }) => ({
        url: `/sales/${saleId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { saleId }) => [{ type: "Sales", id: saleId }],
    }),
    deleteSale: build.mutation<void, string>({
      query: (saleId) => ({
        url: `/sale/${saleId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Sales"]
    }),

    /* LOANS */
    getLoans: build.query<Loan[], void>({
      query: () => "/loans",
      providesTags: (result) =>
        result
          ? [
              ...result.map((loan) => ({ type: "Loans" as const, id: loan.loanId })),
              { type: "Loans" },
            ]
          : [{ type: "Loans" }],
    }),
    getLastLoanNumber: build.query<{ number: number }, void>({
      query: () => "/loans/last-loan-number",
      providesTags: ["Loans"],
    }),
    getLoanByID: build.query<Loan, string>({
      query: (loanId) => `/loans/${loanId}`,
      providesTags: (result, error, loanId) => [{ type: "Loans", id: loanId }],
    }),
    createLoan: build.mutation<Loan, NewLoan>({
      query: (newLoan) => ({
        url: "/loans",
        method: "POST",
        body: newLoan,
      }),
      invalidatesTags: ["Loans"],
    }),
    updateLoan: build.mutation<Loan, { loanId: string; data: Partial<NewLoan> }>({
      query: ({ loanId, data }) => ({
        url: `/loans/${loanId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { loanId }) => [
        { type: "Loans", id: loanId },
        { type: "Loans" },
      ]
    }),

    /* PURCHASES */
    getPurchases: build.query<Purchase[], void>({
      query: () => "/purchases",
      providesTags: ["Purchases"],
    }),
    getLastPurchaseNumber: build.query<{ number: number }, void>({
      query: () => "/purchases/last-purchase-number",
      providesTags: ["Purchases"],
    }),
    getPurchaseByID: build.query<Purchase, string>({
      query: (purchaseId) => `/purchases/${purchaseId}`,
      providesTags: (result, error, purchaseId) => [{ type: "Purchases", id: purchaseId }],
    }),
    createPurchase: build.mutation<Purchase, NewPurchase>({
      query: (newPurchase) => ({
        url: "/purchases",
        method: "POST",
        body: newPurchase,
      }),
      invalidatesTags: ["Purchases"],
    }),
    updatePurchase: build.mutation<Purchase, { purchaseId: string; data: Partial<NewPurchase> }>({
      query: ({ purchaseId, data }) => ({
        url: `/purchases/${purchaseId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { purchaseId }) => [{ type: "Purchases", id: purchaseId }],
    }),

    /* TRANSACTIONS */
    getTransactions: build.query<Transaction[], void>({
      query: () => "/transactions",
      providesTags: ["Transactions"],
    }),
    getTransactionById: build.query<Transaction, string>({
      query: (transactionId) => `/transactions/${transactionId}`,
      providesTags: ["Transactions"],
    }),
    createTransaction: build.mutation<Transaction, NewTransaction>({
      query: (newTransaction) => ({
        url: "/transactions",
        method: "POST",
        body: newTransaction,
      }),
      invalidatesTags: ["Transactions", "Sales", "Purchases", "Expenses", "Loans"]
    }),
    updateTransaction: build.mutation<Transaction, { transactionId: string; data: Partial<NewTransaction> }>({
      query: ({ transactionId, data }) => ({
        url: `/transactions/${transactionId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Transactions", "Sales", "Purchases", "Expenses", "Loans"]
    }),
    
    deleteTransaction: build.mutation<void, string>({
      query: (transactionId) => ({
        url: `/transactions/${transactionId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Transactions", "Sales", "Purchases", "Expenses", "Loans"]
    }),

    /* EXPENSES */
    getExpenses: build.query<Expense[], void>({
      query: () => "/expenses",
      providesTags: ["Expenses"],
    }),
    getExpenseById: build.query<Expense, string>({
      query: (expenseId) => `/expenses/${expenseId}`,
      providesTags: ["Expenses"],
    }),
    createExpense: build.mutation<Expense, NewExpense>({
      query: (newExpense) => ({
        url: "/expenses",
        method: "POST",
        body: newExpense,
      }),
      invalidatesTags: ["Expenses"],
    }),
    updateExpense: build.mutation<Expense, { expenseId: string; data: Partial<NewExpense> }>({
      query: ({ expenseId, data }) => ({
        url: `/expenses/${expenseId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Expenses"],
    }),
    deleteExpense: build.mutation<void, string>({
      query: (expenseId) => ({
        url: `/expenses/${expenseId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Expenses"],
    }),

    /* BILLINGS */
    getBillings: build.query<Billing[], void>({
      query: () => "/billings",
      providesTags: ["Billings"],
    }),
    getLastBillingNumber: build.query<{ number: number }, void>({
      query: () => "/billings/last-billing-number",
      providesTags: ["Billings"],
    }),
    createBilling: build.mutation<Billing, NewBilling>({
      query: (newBilling) => ({
        url: "/billings",
        method: "POST",
        body: newBilling,
      }),
      invalidatesTags: ["Billings", "Sales"], 
    }),
    updateBilling: build.mutation<Billing, { billingId: string; data: Partial<Billing> }>({
      query: ({ billingId, data }) => ({
        url: `/billings/${billingId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { billingId }) => [
        { type: "Billings", id: billingId },
        { type: "Sales" },
      ],
    }),

    /* SALES DETAILS */
    getSalesDetails: build.query<SalesDetail[], void>({
      query: () => "/sales-details",
      providesTags: ["SalesDetails"],
    }),
    createSalesDetail: build.mutation<SalesDetail, NewSalesDetail>({
      query: (newSalesDetail) => ({
        url: "/sales-details",
        method: "POST",
        body: newSalesDetail,
      }),
      invalidatesTags: ["SalesDetails", "Sales", "Purchases", "Loans"],
    }),
    updateSalesDetail: build.mutation<SalesDetail, { saleDetailId: string; data: Partial<NewSalesDetail> }>({
      query: ({ saleDetailId, data }) => ({
        url: `/sales-details/${saleDetailId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["SalesDetails", "Sales", "Purchases", "Loans"],
    }),
    deleteSaleDetail: build.mutation<void, string>({
      query: (saleDetailId) => ({
        url: `/sales-details/${saleDetailId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["SalesDetails", "Sales", "Purchases", "Loans"],
    }),
  }),
});

export const {
  useGetDashboardMetricsQuery,
  useGetProductsQuery,
  useSearchProductsQuery,
  useGetProductByIdQuery,
  useGetSalesByProductIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductsMutation,
  useGetUsersQuery,
  useGetClientsQuery,
  useCreateClientMutation,
  useGetSalesQuery,
  useGetSaleByIDQuery,
  useCreateSaleMutation,
  useGetTransactionsQuery,
  useCreateTransactionMutation,
  useGetBillingsQuery,
  useCreateBillingMutation,
  useGetSalesDetailsQuery,
  useCreateSalesDetailMutation,
  useUpdateBillingMutation,
  useUpdateSaleMutation,
  useUpdateSalesDetailMutation,
  useUpdateTransactionMutation,
  useDeleteSaleDetailMutation,
  useDeleteTransactionMutation,
  useSearchClientsQuery,
  useGetLastBillingNumberQuery,
  useGetLastSaleNumberQuery,
  useDeleteClientMutation,
  useUpdateClientMutation,
  useGetClientByIdQuery,
  useGetPurchasesQuery,
  useGetLastPurchaseNumberQuery,
  useGetPurchaseByIDQuery,
  useCreatePurchaseMutation,
  useUpdatePurchaseMutation,
  useGetTransactionByIdQuery,
  useGetExpensesQuery,
  useGetExpenseByIdQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetUserByIdQuery,
  useCreateLoanMutation,
  useGetLastLoanNumberQuery,
  useGetLoanByIDQuery,
  useUpdateLoanMutation,
  useGetLoansQuery,
  useDeleteSaleMutation
} = api;
