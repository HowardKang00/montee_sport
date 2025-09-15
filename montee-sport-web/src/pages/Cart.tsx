// web/src/pages/Cart.tsx
import { useCart } from "../context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Cart() {
  const { cart, updateQty, removeFromCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleCheckout = async () => {
    try {
      setLoading(true);
      setError(null);
      navigate('/checkout');
    } catch (err) {
      setError('Failed to proceed to checkout');
      console.error('Checkout error:', err);
    } finally {
      setLoading(false);
    }
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-gray-50 text-gray-700">
      <motion.h1
        className="text-3xl font-bold mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Your Cart
      </motion.h1>

      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-6 text-gray-700">
        {cart.length === 0 ? (
          <motion.p
            className="text-gray-500 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Your cart is empty 🛒
          </motion.p>
        ) : (
          <>
            <ul className="divide-y divide-gray-200">
              {cart.map((item, index) => (
                <motion.li
                  key={item.id}
                  className="flex justify-between py-3 items-center hover:bg-gray-50 rounded-lg px-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={item.img}
                      alt={item.name}
                      className="w-24 h-24 object-contain"
                    />
                    <div>
                      <p className="font-medium text-black">{item.name}</p>
                      <p className="font-medium capitalize text-gray-500">{item.gender} {item.size} · {item.category}</p>
                    
                      <div className="flex gap-2 mt-1 items-center">
                        <button
                          onClick={() => updateQty(item.id, Math.max(1, item.quantity - 1))}
                          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 transition text-gray-700"
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() => updateQty(item.id, item.quantity + 1)}
                          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 transition text-gray-700"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="ml-2 text-red-500 hover:text-red-700 transition text-gray-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                  <span className="font-medium">Rp{(item.price * item.quantity).toLocaleString("id-ID")}</span>
                </motion.li>
              ))}
            </ul>

            <motion.div
              className="flex justify-between items-center mt-6 text-lg font-semibold text-gray-700"
              animate={{ opacity: [0.5, 1], scale: [0.95, 1] }}
              transition={{ duration: 0.3 }}
            >
              <span>Total</span>
              <span>Rp{total.toLocaleString("id-ID")}</span>
            </motion.div>

            <motion.button
              onClick={handleCheckout}
              whileHover={{ scale: 1.05, boxShadow: "0px 10px 20px rgba(0,0,0,0.2)" }}
              whileTap={{ scale: 0.95 }}
              className={`mt-6 w-full py-3 rounded-xl font-medium ${
                loading ? "bg-gray-400 cursor-not-allowed" : "bg-black text-white shadow-md"
              }`}
              disabled={loading}
            >
              {loading ? "Processing..." : "Proceed to Checkout"}
            </motion.button>
          </>
        )}
      </div>
    </div>
  );
}