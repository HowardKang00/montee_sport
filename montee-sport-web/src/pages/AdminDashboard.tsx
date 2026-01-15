import { useAuth } from '../context/AuthContext';
import { Navigate, Link, Outlet } from 'react-router-dom';

export default function AdminDashboard() {
  const { user } = useAuth();

  if (!user || user.role !== 'ADMIN') {
    console.log(user);
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-700">Admin Dashboard</h1>
      <nav className="mb-8 flex gap-6">
        <Link to="products" className="text-indigo-600 hover:underline">Manage Products</Link>
        <Link to="users" className="text-indigo-600 hover:underline">Manage Users</Link>
      </nav>
      <Outlet />
    </div>
  );
}
