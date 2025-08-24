import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import { PrismaClient } from "@prisma/client";
import orderRoutes from "./routes/orderStatus"; 

const app = express();
const prisma = new PrismaClient();
app.use(cors());
app.use(express.json());
app.use("/api/order-status", orderRoutes);

const XENDIT_SECRET_KEY = process.env.XENDIT_SECRET_KEY;

// 1. Checkout Route
app.post("/api/cart/checkout", async (req, res) => {
  try {
    const { cart, email } = req.body;
    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const externalId = "order-" + Date.now();

    const response = await fetch("https://api.xendit.co/v2/invoices", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Basic " + Buffer.from(XENDIT_SECRET_KEY + ":").toString("base64"),
      },
      body: JSON.stringify({
        external_id: externalId,
        payer_email: email,
        description: "Clothing Store Order",
        amount: total,
        currency: "IDR",
        success_redirect_url: "http://localhost:5173/success",
        failure_redirect_url: "http://localhost:5173/failure",
      }),
    });

    const data = await response.json();

    // Save order in DB
    await prisma.order.create({
      data: {
        externalId,
        email,
        amount: total,
        status: "PENDING",
      },
    });

    res.json({ invoice_url: data.invoice_url, external_id: externalId });
  } catch (err) {
    console.error("Checkout error:", err);
    res.status(500).json({ error: "Failed to create invoice" });
  }
});

// 2. Webhook Handler
app.post("/api/xendit/webhook", async (req, res) => {
  try {
    const event = req.body;

    console.log("Webhook received:", event);

    await prisma.order.update({
      where: { externalId: event.external_id },
      data: { status: event.status },
    });

    res.status(200).send("Webhook received");
  } catch (err) {
    console.error("Webhook error:", err);
    res.status(500).send("Failed to update order");
  }
});

// 3. Order Status Query
app.get("/api/orders/:externalId", async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { externalId: req.params.externalId },
    });

    if (!order) return res.status(404).json({ error: "Order not found" });

    res.json(order);
  } catch (err) {
    console.error("Order fetch error:", err);
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

// Start server
app.listen(4000, () => console.log("Server running on http://localhost:4000"));
