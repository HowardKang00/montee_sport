// web/src/components/Navbar.tsx
import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useCart } from "../context/CartContext";
import { motion } from "framer-motion";
import { useState } from "react";

export default function Navbar() {
  const { cart } = useCart();
  const [hovered, setHovered] = useState<string | null>(null);

  const categories = ["All", "Running", "Cycling", "Padel"]; // Added "All"

  return (
    <motion.nav
      className="flex justify-between items-center px-8 py-4 bg-white shadow-md sticky top-0 z-50"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Logo */}
      <Link to="/">
        <img
          className="h-12 w-24 object-scale-down"
          src="../images/montee_logo.png"
          alt="Montee Logo"
        />
      </Link>

      {/* Category Links */}
      <ul className="flex space-x-8 font-sans relative">
        {["Men", "Women"].map((gender) => (
          <motion.li
            key={gender}
            whileHover="hover"
            initial="initial"
            animate="initial"
            whileTap={{ scale: 0.95 }}
            style={{
              position: "relative",
              display: "inline-block",
              paddingBottom: 10,
            }}
            onMouseEnter={() => setHovered(gender)}
            onMouseLeave={() => setHovered(null)}
          >
            <Link
              to="/products"
              className="text-xl font-bold tracking-tight text-gray-700"
              style={{ display: "inline-block" }}
            >
              {gender}
            </Link>

            {/* Underline animation */}
            <motion.span
              variants={{
                initial: { scaleX: 0, opacity: 0 },
                hover: { scaleX: 1, opacity: 1 },
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              style={{
                position: "absolute",
                height: 2,
                backgroundColor: "black",
                bottom: 0,
                left: 0,
                borderRadius: 2,
                opacity: 0,
                width: "100%",
                transformOrigin: "center",
                transform: "scaleX(0)",
              }}
            />

            {/* Dropdown Panel */}
            {hovered === gender && (
              <motion.div
                className="absolute left-0 mt-3 w-40 bg-white shadow-lg rounded-xl border border-gray-200 py-3 z-50"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.1 }}
              >
                {categories.map((cat) => (
                  <motion.div
                    key={cat}
                    className="relative"
                    whileHover="hover"
                    initial="initial"
                    animate="initial"
                  >
                    <Link
                      to={
                        cat === "All"
                          ? `/products?gender=${gender.toLowerCase()}`
                          : `/products?gender=${gender.toLowerCase()}&category=${cat.toLowerCase()}`
                      }
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-black hover:underline transition font-medium"
                    >
                      {cat}
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.li>
        ))}
      </ul>

      {/* Cart */}
      <Link to="/checkout" className="relative">
        <ShoppingCart className="w-6 h-6 text-gray-700" />
        {cart.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-black text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
            {cart.length}
          </span>
        )}
      </Link>
    </motion.nav>
  );
}
