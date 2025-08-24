// web/src/pages/Checkout.tsx
import { useCart } from "../context/CartContext";
import { motion } from "framer-motion";
import { useState } from "react";

export default function Checkout() {
  const { cart, removeFromCart, updateQty, clearCart, checkoutCart } = useCart();
  const [loading, setLoading] = useState(false);

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    const invoiceUrl = await checkoutCart();
    setLoading(false);
    if (invoiceUrl) {
      window.location.href = invoiceUrl; // redirect to Xendit
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-gray-50">
      <motion.h1
        className="text-3xl font-bold mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Checkout
      </motion.h1>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6">
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
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <div className="flex gap-2 mt-1 items-center">
                      <button
                        onClick={() => updateQty(item.id, Math.max(1, item.qty - 1))}
                        className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 transition"
                      >
                        -
                      </button>
                      <span>{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.id, item.qty + 1)}
                        className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 transition"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="ml-2 text-red-500 hover:text-red-700 transition"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <span className="font-medium">${item.price * item.qty}</span>
                </motion.li>
              ))}
            </ul>

            <motion.div
              className="flex justify-between items-center mt-6 text-lg font-semibold"
              animate={{ opacity: [0.5, 1], scale: [0.95, 1] }}
              transition={{ duration: 0.3 }}
            >
              <span>Total</span>
              <span>${total}</span>
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
