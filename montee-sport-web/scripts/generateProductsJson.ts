// scripts/generateProductsJson.ts
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const imagesDir = path.resolve(__dirname, "../images");
const outputPath = path.resolve(__dirname, "../src/data/products.json");

interface Product {
  id: string;
  name: string;
  gender: string;
  category: string;
  series: string;
  colorway: string;
  price: number;
  images: string[];
  sizeChart?: string;
  sizes: string[];
}

const sizes = ["2XS", "XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"];

function generateProducts(): Product[] {
  const products: Product[] = [];

  const genders = fs.readdirSync(imagesDir);
  genders.forEach((gender) => {
    const genderDir = path.join(imagesDir, gender);
    if (!fs.statSync(genderDir).isDirectory()) return;

    const categories = fs.readdirSync(genderDir);
    categories.forEach((category) => {
      const categoryDir = path.join(genderDir, category);
      if (!fs.statSync(categoryDir).isDirectory()) return;

      const seriesList = fs.readdirSync(categoryDir);
      seriesList.forEach((series) => {
        const seriesDir = path.join(categoryDir, series);
        if (!fs.statSync(seriesDir).isDirectory()) return;

        const colorways = fs.readdirSync(seriesDir);
        colorways.forEach((colorway) => {
          const colorwayDir = path.join(seriesDir, colorway);
          if (!fs.statSync(colorwayDir).isDirectory()) return;

          const productFolders = fs.readdirSync(colorwayDir);
          productFolders.forEach((productFolder) => {
            const productDir = path.join(colorwayDir, productFolder);
            if (!fs.statSync(productDir).isDirectory()) return;

            // Collect image files
            const files = fs
              .readdirSync(productDir)
              .filter((f) => /\.(jpe?g|png)$/i.test(f));

            if (files.length === 0) return; // skip empty dirs

            const images = files
              .filter((f) => !/sizechart/i.test(f))
              .map((f) => `/images/${gender}/${category}/${series}/${colorway}/${productFolder}/${f}`);

            const sizeChartFile = files.find((f) => /sizechart/i.test(f));
            const sizeChart = sizeChartFile
              ? `/images/${gender}/${category}/${series}/${colorway}/${productFolder}/${sizeChartFile}`
              : undefined;

            const product: Product = {
              id: `${gender}-${category}-${series}-${colorway}-${productFolder}`,
              name: `${series} ${colorway} ${productFolder}`,
              gender,
              category,
              series,
              colorway,
              price: Math.floor(Math.random() * 100) + 50, // placeholder
              images,
              sizeChart,
              sizes,
            };

            products.push(product);
          });
        });
      });
    });
  });

  return products;
}

const products = generateProducts();
fs.writeFileSync(outputPath, JSON.stringify(products, null, 2));
console.log(`✅ Generated ${products.length} products into ${outputPath}`);
