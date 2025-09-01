// web/src/data/products.ts
interface Product {
  id: string;
  name: string;
  gender: "men" | "women";
  category: "running" | "cycling" | "padel";
  series: string;
  colorway: string;
  price: number;
  images: string[];
  sizeCharts: string[]; // ⬅️ allow multiple
  sizes: string[]; 
}

// Import all images using Vite’s glob import
const images = import.meta.glob("../../images/**/*.{jpg,png,jpeg}", { eager: true });

// Organize products
export const products: Product[] = [];

function addProduct(
  gender: "men" | "women",
  category: "running" | "cycling" | "padel",
  series: string,
  colorway: string,
  price: number = 100 // Default price, change as needed
) {
  // Build path
  const folder = `../../images/${gender}/${category}/${series}/${colorway}`;
  const imgs: string[] = [];

  // Collect all images matching the pattern
  Object.entries(images).forEach(([path, mod]) => {
    if (path.startsWith(folder)) {
      imgs.push((mod as any).default);
    }
  });

  // Get size charts
  let sizeCharts: string[] = [];

  if (category === "running") {
    const singlet = (images[`../../images/${gender}/${category}/sizechart_singlet.jpg`] as any)?.default;
    const shirt = (images[`../../images/${gender}/${category}/sizechart_shirt.jpg`] as any)?.default;
    sizeCharts = [singlet, shirt].filter(Boolean);
  } else {
    const sizeChart = (images[`../../images/${gender}/${category}/sizechart.jpg`] as any)?.default ?? "";
    if (sizeChart) sizeCharts.push(sizeChart);
  }

    products.push({
    id: `${gender}-${category}-${series}-${colorway}`,
    name: `${series} ${colorway}`.replace("_", " "),
    gender,
    category,
    series,
    colorway,
    price,
    images: imgs.sort(),
    sizeCharts,
    sizes: ["2XS", "XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"], // ⬅️ default sizes
});
}

// --- Build your collection (based on structure you described)
const genders = ["men", "women"] as const;
const categories = ["running", "cycling", "padel"] as const;
const seriesData = {
  accelerated_series: ["velocity_green", "ignite_yellow"],
  markv_series: ["heat_voltage", "power_blaze"],
};
genders.forEach((g) =>
  categories.forEach((c) =>
    Object.entries(seriesData).forEach(([series, colorways]) =>
      colorways.forEach((colorway) => addProduct(g, c, series, colorway, 100)) // Pass default price
    )
  )
);
