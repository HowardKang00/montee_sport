import { motion } from "framer-motion";
import { useParams } from "react-router-dom";

const product = {
  id: 1,
  name: "Denim Jacket",
  price: 59.99,
  description:
    "Crafted with premium denim, this jacket is perfect for all seasons. Stylish, durable, and timeless.",
  image: "/images/jacket.jpg",
};

export default function ProductDetail() {
  const { id } = useParams(); // eventually fetch by id

  return (
    <section className="px-8 py-16 flex flex-col md:flex-row gap-12 items-center bg-white">
      {/* Image */}
      <motion.img
        src={product.image}
        alt={product.name}
        className="w-full md:w-1/2 rounded-2xl shadow-md"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      />

      {/* Info */}
      <motion.div
        className="flex-1"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h1 className="text-4xl font-serif mb-4">{product.name}</h1>
        <p className="text-lg font-sans text-gray-600 mb-6">{product.description}</p>
        <p className="text-2xl font-semibold mb-6">${product.price}</p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 bg-black text-white font-sans rounded-2xl shadow-lg"
        >
          Add to Cart
        </motion.button>
      </motion.div>
    </section>
  );
}
