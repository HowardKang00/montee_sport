import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

export default function AdminProducts() {
  // Modal state for delete warning
  const [deleteId, setDeleteId] = useState<number|null>(null);
  // Modal for delete confirmation
  const showDeleteModal = deleteId !== null;
  const handleConfirmDelete = async () => {
    if (deleteId !== null) {
      await handleDelete(deleteId);
      setDeleteId(null);
    }
  };
  const handleAddProduct = async () => {
    if (!newProduct.productid || !newProduct.name) return alert('Product ID and Name required');
    // Convert comma separated strings to arrays for sizecharts and sizes
    const payload = {
      ...newProduct,
      sizecharts: newProduct.sizecharts.split(',').map((s: string) => s.trim()).filter(Boolean),
      sizes: newProduct.sizes.split(',').map((s: string) => s.trim()).filter(Boolean)
    };
    await fetch('http://localhost:4000/api/admin/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    setAdding(false);
    setNewProduct({
      productid: '', name: '', description: '', series: '', colorway: '', price: 0, discount: 0, gender: '', category: '', images: '', sizecharts: '', sizes: '', stock: 0
    });
    setLoading(true);
    fetch('http://localhost:4000/api/admin/products', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load products');
        setLoading(false);
      });
  };
  const [editId, setEditId] = useState<number|null>(null);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [adding, setAdding] = useState(false);
  const [newProduct, setNewProduct] = useState({
    productid: '',
    name: '',
    description: '',
    series: '',
    colorway: '',
    price: 0,
    discount: 0,
    gender: '',
    category: '',
    images: '',
    sizecharts: '',
    sizes: '',
    stock: 0
  });

  const { user, token } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    fetch('http://localhost:4000/api/admin/products', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load products');
        setLoading(false);
      });
  }, [token]);

  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/" />;
  }

  const handleDelete = async (id: number) => {
    if (!token) return;
    const confirmDelete = window.confirm('Are you sure you want to delete this product? This action cannot be undone.');
    if (!confirmDelete) return;
    await fetch(`http://localhost:4000/api/admin/products/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    setProducts(products.filter((p: any) => p.id !== id));
  };

  const handleEdit = async (id: number, updates: Partial<{ name: string; stock: number; price: number }>) => {
    if (!token) return;
    await fetch(`http://localhost:4000/api/admin/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(updates)
    });
    // Optionally refresh products list
    setLoading(true);
    fetch('http://localhost:4000/api/admin/products', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load products');
        setLoading(false);
      });
  };

  // ...existing code...
  return (
    <div className="p-4">
      <div className="w-full overflow-x-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-700">Manage Products</h2>
      {loading ? <p>Loading...</p> : error ? <p>{error}</p> : (
  <table className="min-w-max border rounded-xl shadow-sm">
          <thead className="sticky top-0 bg-gray-100 z-10">
            <tr>
              {['ID','Product ID','Name','Description','Series','Colorway','Price','Discount','Gender','Category','Images','Sizecharts','Sizes','Stock','Actions'].map(h => (
                <th key={h} className="px-3 py-2 text-gray-700 font-semibold text-sm border-b">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map((p: any, idx: number) => (
              editId === p.id ? (
                <tr key={p.id} className={idx % 2 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="px-3 py-2 text-gray-700">{p.id}</td>
                  <td><input className="border px-2" value={editProduct.productid} onChange={e => setEditProduct({ ...editProduct, productid: e.target.value })} /></td>
                  <td><input className="border px-2" value={editProduct.name} onChange={e => setEditProduct({ ...editProduct, name: e.target.value })} /></td>
                  <td><input className="border px-2" value={editProduct.description} onChange={e => setEditProduct({ ...editProduct, description: e.target.value })} /></td>
                  <td><input className="border px-2" value={editProduct.series} onChange={e => setEditProduct({ ...editProduct, series: e.target.value })} /></td>
                  <td><input className="border px-2" value={editProduct.colorway} onChange={e => setEditProduct({ ...editProduct, colorway: e.target.value })} /></td>
                  <td><input className="border px-2" type="number" value={editProduct.price} onChange={e => setEditProduct({ ...editProduct, price: Number(e.target.value) })} /></td>
                  <td><input className="border px-2" type="number" value={editProduct.discount} onChange={e => setEditProduct({ ...editProduct, discount: Number(e.target.value) })} /></td>
                  <td><input className="border px-2" value={editProduct.gender} onChange={e => setEditProduct({ ...editProduct, gender: e.target.value })} /></td>
                  <td><input className="border px-2" value={editProduct.category} onChange={e => setEditProduct({ ...editProduct, category: e.target.value })} /></td>
                  <td><input className="border px-2" value={Array.isArray(editProduct.images) ? editProduct.images.join(', ') : editProduct.images} onChange={e => setEditProduct({ ...editProduct, images: e.target.value })} placeholder="comma separated" /></td>
                  <td><input className="border px-2" value={Array.isArray(editProduct.sizecharts) ? editProduct.sizecharts.join(', ') : editProduct.sizecharts} onChange={e => setEditProduct({ ...editProduct, sizecharts: e.target.value })} placeholder="comma separated" /></td>
                  <td><input className="border px-2" value={Array.isArray(editProduct.sizes) ? editProduct.sizes.join(', ') : editProduct.sizes} onChange={e => setEditProduct({ ...editProduct, sizes: e.target.value })} placeholder="comma separated" /></td>
                  <td><input className="border px-2" type="number" value={editProduct.stock} onChange={e => setEditProduct({ ...editProduct, stock: Number(e.target.value) })} /></td>
                  <td>
                    <button className="text-green-600 mr-2" onClick={async () => {
                      const payload = {
                        ...editProduct,
                        images: typeof editProduct.images === 'string' ? editProduct.images.split(',').map((s: string) => s.trim()).filter(Boolean) : editProduct.images,
                        sizecharts: typeof editProduct.sizecharts === 'string' ? editProduct.sizecharts.split(',').map((s: string) => s.trim()).filter(Boolean) : editProduct.sizecharts,
                        sizes: typeof editProduct.sizes === 'string' ? editProduct.sizes.split(',').map((s: string) => s.trim()).filter(Boolean) : editProduct.sizes
                      };
                      await handleEdit(p.id, payload);
                      setEditId(null);
                      setEditProduct(null);
                    }}>Save</button>
                    <button className="text-gray-600" onClick={() => { setEditId(null); setEditProduct(null); }}>Cancel</button>
                  </td>
                </tr>
              ) : (
                <tr key={p.id} className={idx % 2 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="px-3 py-2 text-gray-700">{p.id}</td>
                  <td className="px-3 py-2 text-gray-700">{p.productid}</td>
                  <td className="px-3 py-2 text-gray-700">{p.name}</td>
                  <td className="px-3 py-2 text-gray-700 max-w-xs truncate" title={p.description}>{p.description}</td>
                  <td className="px-3 py-2 text-gray-700">{p.series}</td>
                  <td className="px-3 py-2 text-gray-700">{p.colorway}</td>
                  <td className="px-3 py-2 text-gray-700">{p.price}</td>
                  <td className="px-3 py-2 text-gray-700">{p.discount}</td>
                  <td className="px-3 py-2 text-gray-700">{p.gender}</td>
                  <td className="px-3 py-2 text-gray-700">{p.category}</td>
                  <td className="px-3 py-2 text-gray-700">
                    {Array.isArray(p.images) ? p.images.map((img: string, i: number) => (
                      <span key={i} className="inline-block bg-gray-200 text-xs rounded px-2 py-1 mr-1 mb-1 cursor-pointer" title={img}>{img.length > 20 ? img.slice(0,20)+'...' : img}</span>
                    )) : p.images}
                  </td>
                  <td className="px-3 py-2 text-gray-700">
                    {Array.isArray(p.sizecharts) ? p.sizecharts.map((sc: string, i: number) => (
                      <span key={i} className="inline-block bg-blue-100 text-xs rounded px-2 py-1 mr-1 mb-1 cursor-pointer" title={sc}>{sc.length > 20 ? sc.slice(0,20)+'...' : sc}</span>
                    )) : p.sizecharts}
                  </td>
                  <td className="px-3 py-2 text-gray-700">
                    {Array.isArray(p.sizes) ? p.sizes.map((sz: string, i: number) => (
                      <span key={i} className="inline-block bg-green-100 text-xs rounded px-2 py-1 mr-1 mb-1 cursor-pointer" title={sz}>{sz}</span>
                    )) : p.sizes}
                  </td>
                  <td className="px-3 py-2 text-gray-700">{p.stock}</td>
                  <td className="px-3 py-2 text-gray-700 whitespace-nowrap">
                    <button className="text-blue-600 hover:bg-blue-50 rounded px-2 py-1 mr-2" onClick={() => { setEditId(p.id); setEditProduct({ ...p }); }} title="Edit">
                      ✏️
                    </button>
                    <button className="text-red-600 hover:bg-red-50 rounded px-2 py-1" onClick={() => setDeleteId(p.id)} title="Delete">
                      🗑️
                    </button>
                  </td>
                </tr>
              )
            ))}
            {adding && (
              <tr className="bg-yellow-50">
                <td className="px-3 py-2 text-gray-700">New</td>
                <td><input className="border px-2" value={newProduct.productid} onChange={e => setNewProduct({ ...newProduct, productid: e.target.value })} /></td>
                <td><input className="border px-2" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} /></td>
                <td><input className="border px-2" value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} /></td>
                <td><input className="border px-2" value={newProduct.series} onChange={e => setNewProduct({ ...newProduct, series: e.target.value })} /></td>
                <td><input className="border px-2" value={newProduct.colorway} onChange={e => setNewProduct({ ...newProduct, colorway: e.target.value })} /></td>
                <td><input className="border px-2" type="number" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: Number(e.target.value) })} /></td>
                <td><input className="border px-2" type="number" value={newProduct.discount} onChange={e => setNewProduct({ ...newProduct, discount: Number(e.target.value) })} /></td>
                <td><input className="border px-2" value={newProduct.gender} onChange={e => setNewProduct({ ...newProduct, gender: e.target.value })} /></td>
                <td><input className="border px-2" value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })} /></td>
                <td><input className="border px-2" value={newProduct.images} onChange={e => setNewProduct({ ...newProduct, images: e.target.value })} placeholder="comma separated" /></td>
                <td><input className="border px-2" value={newProduct.sizecharts} onChange={e => setNewProduct({ ...newProduct, sizecharts: e.target.value })} placeholder="comma separated" /></td>
                <td><input className="border px-2" value={newProduct.sizes} onChange={e => setNewProduct({ ...newProduct, sizes: e.target.value })} placeholder="comma separated" /></td>
                <td><input className="border px-2" type="number" value={newProduct.stock} onChange={e => setNewProduct({ ...newProduct, stock: Number(e.target.value) })} /></td>
                <td>
                  <button className="text-green-600 mr-2" onClick={handleAddProduct}>Save</button>
                  <button className="text-gray-600" onClick={() => { setAdding(false); setNewProduct({ productid: '', name: '', description: '', series: '', colorway: '', price: 0, discount: 0, gender: '', category: '', images: '', sizecharts: '', sizes: '', stock: 0 }); }}>Cancel</button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
  </div>
  <button className="mt-6 px-6 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700" onClick={() => setAdding(true)}>Add Product</button>
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold mb-2 text-gray-800">Delete Product</h3>
            <p className="mb-4 text-gray-700">Are you sure you want to delete this product? This action cannot be undone.</p>
            <div className="flex justify-end gap-4">
              <button className="px-4 py-2 bg-gray-200 rounded text-gray-700" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="px-4 py-2 bg-red-600 rounded text-white" onClick={handleConfirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
