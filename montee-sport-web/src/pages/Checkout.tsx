import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export default function Checkout() {
  const { cart, removeFromCart, updateQty, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<number | 'new'>(
    user?.address?.find(addr => addr.isDefault)?.id || 'new'
  );
  const [newAddress, setNewAddress] = useState<ShippingAddress>({
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: ''
  });
  // Biteship integration state
  const [couriers, setCouriers] = useState<any[]>([]);
  const [selectedCourier, setSelectedCourier] = useState<string | null>(null);
  const [shippingCost, setShippingCost] = useState<number>(0);
  // Biteship address autocomplete
  const [addressQuery, setAddressQuery] = useState('');
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleNewAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAddress(prev => ({
      ...prev,
      [name]: value
    }));
    if (name === 'street') {
      setAddressQuery(value);
      setShowSuggestions(true);
    }
  };

  // Fetch Biteship address suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!addressQuery || addressQuery.length < 3) {
        setAddressSuggestions([]);
        return;
      }
      try {
        const res = await fetch(`https://api.biteship.com/v1/maps/autocomplete?input=${encodeURIComponent(addressQuery)}`, {
          headers: {
            'Authorization': `Bearer ${process.env.REACT_APP_BITESHIP_API_KEY || ''}`
          }
        });
        if (!res.ok) return setAddressSuggestions([]);
        const data = await res.json();
        setAddressSuggestions(data.results || []);
      } catch {
        setAddressSuggestions([]);
      }
    };
    if (showSuggestions) fetchSuggestions();
  }, [addressQuery, showSuggestions]);

  // Autofill address fields when suggestion is selected
  const handleSuggestionSelect = async (suggestion: any) => {
    setShowSuggestions(false);
    setAddressQuery(suggestion.text);
    // Get details from Biteship place_id
    try {
      const res = await fetch(`https://api.biteship.com/v1/maps/details?place_id=${encodeURIComponent(suggestion.place_id)}`, {
        headers: {
          'Authorization': `Bearer ${process.env.REACT_APP_BITESHIP_API_KEY || ''}`
        }
      });
      if (!res.ok) return;
      const data = await res.json();
      const comp = data.result;
      setNewAddress(prev => ({
        ...prev,
        street: comp.street_name || suggestion.text,
        city: comp.city_name || '',
        state: comp.administrative_area_level_1 || '',
        postalCode: comp.postal_code || '',
        country: comp.country || ''
      }));
    } catch {}
  };

  // Hide suggestions on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    if (showSuggestions) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showSuggestions]);

  // Fetch Biteship couriers/rates when address changes and is filled
  useEffect(() => {
    const fetchCouriers = async () => {
      let address: ShippingAddress;
      if (selectedAddress === 'new') {
        address = newAddress;
      } else {
        const addr = user?.address?.find(addr => addr.id === selectedAddress);
        if (!addr) return;
        address = {
          street: addr.street,
          city: addr.city,
          state: addr.state,
          postalCode: addr.postalCode,
          country: addr.country
        };
      }
      // Only fetch if address is fully filled
      if (!address.street || !address.city || !address.state || !address.postalCode || !address.country) {
        setCouriers([]);
        return;
      }
      setCouriers([]);
      setSelectedCourier(null);
      setShippingCost(0);
      try {
        // Call backend with cart and address, get couriers
        const cartItems = cart.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          size: item.size,
          price: item.price
        }));
        const response = await fetch('http://localhost:4000/api/cart/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            cart: cartItems,
            shippingAddress: address
          })
        });
        const data = await response.json();
        if (response.ok && data.biteshipCouriers && Array.isArray(data.biteshipCouriers) && data.biteshipCouriers.length > 0) {
          setCouriers(data.biteshipCouriers);
        } else {
          setCouriers([]);
        }
      } catch (err) {
        setCouriers([]);
      }
    };
    // Only fetch if cart is not empty
    if (cart.length > 0) fetchCouriers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAddress, newAddress, cart, user]);

  const getShippingAddress = (): ShippingAddress => {
    if (selectedAddress === 'new') {
      return newAddress;
    }
    const address = user?.address?.find(addr => addr.id === selectedAddress);
    if (!address) throw new Error('No address selected');
    return {
      street: address.street,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country
    };
  };

  const handleCheckout = async () => {
    try {
      if (cart.length === 0) return;
      if (!selectedCourier) {
        setError('Please select a courier');
        return;
      }
      setLoading(true);
      setError(null);

      // Get the selected shipping address
      const shippingAddress = getShippingAddress();

      // Transform cart items to match backend expectations
      const cartItems = cart.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        size: item.size,
        price: item.price
      }));

      const response = await fetch('http://localhost:4000/api/cart/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          cart: cartItems,
          shippingAddress,
          courierCode: selectedCourier
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Checkout failed');
      }

      const { invoiceUrl, orderId } = await response.json();
      
      // Save orderId for later reference
      localStorage.setItem('lastOrderId', orderId.toString());
      
      // Clear cart before redirecting
      clearCart();
      
      // Redirect to Xendit payment page
      window.location.href = invoiceUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed');
      console.error('Checkout error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-gray-50 text-gray-700">
      <motion.h1
        className="text-3xl font-bold mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Checkout
      </motion.h1>

      <div className="w-full max-w-4xl">
        {cart.length === 0 ? (
          <motion.div
            className="text-center bg-white rounded-2xl shadow-lg p-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-gray-500 mb-4">Your cart is empty 🛒</p>
            <button
              onClick={() => navigate('/products')}
              className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition"
            >
              Continue Shopping
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cart Items */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Cart Items</h2>
              <ul className="divide-y divide-gray-200">
                {cart.map((item, index) => (
                  <motion.li
                    key={item.id}
                    className="flex justify-between py-3 items-center hover:bg-gray-50 rounded-lg px-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={item.img}
                        alt={item.name}
                        className="w-20 h-20 object-contain"
                      />
                      <div>
                        <p className="font-medium text-black">{item.name}</p>
                        <p className="font-medium capitalize text-gray-500">{item.gender} {item.size} · {item.category}</p>
                      
                        <div className="flex gap-2 mt-1 items-center">
                          <button
                            onClick={() => updateQty(item.id, Math.max(1, item.quantity - 1))}
                            className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 transition"
                          >
                            -
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            onClick={() => updateQty(item.id, item.quantity + 1)}
                            className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 transition"
                          >
                            +
                          </button>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="ml-2 text-red-500 hover:text-red-700 transition"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                    <span className="font-medium">Rp{(item.price * item.quantity).toLocaleString("id-ID")}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Shipping and Payment */}
            <div className="space-y-6">
              {/* Shipping Address */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
                
                {user?.address && user.address.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Saved Addresses</h3>
                    <div className="space-y-3">
                      {user.address.map(addr => (
                        <label key={addr.id} className="flex items-start space-x-3">
                          <input
                            type="radio"
                            name="address"
                            value={addr.id}
                            checked={selectedAddress === addr.id}
                            onChange={() => setSelectedAddress(addr.id)}
                            className="mt-1"
                          />
                          <div className="text-sm">
                            <p className="font-medium text-gray-700">
                              {addr.isDefault && (
                                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded mr-2">
                                  Default
                                </span>
                              )}
                            </p>
                            <p>{addr.street}</p>
                            <p>{addr.city}, {addr.state} {addr.postalCode}</p>
                            <p>{addr.country}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <label className="flex items-start space-x-3">
                    <input
                      type="radio"
                      name="address"
                      value="new"
                      checked={selectedAddress === 'new'}
                      onChange={() => setSelectedAddress('new')}
                      className="mt-1"
                    />
                    <span className="text-sm font-medium text-gray-700">Use a new address</span>
                  </label>
                </div>

                {selectedAddress === 'new' && (
                  <div className="space-y-4">
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700">Street Address</label>
                      <input
                        type="text"
                        name="street"
                        value={newAddress.street}
                        onChange={handleNewAddressChange}
                        onFocus={() => setShowSuggestions(true)}
                        autoComplete="off"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-white"
                      />
                      {showSuggestions && addressSuggestions.length > 0 && (
                        <div ref={suggestionsRef} className="absolute z-10 bg-white border border-gray-200 w-full mt-1 rounded shadow-lg max-h-56 overflow-y-auto">
                          {addressSuggestions.map((s, i) => (
                            <div
                              key={s.place_id || i}
                              className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                              onClick={() => handleSuggestionSelect(s)}
                            >
                              {s.text}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">City</label>
                        <input
                          type="text"
                          name="city"
                          value={newAddress.city}
                          onChange={handleNewAddressChange}
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">State/Province</label>
                        <input
                          type="text"
                          name="state"
                          value={newAddress.state}
                          onChange={handleNewAddressChange}
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Postal Code</label>
                        <input
                          type="text"
                          name="postalCode"
                          value={newAddress.postalCode}
                          onChange={handleNewAddressChange}
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Country</label>
                        <input
                          type="text"
                          name="country"
                          value={newAddress.country}
                          onChange={handleNewAddressChange}
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-white"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Courier selection and Order Summary */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

                {/* Courier selection */}
                {couriers.length > 0 ? (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Select Courier</h3>
                    <div className="space-y-2">
                      {couriers.map((courier) => (
                        courier.courier_services.map((service: any) => (
                          <label key={service.courier_code} className="flex items-center space-x-3">
                            <input
                              type="radio"
                              name="courier"
                              value={service.courier_code}
                              checked={selectedCourier === service.courier_code}
                              onChange={() => {
                                setSelectedCourier(service.courier_code);
                                setShippingCost(service.price);
                              }}
                              className="mt-1"
                            />
                            <div className="text-sm">
                              <span className="font-medium text-gray-700">{service.courier_name} ({service.courier_service_name})</span>
                              <span className="ml-2 text-gray-500">Rp{service.price.toLocaleString("id-ID")}</span>
                              {service.etd && (
                                <span className="ml-2 text-xs text-gray-400">Est. {service.etd} days</span>
                              )}
                            </div>
                          </label>
                        ))
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mb-4 text-sm text-gray-500">{(selectedAddress === 'new' ? Object.values(newAddress).every(Boolean) : !!selectedAddress) ? 'No couriers available for this address.' : 'Fill in address to see couriers.'}</div>
                )}

                {error && (
                  <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>Rp{total.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>{selectedCourier ? `Rp${shippingCost.toLocaleString("id-ID")}` : '-'}</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>Rp{(total + (selectedCourier ? shippingCost : 0)).toLocaleString("id-ID")}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={loading || cart.length === 0 || !selectedCourier}
                  className="w-full mt-6 bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : 'Proceed to Payment'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
