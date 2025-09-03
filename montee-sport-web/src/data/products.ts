// web/src/data/products.ts
// Single source of truth: products.json
// Ensure tsconfig.json has "resolveJsonModule": true
import rawData from "./products.json";

export interface Product {
  id: string;
  name: string;
  gender: "men" | "women";
  category: "running" | "cycling" | "padel";
  series: string;
  colorway: string;
  price: number;
  discount: number;
  images: string[];     // resolved URLs (bundler) where possible
  sizeCharts: string[]; // resolved URLs (bundler) where possible
  sizes: string[];
}

// fallback sizes if JSON does not provide `sizes`
const fallbackSizes = ["2XS", "XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"];

// import all images (eager so we can map to module URLs)
const imagesMap = import.meta.glob("../../images/**/*.{jpg,png,jpeg}", { eager: true }) as Record<string, any>;

/**
 * Resolve a path from JSON to the module's exported URL (if present).
 * - First tries direct key match (the same string used in JSON).
 * - If not found, tries a endsWith match (useful if glob keys differ slightly).
 * - If still not found, returns the raw path and logs a warning.
 */
function resolveImagePath(jsonPath: string): string {
  if (!jsonPath) return "";
  // direct lookup (keys from import.meta.glob will match the same literal path if relative)
  const direct = imagesMap[jsonPath];
  if (direct) return direct.default ?? direct;

  // fallback: sometimes the glob keys differ in prefix; try endsWith match
  const matchEntry = Object.entries(imagesMap).find(([k]) => k.endsWith(jsonPath.replace(/^\.*\/+/, "")));
  if (matchEntry) return (matchEntry[1] as any).default ?? matchEntry[1];

  console.warn(`[products.ts] image not found in glob: ${jsonPath}`);
  return jsonPath; // fallback to the literal path
}

// read sizes from JSON top-level if provided
const sizesFromJson: string[] = (rawData as any).sizes ?? fallbackSizes;

// transform JSON products -> typed Product[] and resolve image links
export const products: Product[] = ((rawData as any).products ?? []).map((p: any) => {
  const images: string[] = (p.images ?? []).map((img: string) => resolveImagePath(img)).filter(Boolean);
  const sizeCharts: string[] = (p.sizeCharts ?? []).map((sc: string) => resolveImagePath(sc)).filter(Boolean);
console.log(images);
  return {
    id: p.id,
    name: p.name,
    gender: p.gender,
    category: p.category,
    series: p.series,
    colorway: p.colorway,
    price: p.price ?? 100,
    discount: p.discount ?? 0,
    images,
    sizeCharts,
    sizes: p.sizes ?? sizesFromJson,
  } as Product;
});
