// server/routes/checkout.ts
import express from "express";
import fetch from "node-fetch";
import { PrismaClient } from "../../src/generated/prisma";
import type { XenditInvoice } from "../types/xendit";
import { auth, type AuthRequest } from "../middleware/auth";

const router = express.Router();
const prisma = new PrismaClient();

interface CartItem {
  productId: number;
  quantity: number;
  size: string;
  price: number;
}

interface Product {
  id: number;
  price: number | string;
  discount: number | string;
}

router.post("/checkout", auth, async (req: AuthRequest, res) => {
  if (!process.env.XENDIT_SECRET_KEY || !process.env.FRONTEND_URL) {
    console.error('Missing required environment variables');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const { cart, shippingAddress } = req.body as { 
    cart: CartItem[], 
    shippingAddress: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    }
  };

  // Validate cart and shipping address
  if (!cart || cart.length === 0) {
    return res.status(400).json({ error: 'Cart is empty' });
  }

  if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || 
      !shippingAddress.state || !shippingAddress.postalCode || !shippingAddress.country) {
    return res.status(400).json({ error: 'Invalid shipping address' });
  }

  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  try {
    // Validate cart items and get current prices
    const productIds = cart.map(item => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds
        }
      }
    });

    if (products.length !== productIds.length) {
      return res.status(400).json({ error: 'Some products not found' });
    }

    // Calculate total with current prices
    const total = cart.reduce((sum: number, item) => {
      const product = products.find(p => p.id === item.productId);
      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }
      const price = typeof product.price === "object" && "toNumber" in product.price
        ? product.price.toNumber()
        : Number(product.price);
      const discount = typeof product.discount === "object" && "toNumber" in product.discount
        ? product.discount.toNumber()
        : Number(product.discount || 0);

      if (isNaN(price) || isNaN(discount)) {
        throw new Error(`Invalid price or discount for product: ${item.productId}`);
      }

      const currentPrice = price - discount;
      return sum + (currentPrice * item.quantity);
    }, 0);

    if (total <= 0) {
      return res.status(400).json({ error: 'Invalid total amount' });
    }

    // Create order with items
    const order = await prisma.order.create({
      data: {
        externalId: `order-${Date.now()}-${userId}`,
        userId,
        amount: total,
        status: "PENDING",
        shippingAddress: JSON.stringify(shippingAddress),
        orderItems: {
          create: cart.map(item => {
            const product = products.find(p => p.id === item.productId)!;
            // Handle Decimal type for price and discount
            const price = typeof product.price === "object" && "toNumber" in product.price
              ? product.price.toNumber()
              : Number(product.price);
            const discount = typeof product.discount === "object" && "toNumber" in product.discount
              ? product.discount.toNumber()
              : Number(product.discount);
            const currentPrice = price - discount;
            return {
              productId: item.productId,
              quantity: item.quantity,
              size: item.size,
              price: currentPrice
            };
          })
        }
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      }
    });

    // Get user email for Xendit
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

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
        amount: total,
        payer_email: user.email,
        description: `Order #${order.id}`,
        success_redirect_url: `${process.env.FRONTEND_URL}/order/${order.id}`,
        failure_redirect_url: `${process.env.FRONTEND_URL}/order/${order.id}?failed=true`,
      }),
    });

    if (!invoiceRes.ok) {
      const error = await invoiceRes.text();
      console.error("Xendit API error:", error);
      return res.status(400).json({ error: "Failed to create invoice" });
    }

    const invoice = (await invoiceRes.json()) as XenditInvoice;

    return res.json({ 
      invoiceUrl: invoice.invoice_url, 
      orderId: order.id,
      order: order 
    });
  } catch (err) {
    console.error("Checkout error:", err);
    return res.status(500).json({ error: "Checkout failed" });
  }
});

export default router;
