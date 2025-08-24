// web/src/pages/OrderStatusPage.tsx
import { useCart } from "../context/CartContext";
import { useOrderStatus } from "../hooks/useOrderStatus";
import { motion } from "framer-motion";

type OrderStatusType = "pending" | "PAID" | "EXPIRED";

export default function OrderStatus() {
  const { orderExternalId, clearCart } = useCart();
  const status = useOrderStatus(orderExternalId) as OrderStatusType;

  // Automatically clear cart if payment succeeded
  if (status === "PAID") {
    clearCart();
  }

  const renderContent = () => {
    switch (status) {
      case "pending":
        return "⌛ Checking payment...";
      case "PAID":
        return "✅ Payment successful! Thank you for your order.";
      case "EXPIRED":
        return "❌ Payment expired. Please try again.";
      default:
        return `Current status: ${status}`;
    }
  };

  const iconAnimation = {
    pending: { rotate: 0, scale: 1 },
    PAID: { rotate: [0, 10, -10, 0], scale: [1, 1.2, 1.2, 1] },
    EXPIRED: { rotate: [0, -10, 10, 0], scale: [1, 1.1, 1.1, 1] },
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50 text-center">
      <motion.h1
        className="text-3xl font-bold mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Order Status
      </motion.h1>

      <motion.div
        className="text-6xl mb-4"
        animate={iconAnimation[status] || iconAnimation.pending}
        transition={{ duration: 0.8, repeat: status === "pending" ? Infinity : 0 }}
      >
        {status === "PAID" ? "🎉" : status === "EXPIRED" ? "⚠️" : "⌛"}
      </motion.div>

      <motion.p
        className="text-lg font-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {renderContent()}
      </motion.p>
    </div>
  );
}
