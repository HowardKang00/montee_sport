// server/routes/orderStatus.ts
import express from "express";
import fetch from "node-fetch";
import { PrismaClient } from "../../src/generated/prisma";
import type { XenditInvoice } from "../types/xendit";
import { auth } from "../middleware/auth";

const router = express.Router();
const prisma = new PrismaClient();
// const auth = require('../middleware/auth');

router.get("/:orderId", auth, async (req, res) => {
  const { orderId } = req.params;
  const userId = (req.user && 'userId' in req.user) ? (req.user as { userId: number }).userId : undefined;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // First, get the order and verify it belongs to the user
    const order = await prisma.order.findFirst({
      where: {
        id: parseInt(orderId),
        userId
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Then check Xendit status
    const response = await fetch(
      `https://api.xendit.co/v2/invoices?external_id=${order.externalId}`,
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
      return res.status(400).json({ error: "Payment status check failed" });
    }

    if (!Array.isArray(data) || data.length === 0) {
      return res.json({ 
        order,
        payment: { status: order.status }
      });
    }

    const invoice: XenditInvoice = data[0];

    // Update order status if it has changed
    if (invoice.status !== order.status) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: invoice.status }
      });
      order.status = invoice.status;
    }

    return res.json({
      order,
      payment: {
        status: invoice.status,
        paidAt: invoice.paid_at || null,
        expiryDate: invoice.expiry_date,
        invoiceUrl: invoice.invoice_url
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch order status" });
  }
});

export default router;