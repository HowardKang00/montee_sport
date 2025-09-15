import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { PrismaClient } from "../src/generated/prisma";
import orderRoutes from "./routes/orderStatus";
import checkoutRoutes from "./routes/checkout";
import webhookRoutes from "./routes/webhook";
import userRoutes from "./routes/users";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from the server's .env file
dotenv.config({ path: resolve(__dirname, '.env') });

// Initialize Express app and Prisma client
const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/order-status", orderRoutes);
app.use("/api/cart", checkoutRoutes);
app.use("/api/xendit", webhookRoutes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// Start server
app.listen(4000, () => console.log("Server running on http://localhost:4000"));
