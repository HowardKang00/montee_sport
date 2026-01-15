import express from 'express';
import { PrismaClient } from '../../src/generated/prisma';
import { requireAdmin } from '../middleware/admin';
import auth from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Products CRUD
router.get('/products', auth, requireAdmin, async (req, res) => {
  const products = await prisma.product.findMany();
  res.json(products);
});

router.post('/products', auth, requireAdmin, async (req, res) => {
  const product = await prisma.product.create({ data: req.body });
  res.status(201).json(product);
});

router.put('/products/:id', auth, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const product = await prisma.product.update({ where: { id: Number(id) }, data: req.body });
  res.json(product);
});

router.delete('/products/:id', auth, requireAdmin, async (req, res) => {
  const { id } = req.params;
  await prisma.product.delete({ where: { id: Number(id) } });
  res.status(204).end();
});

// Users management
// Edit user role
router.put('/users/:id/role', auth, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  const user = await prisma.user.update({ where: { id: Number(id) }, data: { role } });
  res.json(user);
});
router.get('/users', auth, requireAdmin, async (req, res) => {
  const users = await prisma.user.findMany({ select: { id: true, email: true, firstName: true, lastName: true, role: true } });
  res.json(users);
});

router.put('/users/:id', auth, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const user = await prisma.user.update({ where: { id: Number(id) }, data: req.body });
  res.json(user);
});

router.delete('/users/:id', auth, requireAdmin, async (req, res) => {
  const { id } = req.params;
  await prisma.user.delete({ where: { id: Number(id) } });
  res.status(204).end();
});

export default router;
