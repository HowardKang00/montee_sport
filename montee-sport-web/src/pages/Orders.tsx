import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface OrderItem {
  id: number;
  quantity: number;
  size: string;
  price: number;
  product: {
    id: number;
    name: string;
    images: string;
  };
}

interface Order {
  id: number;
  externalId: string;
  amount: number;
  status: string;
  createdAt: string;
  orderItems: OrderItem[];
  shippingAddress: string;
}

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/users/orders', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      setOrders(data);
    } catch (error) {
      setError('Failed to load orders');
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">You haven't placed any orders yet.</p>
          <Link
            to="/products"
            className="inline-block bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-lg font-semibold">Order #{order.id}</h2>
                    <p className="text-sm text-gray-600">
                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium
                      ${order.status === 'PAID' ? 'bg-green-100 text-green-800' : 
                        order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'}`}>
                      {order.status}
                    </span>
                    <p className="mt-1 text-lg font-medium">
                      Total: ${order.amount.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Items</h3>
                  <div className="grid gap-4">
                    {order.orderItems.map((item) => (
                      <div key={item.id} className="flex items-center">
                        <img
                          src={item.product.images.split(',')[0]}
                          alt={item.product.name}
                          className="h-20 w-20 object-cover rounded"
                        />
                        <div className="ml-4">
                          <Link
                            to={`/product/${item.product.id}`}
                            className="text-sm font-medium text-gray-900 hover:text-gray-600"
                          >
                            {item.product.name}
                          </Link>
                          <p className="text-sm text-gray-600">
                            Size: {item.size} • Quantity: {item.quantity}
                          </p>
                          <p className="text-sm font-medium text-gray-900">
                            ${item.price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t mt-4 pt-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Shipping Address</h3>
                  <address className="text-sm text-gray-600 not-italic">
                    {JSON.parse(order.shippingAddress).street}<br />
                    {JSON.parse(order.shippingAddress).city}, {JSON.parse(order.shippingAddress).state} {JSON.parse(order.shippingAddress).postalCode}<br />
                    {JSON.parse(order.shippingAddress).country}
                  </address>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
