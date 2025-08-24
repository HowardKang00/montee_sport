// web/src/components/CheckoutButton.tsx
import { motion } from "framer-motion";
import { useCart } from "../context/CartContext";

export const CheckoutButton = () => {
  const { checkoutCart } = useCart();

  const handleCheckout = async () => {
    const invoiceUrl = await checkoutCart();
    if (invoiceUrl) {
      window.location.href = invoiceUrl; // redirect to Xendit hosted invoice
    }
  };

  return (
    <motion.button
      onClick={handleCheckout}
      className="px-6 py-3 bg-black text-white font-semibold rounded-2xl shadow-lg hover:scale-105 transition-transform"
      whileTap={{ scale: 0.95 }}
    >
      Checkout
    </motion.button>
  );
};
