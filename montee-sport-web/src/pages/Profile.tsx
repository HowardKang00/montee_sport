import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, token, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phoneNumber: user?.phoneNumber || ''
  });
  const [message, setMessage] = useState({ type: '', content: '' });
  const [editingAddressId, setEditingAddressId] = useState<number|null>(null);
  const [addressForm, setAddressForm] = useState({
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    isDefault: false
  });
  const handleEditAddress = (addr: any) => {
    setEditingAddressId(addr.id);
    setAddressForm({
      street: addr.street,
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      country: addr.country,
      isDefault: !!addr.isDefault
    });
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setAddressForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddressSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', content: '' });
    try {
      const response = await fetch(`http://localhost:4000/api/users/address/${editingAddressId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(addressForm)
      });
      if (!response.ok) throw new Error('Failed to update address');
      const data = await response.json();
      setUser(data); // update context
      setMessage({ type: 'success', content: 'Address updated successfully!' });
      setEditingAddressId(null);
    } catch (error) {
      setMessage({ type: 'error', content: 'Failed to update address' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', content: '' });

    try {
      const response = await fetch('http://localhost:4000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();
      setUser(data); // <-- update context
      setMessage({ type: 'success', content: 'Profile updated successfully!' });
      setIsEditing(false);
    } catch (error) {
      setMessage({ type: 'error', content: 'Failed to update profile' });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-gray-700">Profile</h1>

      {message.content && (
        <div className={`p-4 rounded-md mb-4 ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message.content}
        </div>
      )}


      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-700">Personal Information</h2>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-indigo-600 hover:text-indigo-800"
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            {/* Address fields below phone number, with title */}
            {user.address && user.address.length > 0 && (
              <>
                <div className="pt-4">
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  {user.address.map((addr) => (
                    <div key={addr.id} className="border rounded-lg p-4 mb-4">
                      {editingAddressId === addr.id ? (
                        <form onSubmit={handleAddressSave} className="space-y-2">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Street</label>
                            <input type="text" name="street" value={addressForm.street} onChange={handleAddressChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">City</label>
                              <input type="text" name="city" value={addressForm.city} onChange={handleAddressChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">State</label>
                              <input type="text" name="state" value={addressForm.state} onChange={handleAddressChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Postal Code</label>
                              <input type="text" name="postalCode" value={addressForm.postalCode} onChange={handleAddressChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Country</label>
                              <input type="text" name="country" value={addressForm.country} onChange={handleAddressChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                            </div>
                          </div>
                          <div>
                            <label className="inline-flex items-center">
                              <input type="checkbox" name="isDefault" checked={addressForm.isDefault} onChange={handleAddressChange} className="mr-2" />
                              <span className="text-sm">Set as default address</span>
                            </label>
                          </div>
                          <div className="flex gap-2 pt-2">
                            <button type="submit" className="bg-indigo-600 text-white px-3 py-1 rounded">Save</button>
                            <button type="button" className="bg-gray-300 text-gray-700 px-3 py-1 rounded" onClick={() => setEditingAddressId(null)}>Cancel</button>
                          </div>
                        </form>
                      ) : (
                        <>
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center">
                              <span className="text-sm font-medium">
                                {addr.isDefault && (
                                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded mr-2">
                                    Default
                                  </span>
                                )}
                              </span>
                            </div>
                            <button className="text-indigo-600 hover:text-indigo-800 text-sm" onClick={() => handleEditAddress(addr)}>Edit</button>
                          </div>
                          <div className="space-y-2 text-sm text-gray-600">
                            <p>{addr.street}</p>
                            <p>{addr.city}, {addr.state} {addr.postalCode}</p>
                            <p>{addr.country}</p>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="pt-4">
              <button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
              <p className="mt-1 text-sm text-gray-900">{user.firstName} {user.lastName}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Email</h3>
              <p className="mt-1 text-sm text-gray-900">{user.email}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Phone Number</h3>
              <p className="mt-1 text-sm text-gray-900">{user.phoneNumber || 'Not provided'}</p>
            </div>
            {/* Show addresses in view mode too, with title */}
            {user.address && user.address.length > 0 && (
              <div className="pt-4">
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <div className="grid md:grid-cols-2 gap-6">
                  {user.address.map((addr) => (
                    <div key={addr.id} className="border rounded-lg p-4 mb-4">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center">
                          <span className="text-sm font-medium">
                            {addr.isDefault && (
                              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded mr-2">
                                Default
                              </span>
                            )}
                          </span>
                        </div>
                        <button className="text-indigo-600 hover:text-indigo-800 text-sm" onClick={() => handleEditAddress(addr)}>Edit</button>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p>{addr.street}</p>
                        <p>{addr.city}, {addr.state} {addr.postalCode}</p>
                        <p>{addr.country}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
