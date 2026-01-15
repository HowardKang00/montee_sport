import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Home from "./pages/Home";
import Products from "./pages/Products";
import Checkout from "./pages/Checkout";
import CartPage from "./pages/Cart";
import OrderStatusPage from "./pages/OrderStatus";
import Navbar from "./components/Navbar";
import ProductDetail from "./pages/ProductDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Orders from "./pages/Orders";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProducts from "./pages/AdminProducts";
import AdminUsers from "./pages/AdminUsers";

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

function AppRoutes() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setToken, fetchUser } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    if (token) {
      setToken(token);
      localStorage.setItem('token', token);
      fetchUser(token);
      navigate("/", { replace: true });
    }
  }, [location, setToken, fetchUser, navigate]);

  return (
    <div className="font-sans bg-gray-50 min-h-screen">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/product/:id" element={<ProductDetail />} />

          {/* Admin Dashboard and nested routes */}
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>}>
            <Route path="products" element={<AdminProducts />} />
            <Route path="users" element={<AdminUsers />} />
          </Route>

          {/* Protected Routes */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/orders" element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          } />
          <Route path="/checkout" element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          } />
          <Route path="/cart" element={
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          } />
          <Route path="/success" element={
            <ProtectedRoute>
              <OrderStatusPage />
            </ProtectedRoute>
          } />
          <Route path="/failure" element={
            <ProtectedRoute>
              <p className="text-center mt-20 text-xl">❌ Payment Failed</p>
            </ProtectedRoute>
          } />

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

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
