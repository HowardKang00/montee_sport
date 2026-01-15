import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

export default function AdminUsers() {
  const handleSaveUserEdit = async (id: number, role: string) => {
    if (!token) return;
    await fetch(`http://localhost:4000/api/admin/users/${id}/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ role })
    });
    setEditId(null);
    setEditUser(null);
    setLoading(true);
    fetch('http://localhost:4000/api/admin/users', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load users');
        setLoading(false);
      });
  };
  const [editId, setEditId] = useState<number|null>(null);
  const [editUser, setEditUser] = useState<any>(null);
  const handleEditUser = async (id: number) => {
    if (!token) return;
    const role = prompt('Edit user role (ADMIN or CUSTOMER):');
    if (!role) return;
    await fetch(`http://localhost:4000/api/admin/users/${id}/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ role })
    });
    setLoading(true);
    fetch('http://localhost:4000/api/admin/users', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load users');
        setLoading(false);
      });
  };

  const handleDeleteUser = async (id: number) => {
    if (!token) return;
    const confirmDelete = window.confirm('Are you sure you want to delete this user? This action cannot be undone.');
    if (!confirmDelete) return;
    await fetch(`http://localhost:4000/api/admin/users/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    setUsers(users.filter((u: any) => u.id !== id));
  };
  const { user, token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    fetch('http://localhost:4000/api/admin/users', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load users');
        setLoading(false);
      });
  }, [token]);

  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/" />;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-gray-700">Manage Users</h2>
      {loading ? <p>Loading...</p> : error ? <p>{error}</p> : (
        <table className="min-w-full border">
          <thead>
            <tr>
              <th className="text-gray-700">ID</th>
              <th className="text-gray-700">Email</th>
              <th className="text-gray-700">Name</th>
              <th className="text-gray-700">Role</th>
              <th className="text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u: any) => (
              editId === u.id ? (
                <tr key={u.id}>
                  <td className="text-gray-700">{u.id}</td>
                  <td className="text-gray-700">{u.email}</td>
                  <td className="text-gray-700">{u.firstName} {u.lastName}</td>
                  <td>
                    <select className="border px-2" value={editUser.role} onChange={e => setEditUser({ ...editUser, role: e.target.value })}>
                      <option value="ADMIN">ADMIN</option>
                      <option value="CUSTOMER">CUSTOMER</option>
                    </select>
                  </td>
                  <td>
                    <button className="text-green-600 mr-2" onClick={() => handleSaveUserEdit(u.id, editUser.role)}>Save</button>
                    <button className="text-gray-600" onClick={() => { setEditId(null); setEditUser(null); }}>Cancel</button>
                  </td>
                </tr>
              ) : (
                <tr key={u.id}>
                  <td className="text-gray-700">{u.id}</td>
                  <td className="text-gray-700">{u.email}</td>
                  <td className="text-gray-700">{u.firstName} {u.lastName}</td>
                  <td className="text-gray-700">{u.role}</td>
                  <td>
                    <button className="text-blue-600 mr-2" onClick={() => { setEditId(u.id); setEditUser({ ...u }); }}>Edit</button>
                    <button className="text-red-600" onClick={() => handleDeleteUser(u.id)}>Delete</button>
                  </td>
                </tr>
              )
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
