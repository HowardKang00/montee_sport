// server/routes/orderStatus.ts
import express from "express";
import fetch from "node-fetch";
import { prisma } from "../../prisma/lib/prisma";
import type { XenditInvoice } from "../types/xendit"; // ✅ import shared type

const router = express.Router();

router.get("/order-status/:externalId", async (req, res) => {
  const { externalId } = req.params;

  try {
    const response = await fetch(
      `https://api.xendit.co/v2/invoices?external_id=${externalId}`,
      {
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(process.env.XENDIT_SECRET_KEY + ":").toString("base64"),
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Xendit error:", data);
      return res.status(400).json({ error: "Xendit API failed" });
    }

    if (!Array.isArray(data) || data.length === 0) {
      return res.status(404).json({ error: "No invoice found" });
    }

    const invoice: XenditInvoice = data[0];

    const updatedOrder = await prisma.order.update({
      where: { externalId },
      data: {
        status: invoice.status,
        paidAt: invoice.paid_at ? new Date(invoice.paid_at) : null,
      },
    });

    return res.json({
      status: invoice.status,
      paidAt: invoice.paid_at || null,
      expiryDate: invoice.expiry_date,
      dbOrder: updatedOrder,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch order status" });
  }
});

export default router;
