import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { sellerAPI, categoriesAPI } from '../services/api';

function SellerDashboard() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', stock: '', category: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      if (user.role !== 'seller') {
        navigate('/');
        return;
      }
    }
    loadData();
  }, [navigate]);

  const loadData = () => {
    Promise.all([
      sellerAPI.getProducts().catch(() => ({ data: [] })),
      categoriesAPI.getAll().catch(() => ({ data: [] }))
    ])
      .then(([prodRes, catRes]) => {
        setProducts(prodRes.data || []);
        setCategories(catRes.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...form,
        price: parseFloat(form.price),
        stock: parseInt(form.stock)
      };
      if (editingId) {
        await sellerAPI.updateProduct(editingId, data);
      } else {
        await sellerAPI.createProduct(data);
      }
      loadData();
      setShowForm(false);
      setEditingId(null);
      setForm({ name: '', description: '', price: '', stock: '', category: '' });
      alert(editingId ? 'Product updated!' : 'Product created!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save product');
    }
  };

  const handleEdit = (product) => {
    setForm({
      name: product.name,
      description: product.description,
      price: product.price?.toString() || '',
      stock: product.stock?.toString() || '',
      category: product.category
    });
    setEditingId(product._id || product.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await sellerAPI.deleteProduct(id);
      loadData();
      alert('Product deleted!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product');
    }
  };

  if (loading) return <div className="container"><div className="card">Loading...</div></div>;

  return (
    <div className="container">
      <div className="flex-between items-center mb-3">
        <h1 className="section-title" style={{ marginBottom: 0 }}>Seller Dashboard</h1>
        <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ name: '', description: '', price: '', stock: '', category: '' }); }}>
          {showForm ? 'Cancel' : '+ Add Product'}
        </button>
      </div>

      <div className="stats-grid mb-3">
        <div className="stat-card">
          <h4>Total Products</h4>
          <div className="value">{products.length}</div>
        </div>
        <div className="stat-card">
          <h4>In Stock</h4>
          <div className="value">{products.filter(p => p.stock > 0).length}</div>
        </div>
        <div className="stat-card">
          <h4>Out of Stock</h4>
          <div className="value">{products.filter(p => !p.stock || p.stock === 0).length}</div>
        </div>
      </div>

      {showForm && (
        <div className="card mb-3">
          <h3>{editingId ? 'Edit Product' : 'Add New Product'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Product Name</label>
                <input 
                  placeholder="Product name" 
                  value={form.name} 
                  onChange={e => setForm({...form, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select 
                  value={form.category} 
                  onChange={e => setForm({...form, category: e.target.value})}
                  required
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat._id || cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea 
                placeholder="Product description" 
                value={form.description} 
                onChange={e => setForm({...form, description: e.target.value})}
                rows={3}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Price (₹)</label>
                <input 
                  type="number" 
                  placeholder="0.00" 
                  value={form.price} 
                  onChange={e => setForm({...form, price: e.target.value})}
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              <div className="form-group">
                <label>Stock Quantity</label>
                <input 
                  type="number" 
                  placeholder="0" 
                  value={form.stock} 
                  onChange={e => setForm({...form, stock: e.target.value})}
                  min="0"
                  required
                />
              </div>
            </div>
            <div className="flex gap-2 mt-1">
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Update Product' : 'Create Product'}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => { setShowForm(false); setEditingId(null); setForm({ name: '', description: '', price: '', stock: '', category: '' }); }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {products.length === 0 ? (
        <div className="empty-state">
          <h3>No products yet</h3>
          <p>Add your first product to get started!</p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)} style={{ marginTop: '1rem' }}>
            Add Product
          </button>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Rating</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product._id || product.id}>
                  <td>
                    <strong>{product.name}</strong>
                    <p className="text-muted" style={{ fontSize: '0.8125rem', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {product.description}
                    </p>
                  </td>
                  <td>
                    <span className="badge">{product.category}</span>
                  </td>
                  <td className="font-bold">₹{product.price}</td>
                  <td>
                    {product.stock > 0 ? (
                      <span style={{ color: 'var(--success)' }}>{product.stock} in stock</span>
                    ) : (
                      <span style={{ color: 'var(--danger)' }}>Out of stock</span>
                    )}
                  </td>
                  <td>
                    {product.averageRating > 0 ? (
                      <span className="rating">★ {product.averageRating.toFixed(1)}</span>
                    ) : (
                      <span className="text-muted">No ratings</span>
                    )}
                  </td>
                  <td>
                    <div className="btn-group">
                      <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(product)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(product._id || product.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default SellerDashboard;