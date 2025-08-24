import { motion } from "framer-motion";

const mockProducts = [
  { id: 1, name: "T-Shirt", price: 200000, img: "https://picsum.photos/300?1" },
  { id: 2, name: "Jeans", price: 500000, img: "https://picsum.photos/300?2" },
  { id: 3, name: "Jacket", price: 800000, img: "https://picsum.photos/300?3" },
  { id: 4, name: "Sneakers", price: 1200000, img: "https://picsum.photos/300?4" },
];

export default function Products() {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-700">Our Collections</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {mockProducts.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2 }}
            className="p-4 bg-white shadow-md rounded-2xl hover:shadow-xl transition"
          >
            <img src={p.img} alt={p.name} className="rounded-xl mb-4 w-full h-56 object-cover" />
            <h3 className="font-semibold text-lg">{p.name}</h3>
            <p className="text-gray-600">Rp {p.price.toLocaleString()}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-3 px-4 py-2 bg-black text-white rounded-lg w-full"
            >
              Add to Cart
            </motion.button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
