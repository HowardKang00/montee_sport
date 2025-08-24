// web/src/hooks/useOrderStatus.ts
import { useEffect, useState } from "react";

export const useOrderStatus = (orderId: string | null) => {
  const [status, setStatus] = useState<string>("pending");

  useEffect(() => {
    if (!orderId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/order-status/${orderId}`);
        if (!res.ok) throw new Error("Failed to fetch order status");

        const data = await res.json();
        setStatus(data.status);

        if (data.status === "PAID" || data.status === "EXPIRED") {
          clearInterval(interval);
        }
      } catch (err) {
        console.error(err);
      }
    }, 5000); // poll every 5s

    return () => clearInterval(interval);
  }, [orderId]);

  return status;
};
