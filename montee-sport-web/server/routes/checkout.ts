// server/routes/checkout.ts
import express from "express";
import fetch from "node-fetch";
import { prisma } from "../../prisma/lib/prisma";
import type { XenditInvoice } from "../types/xendit"; // ✅ import shared type

const router = express.Router();

router.post("/checkout", async (req, res) => {
  const { amount, payerEmail } = req.body;

  try {
    // Create order in DB first
    const order = await prisma.order.create({
      data: {
        externalId: "order-" + Date.now(),
        amount,
        payerEmail,
        description: "Clothing Store Checkout",
      },
    });

    // Call Xendit API to create invoice
    const invoiceRes = await fetch("https://api.xendit.co/v2/invoices", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Basic " +
          Buffer.from(process.env.XENDIT_SECRET_KEY + ":").toString("base64"),
      },
      body: JSON.stringify({
        external_id: order.externalId,
        amount,
        payer_email: payerEmail,
        description: order.description,
        success_redirect_url: `http://localhost:3000/order/${order.id}`,
        failure_redirect_url: `http://localhost:3000/order/${order.id}?failed=true`,
      }),
    });

    if (!invoiceRes.ok) {
      const error = await invoiceRes.text();
      console.error("Xendit API error:", error);
      return res.status(400).json({ error: "Failed to create invoice" });
    }

    const invoice = (await invoiceRes.json()) as XenditInvoice;

    // Update order with invoice URL
    await prisma.order.update({
      where: { id: order.id },
      data: { invoiceUrl: invoice.invoice_url },
    });

    return res.json({ invoiceUrl: invoice.invoice_url, orderId: order.id });
  } catch (err) {
    console.error("Checkout error:", err);
    return res.status(500).json({ error: "Checkout failed" });
  }
});

export default router;
