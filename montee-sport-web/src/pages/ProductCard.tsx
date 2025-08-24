// web/src/components/ProductCard.tsx
import { motion } from "framer-motion";
import { useCart } from "../context/CartContext";

export default function ProductCard({ product }: { product: any }) {
  const { addToCart } = useCart();

  return (
    <motion.div
      className="bg-white shadow-md rounded-2xl overflow-hidden flex flex-col"
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 200 }}
    >
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-64 object-cover"
      />

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-serif text-xl mb-1">{product.name}</h3>
          <p className="font-sans text-gray-600">${product.price}</p>
        </div>

        <motion.button
          onClick={() => addToCart(product)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-4 w-full bg-black text-white py-2 rounded-xl shadow-md font-medium"
        >
          Add to Cart
        </motion.button>
      </div>
    </motion.div>
  );
}
