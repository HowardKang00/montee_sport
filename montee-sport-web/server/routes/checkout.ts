// server/routes/checkout.ts
import express from "express";
import fetch from "node-fetch";
import { PrismaClient } from "../../src/generated/prisma";
import type { XenditInvoice } from "../types/xendit";
import { auth } from "../middleware/auth";

// Biteship API config
const BITESHIP_API_KEY = process.env.BITESHIP_API_KEY;
const BITESHIP_API_URL = "https://api.biteship.com/v1";

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

router.post("/checkout", auth, async (req, res) => {
  if (!process.env.XENDIT_SECRET_KEY || !process.env.FRONTEND_URL || !BITESHIP_API_KEY) {
    console.error('Missing required environment variables');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const { cart, shippingAddress, courierCode } = req.body as { 
    cart: CartItem[], 
    shippingAddress: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    },
    courierCode?: string
  };

  // Validate cart and shipping address
  if (!cart || cart.length === 0) {
    return res.status(400).json({ error: 'Cart is empty' });
  }

  if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || 
      !shippingAddress.state || !shippingAddress.postalCode || !shippingAddress.country) {
    return res.status(400).json({ error: 'Invalid shipping address' });
  }

  const userId = (req.user && 'userId' in req.user) ? (req.user as { userId: number }).userId : undefined;

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

    // --- Biteship: Get available couriers and rates ---
    // For demo, use hardcoded origin (Jakarta) and destination from shippingAddress
    // You should replace origin with your warehouse address
    const origin = {
      postal_code: "10110", // Jakarta Pusat
      country: "ID"
    };
    const destination = {
      postal_code: shippingAddress.postalCode,
      country: "ID"
    };

    // Get rates from Biteship
    const biteshipRes = await fetch(`${BITESHIP_API_URL}/rates/couriers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${BITESHIP_API_KEY}`
      },
      body: JSON.stringify({
        origin,
        destination,
        couriers: ["jne", "sicepat", "anteraja", "jnt"], // Example couriers
        // You can add package details here if needed
      })
    });

    if (!biteshipRes.ok) {
      const error = await biteshipRes.text();
      console.error("Biteship API error:", error);
      return res.status(400).json({ error: "Failed to get courier rates" });
    }

    const biteshipData = await biteshipRes.json() as { couriers: any[] };
    // biteshipData contains available couriers and rates

    // Type guard to ensure biteshipData has couriers property
    if (
      !biteshipData ||
      typeof biteshipData !== "object" ||
      !Array.isArray(biteshipData.couriers)
    ) {
      return res.status(400).json({ error: "Invalid response from Biteship API" });
    }
    const couriers = biteshipData.couriers;

    // If courierCode is provided, find selected courier and cost
    let selectedCourier = null;
    let shippingCost = 0;
    if (courierCode) {
      for (const courier of couriers) {
        for (const service of courier.courier_services) {
          if (service.courier_code === courierCode) {
            selectedCourier = service;
            shippingCost = service.price;
            break;
          }
        }
        if (selectedCourier) break;
      }
      if (!selectedCourier) {
        return res.status(400).json({ error: "Selected courier not found" });
      }
    }

    // Create order with items, include shipping cost
    const order = await prisma.order.create({
      data: {
        externalId: `order-${Date.now()}-${userId}`,
        userId,
        amount: total + shippingCost,
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
        amount: total + shippingCost,
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
      order: order,
      biteshipCouriers: biteshipData.couriers // Return available couriers for frontend
    });
  } catch (err) {
    console.error("Checkout error:", err);
    return res.status(500).json({ error: "Checkout failed" });
  }
});

export default router;