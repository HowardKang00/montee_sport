// web/src/pages/Cart.tsx
import { useCart } from "../context/CartContext";
import { motion, AnimatePresence } from "framer-motion";

export default function Cart() {
  const { cart } = useCart();

  const checkout = async () => {
    const res = await fetch("http://localhost:4000/api/cart/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cart }),
    });
    const data = await res.json();
    window.location.href = data.invoice_url;
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-6">
      <motion.h1
        className="text-3xl font-bold mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Your Cart
      </motion.h1>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6">
        <AnimatePresence>
          {cart.length === 0 ? (
            <motion.p
              key="empty"
              className="text-gray-500 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              Your cart is empty 🛒
            </motion.p>
          ) : (
            <motion.div
              key="items"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ul className="divide-y divide-gray-200">
                {cart.map((item, i) => (
                  <motion.li
                    key={i}
                    className="flex justify-between py-3"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <span className="font-medium">{item.name} ({item.size}) x{item.qty}</span>
                    <span className="text-gray-700">${item.price * item.qty}</span>
                  </motion.li>
                ))}
              </ul>

              <div className="flex justify-between items-center mt-6 text-lg font-semibold">
                <span>Total</span>
                <span>${total}</span>
              </div>

              <motion.button
                onClick={checkout}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-6 w-full bg-black text-white py-3 rounded-xl shadow-lg font-medium"
              >
                Proceed to Checkout
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
