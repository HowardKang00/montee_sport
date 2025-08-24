// web/src/App.tsx
import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Products from "./pages/Products";
import Checkout from "./pages/Checkout";
import CartPage from "./pages/Cart";
import OrderStatusPage from "./pages/OrderStatus";
import { useCart } from "./context/CartContext";
import { ShoppingCart } from "lucide-react";

export default function App() {
  const { cart } = useCart();

  return (
    <div className="font-sans bg-gray-50 min-h-screen">
      {/* Header / Navigation */}
      <header className="p-4 shadow-sm bg-white flex justify-between items-center sticky top-0 z-50">
        <Link to="/">
          <img className="flex h-12 w-24 object-scale-down" src="../images/montee_logo.png" />
        </Link>
        <div className="flex gap-6">
          <Link to="/" className="text-xl font-bold tracking-tight text-gray-700">
            Men
          </Link>
          <Link to="/" className="text-xl font-bold tracking-tight text-gray-700">
            Women
          </Link>
        </div>
        <nav className="flex gap-6 items-center">
          <Link to="/products" className="hover:text-gray-600 text-gray-900">
            Products
          </Link>
          <Link to="/checkout" className="relative">
            <ShoppingCart className="w-6 h-6" />
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-black text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                {cart.length}
              </span>
            )}
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/success" element={<OrderStatusPage />} />
          <Route
            path="/failure"
            element={
              <p className="text-center mt-20 text-xl">❌ Payment Failed</p>
            }
          />
          <Route
            path="*"
            element={
              <p className="text-center mt-20 text-xl">Page Not Found</p>
            }
          />
        </Routes>
      </main>
    </div>
  );
}
