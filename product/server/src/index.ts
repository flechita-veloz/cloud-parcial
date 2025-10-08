import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
/* ROUTE IMPORTS */
import dashboardRoutes from "./routes/dashboardRoutes";
import productRoutes from "./routes/productRoutes";
import userRoutes from "./routes/userRoutes";
import expenseRoutes from "./routes/expenseRoutes";
import salesRoutes from "./routes/salesRoutes";
import clientsRoutes from "./routes/clientsRoutes";
import billingsRoutes from "./routes/billingsRoutes";
import saleDetailRoutes from "./routes/saleDetailRoutes";
import transactionRoutes from "./routes/transactionRoutes";
import whatsappRoutes from "./routes/whatsappRoutes";
import purchasesRoutes from "./routes/purchasesRoutes";
import loansRoutes from "./routes/loansRoutes";

/* CONFIGURATIONS */
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// --------------------
// Configuración CORS
// --------------------
// Usar variable de entorno para tu frontend
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

app.use(cors());

/* ROUTES */
app.use("/dashboard", dashboardRoutes);
app.use("/products", productRoutes);
app.use("/users", userRoutes);
app.use("/expenses", expenseRoutes);
app.use("/sales", salesRoutes);
app.use("/clients", clientsRoutes);
app.use("/billings", billingsRoutes);
app.use("/sales-details", saleDetailRoutes);
app.use("/transactions", transactionRoutes);
app.use("/purchases", purchasesRoutes);
app.use("/loans", loansRoutes);
app.use("/webhooks/whatsapp", whatsappRoutes);
app.use("/whatsapp/", whatsappRoutes);

/* SERVER */
const port = Number(process.env.PORT) || 8000;
app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
  console.log(`CORS allowed for: ${FRONTEND_URL}`);
});