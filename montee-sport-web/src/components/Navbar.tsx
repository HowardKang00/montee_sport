import { Link } from "react-router-dom";
import { ShoppingCart, User } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { useState } from "react";
import { useEffect } from "react";

export default function Navbar() {
  const { cart } = useCart();
  const { user, logout } = useAuth();
  const [hovered, setHovered] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    if (!profileOpen) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.profile-menu-parent')) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [profileOpen]);

  const categories = ["Running", "Cycling", "Padel"];

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
      <ul className="flex justify-center space-x-20 font-sans relative">
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
              to={`/products?gender=${gender.toLowerCase()}`}
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
                        `/products?gender=${gender.toLowerCase()}&category=${cat.toLowerCase()}`
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

      {/* User Menu & Cart */}
      <div className="flex items-center space-x-6">
        {user ? (
          <div className="relative profile-menu-parent" style={{ display: 'inline-block' }}>
            <button
              className="flex items-center space-x-2"
              onClick={() => setProfileOpen((open) => !open)}
              aria-haspopup="true"
              aria-expanded={profileOpen}
            >
              <User className="w-6 h-6 text-gray-700" />
              <span className="text-gray-700">{user.firstName}</span>
            </button>
            {profileOpen && (
              <motion.div
                className="absolute right-0 mt-3 w-48 bg-white shadow-lg rounded-xl border border-gray-200 py-3 z-50"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.1 }}
              >
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
                  onClick={() => setProfileOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  to="/orders"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
                  onClick={() => setProfileOpen(false)}
                >
                  Orders
                </Link>
                <button
                  onClick={() => { setProfileOpen(false); logout(); }}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
                >
                  Logout
                </button>
              </motion.div>
            )}
          </div>
        ) : (
          <div className="space-x-4">
            <Link
              to="/login"
              className="text-gray-700 hover:text-gray-900 transition"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition"
            >
              Register
            </Link>
          </div>
        )}

        <Link to="/cart" className="relative">
          <ShoppingCart className="w-6 h-6 text-gray-700" />
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-black text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
              {cart.length}
            </span>
          )}
        </Link>
      </div>
    </motion.nav>
  );
}
