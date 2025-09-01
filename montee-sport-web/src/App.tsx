// web/src/App.tsx
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Products from "./pages/Products";
import Checkout from "./pages/Checkout";
import CartPage from "./pages/Cart";
import OrderStatusPage from "./pages/OrderStatus";
import Navbar from "./components/Navbar";
import ProductDetail from "./pages/ProductDetail";

export default function App() {
  return (
    <div className="font-sans bg-gray-50 min-h-screen">
      <Navbar /> 
      <main>
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
          <Route path="/product/:id" element={<ProductDetail />} />
        </Routes>
      </main>
    </div>
  );
}
