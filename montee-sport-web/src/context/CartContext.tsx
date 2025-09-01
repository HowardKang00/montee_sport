// web/src/context/CartContext.tsx
import { createContext, useContext, useState, type ReactNode } from "react";

type CartItem = {
  id: number;
  name: string;
  price: number;
  qty: number;
  img: string;
  size: string;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: number) => void;
  updateQty: (id: number, qty: number) => void;
  updateImg: (id: number, img: string) => void;
  clearCart: () => void;
  orderExternalId: string | null;
  checkoutCart: () => Promise<string | null>;
  checkOrderStatus: () => Promise<"PENDING" | "PAID" | "EXPIRED" | null>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderExternalId, setOrderExternalId] = useState<string | null>(null);

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id && i.size === item.size ? { ...i, qty: i.qty + item.qty } : i
        );
      }
      return [...prev, item];
    });
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQty = (id: number, qty: number) => {
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, qty } : item))
    );
  };

  const updateImg = (id: number, img: string) => {
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, img } : item))
    );
  };

  const clearCart = () => setCart([]);

  const checkoutCart = async (): Promise<string | null> => {
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart }),
      });

      if (!response.ok) throw new Error("Checkout failed");

      const data = await response.json();
      setOrderExternalId(data.orderExternalId);
      clearCart();
      return data.invoiceUrl;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const checkOrderStatus = async (): Promise<
    "PENDING" | "PAID" | "EXPIRED" | null
  > => {
    if (!orderExternalId) return null;

    try {
      const response = await fetch(`/api/order-status/${orderExternalId}`);
      if (!response.ok) throw new Error("Failed to fetch order status");

      const data = await response.json();
      return data.status;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQty,
        updateImg,
        clearCart,
        checkoutCart,
        orderExternalId,
        checkOrderStatus,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};
