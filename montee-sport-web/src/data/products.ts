// web/src/data/products.ts
// Single source of truth: products.json
// Ensure tsconfig.json has "resolveJsonModule": true
// import rawData from "./products.json";

export interface Product {
  id: string;
  name: string;
  gender: "men" | "women";
  category: "running" | "cycling" | "padel";
  series: string;
  colorway: string;
  price: number;
  discount: number;
  images: string[];
  sizeCharts: string[];
  sizes: string[];
}

// Fetch products from backend API
export async function fetchProducts(): Promise<Product[]> {
  try {
    const res = await fetch("http://localhost:4000/api/products");
    if (!res.ok) {
      console.error("fetchProducts: Network response was not ok", res.status, res.statusText);
      throw new Error("Failed to fetch products");
    }
    const data = await res.json();
    if (!Array.isArray(data)) {
      console.error("fetchProducts: API did not return an array", data);
      return [];
    }
    return data.map((p: any) => ({
      id: p.productid || p.id,
      name: p.name,
      gender: p.gender || "",
      category: p.category || "",
      series: p.series || "",
      colorway: p.colorway || "",
      price: typeof p.price === "string" ? parseInt(p.price, 10) : p.price,
      discount: typeof p.discount === "string" ? parseInt(p.discount, 10) : p.discount,
      images: Array.isArray(p.images) ? p.images : [],
      sizeCharts: Array.isArray(p.sizecharts)
        ? p.sizecharts
        : (typeof p.sizecharts === "string" && p.sizecharts.length > 0 ? p.sizecharts.split(",") : []),
      sizes: Array.isArray(p.sizes)
        ? p.sizes
        : (typeof p.sizes === "string" && p.sizes.length > 0 ? p.sizes.split(",") : []),
    }));
  } catch (err) {
    console.error("fetchProducts: Error fetching products", err);
    return [];
  }
}
