// src/components/CartDrawer.tsx
import { motion } from "framer-motion";
import { useCart } from "../context/CartContext";

export default function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { cart, removeFromCart, updateQty } = useCart();

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: open ? 0 : "100%" }}
      transition={{ type: "tween" }}
      className="fixed top-0 right-0 w-96 h-full bg-white shadow-2xl z-50 p-4"
    >
      <h2 className="text-xl font-bold mb-4">Your Cart</h2>
      <div className="space-y-4">
        {cart.map(item => (
          <div key={item.id} className="flex items-center justify-between">
            <img src={item.img} alt={item.name} className="w-16 h-16 rounded" />
            <div className="flex-1 ml-2">
              <p className="font-medium">{item.name}</p>
              <p className="text-gray-500">${item.price}</p>
              <input
                type="number"
                value={item.qty}
                min={1}
                className="w-16 border rounded mt-1"
                onChange={e => updateQty(item.id, Number(e.target.value))}
              />
            </div>
            <button className="text-red-500" onClick={() => removeFromCart(item.id)}>✕</button>
          </div>
        ))}
      </div>
      <button
        className="mt-6 w-full bg-black text-white py-3 rounded-xl hover:scale-105 transition"
        onClick={async () => {
          const res = await fetch("/api/checkout", { method: "POST" });
          const data = await res.json();
          window.location.href = data.invoiceUrl; // redirect to Xendit invoice
        }}
      >
        Checkout
      </button>
      <button onClick={onClose} className="mt-2 text-sm text-gray-500">Close</button>
    </motion.div>
  );
}
