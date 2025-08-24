import { motion } from "framer-motion";
import ProductCard from "./ProductCard";

const products = [
  { id: 1, name: "Denim Jacket", price: 59.99, image: "/images/jacket.jpg" },
  { id: 2, name: "Casual Shirt", price: 39.99, image: "/images/shirt.jpg" },
  { id: 3, name: "Sneakers", price: 89.99, image: "/images/sneakers.jpg" },
  // add more
];

export default function Shop() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  return (
    <motion.section
      className="px-8 py-12 bg-gray-50 min-h-screen"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <h2 className="text-4xl font-serif mb-8 text-center">Our Collection</h2>
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        variants={container}
      >
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </motion.div>
    </motion.section>
  );
}
