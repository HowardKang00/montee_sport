// server/routes/products.js
import express from "express";
import { PrismaClient } from "../../src/generated/prisma";

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
  const products = await prisma.product.findMany();
  // images is now String[] from Prisma, so just return as is
  res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

export default router;