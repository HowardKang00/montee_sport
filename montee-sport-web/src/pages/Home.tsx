// web/src/pages/Home.tsx
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <section className="bg-gray-50 min-h-screen flex flex-col justify-center items-center text-center px-4 text-gray-700">
      {/* Heading */}
      <motion.h1
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-5xl font-bold mb-4 tracking-tight"
      >
        Elevate Your Style
      </motion.h1>

      {/* Subheading */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="text-lg text-gray-600 max-w-xl mx-auto"
      >
        Discover curated collections and timeless essentials designed to match your lifestyle.
      </motion.p>

      {/* Shop Now Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="mt-8 px-6 py-3 bg-black text-white rounded-full text-lg shadow-lg"
        onClick={() => navigate("/products")}
      >
        Shop Now
      </motion.button>
    </section>
  );
}
