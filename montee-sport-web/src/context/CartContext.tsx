// web/src/context/CartContext.tsx
import { createContext, useContext, useState, type ReactNode } from "react";
import { useEffect } from "react";

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  img: string;
  size: string;
  gender: string;
  category: string;
  productId: string;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeFromCart: (id: string) => void;
  updateQty: (id: string, quantity: number) => void;
  updateImg: (id: string, img: string) => void;
  clearCart: () => void;
  orderExternalId?: string; // Add this line
  checkoutCart: () => Promise<string | null>;
  checkOrderStatus: () => Promise<"PENDING" | "PAID" | "EXPIRED" | null>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const stored = localStorage.getItem("cart");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {}
    }
    return [];
  });
  // (No need for useEffect to load cart from localStorage)

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);
  const [orderExternalId, setOrderExternalId] = useState<string | null>(null);

  const addToCart = (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id && i.size === item.size);
      let updated;
      if (existing) {
        updated = prev.map((i) =>
          i.id === item.id && i.size === item.size
            ? { ...i, quantity: i.quantity + (item.quantity || 1) }
            : i
        );
      } else {
        updated = [...prev, { ...item, quantity: item.quantity || 1 } as CartItem];
      }
      localStorage.setItem("cart", JSON.stringify(updated));
      return updated;
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      localStorage.setItem("cart", JSON.stringify(updated));
      return updated;
    });
  };

  const updateQty = (id: string, quantity: number) => {
    setCart((prev) => {
      const updated = prev.map((item) => (item.id === id ? { ...item, quantity } : item));
      localStorage.setItem("cart", JSON.stringify(updated));
      return updated;
    });
  };

  const updateImg = (id: string, img: string) => {
    setCart((prev) => {
      const updated = prev.map((item) => (item.id === id ? { ...item, img } : item));
      localStorage.setItem("cart", JSON.stringify(updated));
      return updated;
    });
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
  };

  const checkoutCart = async (): Promise<string | null> => {
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ items: cart }),
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
      const response = await fetch(`/api/order-status/${orderExternalId}`, {
        credentials: 'include'
      });
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
