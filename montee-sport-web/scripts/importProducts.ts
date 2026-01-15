import { PrismaClient } from '../src/generated/prisma/client.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function main() {
  const filePath = path.join(__dirname, '../src/data/products.json');
  const raw = fs.readFileSync(filePath, 'utf-8');
  const json = JSON.parse(raw);
  const defaultSizes = json.sizes;
  const products = json.products;

  for (const p of products) {
    try {
      await prisma.product.upsert({
        where: { productid: p.id },
        update: {}, // No update, skip if exists
        create: {
          productid: p.id,
          name: p.name,
          gender: p.gender,
          category: p.category,
          series: p.series,
          colorway: p.colorway,
          price: Number(p.price),
          discount: Number(p.discount),
          images: Array.isArray(p.images) ? p.images : (typeof p.images === 'string' && p.images.length > 0 ? p.images.split(',') : []),
          sizecharts: Array.isArray(p.sizeCharts) ? p.sizeCharts : [],
          sizes: Array.isArray(defaultSizes) ? defaultSizes : [],
          description: p.description || '',
          stock: 0,
        },
      });
      console.log(`Imported: ${p.name}`);
    } catch (err) {
      console.error(`Failed to import ${p.name}:`, err);
    }
  }
  await prisma.$disconnect();
}

main();
