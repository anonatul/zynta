import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit3, Trash2, Package, BarChart3, AlertCircle, X, ShoppingCart } from 'lucide-react';
import { sellerAPI, categoriesAPI } from '../services/api';
import { useToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';

function SellerDashboard() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', price: '', stock_quantity: '', category_id: '', image_url: '' });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user || user.role !== 'seller') { navigate('/'); return; }
    if (user.status !== 'approved') return; // show pending message
    loadData();
  }, []);

  const loadData = () => {
    Promise.all([
      sellerAPI.getProducts().catch(() => ({ data: [] })),
      sellerAPI.getOrders().catch(() => ({ data: { orders: [] } })),
      categoriesAPI.getAll().catch(() => ({ data: { categories: [] } }))
    ])
      .then(([p, o, c]) => {
        // Products: backend returns array directly
        setProducts(Array.isArray(p.data) ? p.data : (p.data?.products || []));
        // Orders: backend returns { orders: [...] } or array
        setOrders(Array.isArray(o.data) ? o.data : (o.data?.orders || []));
        // Categories: backend returns { categories: [...] } or array
        setCategories(Array.isArray(c.data) ? c.data : (c.data?.categories || []));
      })
      .finally(() => setLoading(false));
  };

  const handleStatusChange = async (itemId, newStatus) => {
    try {
      await sellerAPI.updateOrderStatus(itemId, { status: newStatus });
      toast(`Order marked as ${newStatus}`, 'success');
      loadData();
    } catch (err) { toast(err.response?.data?.message || 'Failed', 'error'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        title: form.title,
        description: form.description,
        price: parseFloat(form.price),
        stock_quantity: parseInt(form.stock_quantity),
        category_id: form.category_id || null,
        image_url: form.image_url || null
      };
      editingId ? await sellerAPI.updateProduct(editingId, data) : await sellerAPI.createProduct(data);
      loadData();
      setShowForm(false); setEditingId(null);
      setForm({ title: '', description: '', price: '', stock_quantity: '', category_id: '', image_url: '' });
      toast(editingId ? 'Updated!' : 'Created!', 'success');
    } catch (err) { toast(err.response?.data?.message || 'Failed', 'error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try { await sellerAPI.deleteProduct(id); loadData(); toast('Deleted', 'info'); } catch { toast('Failed', 'error'); }
  };

  // Show pending status for unapproved sellers
  if (user?.role === 'seller' && user?.status !== 'approved') {
    return (
      <motion.div className="container" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ paddingTop: '2rem' }}>
        <div className="empty-state">
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <h2>Seller Approval Pending</h2>
          <p className="text-muted" style={{ maxWidth: 400, margin: '0.5rem auto' }}>
            Your seller account is currently under review. You'll be able to access your dashboard once an admin approves your application.
          </p>
          <span className="chip chip-pending" style={{ marginTop: '1rem' }}>Status: {user.status || 'Pending'}</span>
        </div>
      </motion.div>
    );
  }

  if (loading) return <div className="container"><div className="skeleton" style={{ height: 200 }} /></div>;

  return (
    <motion.div className="container" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ paddingTop: '1rem', paddingBottom: '3rem' }}>
      <div className="flex-between mb-3">
        <div><p className="section-subtitle">Dashboard</p><h1 className="section-title" style={{ marginBottom: 0 }}>Seller Panel</h1></div>
        <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ title: '', description: '', price: '', stock_quantity: '', category_id: '', image_url: '' }); }}>
          {showForm ? <><X size={16} /> Cancel</> : <><Plus size={16} /> Add Product</>}
        </button>
      </div>

      <div className="stats-grid mb-3">
        <div className="stat-card"><h4><Package size={16} style={{ marginRight: 6 }} />Total Products</h4><div className="value">{products.length}</div></div>
        <div className="stat-card"><h4><BarChart3 size={16} style={{ marginRight: 6 }} />In Stock</h4><div className="value" style={{ color: 'var(--success)' }}>{products.filter(p => p.stock_quantity > 0).length}</div></div>
        <div className="stat-card"><h4><AlertCircle size={16} style={{ marginRight: 6 }} />Out of Stock</h4><div className="value" style={{ color: 'var(--danger)' }}>{products.filter(p => !p.stock_quantity).length}</div></div>
        <div className="stat-card"><h4><ShoppingCart size={16} style={{ marginRight: 6 }} />Orders</h4><div className="value" style={{ color: orders.length > 0 ? 'var(--warning)' : 'var(--success)' }}>{orders.length}</div></div>
      </div>

      {orders.length > 0 && (
        <motion.div className="card mb-3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h3 style={{ marginBottom: '1rem' }}>Recent Orders</h3>
          <div className="table-container">
            <table><thead><tr><th>Order</th><th>Customer</th><th>Product</th><th>Qty</th><th>Amount</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>{orders.map(o => (
                <tr key={o.item_id}>
                  <td><strong>{o.order_number?.slice(-8)}</strong></td>
                  <td><div>{o.customer_name}</div><small className="text-muted">{o.customer_email}</small></td>
                  <td>{o.title}</td>
                  <td>{o.quantity}</td>
                  <td className="font-bold">₹{Number(o.subtotal).toLocaleString()}</td>
                  <td><span className={`chip chip-${o.item_status === 'pending' ? 'pending' : o.item_status === 'processing' ? 'processing' : o.item_status === 'shipped' ? 'processing' : 'approved'}`}>{o.item_status || 'pending'}</span></td>
                  <td>
                    {o.item_status === 'pending' && (
                      <select className="btn btn-sm" onChange={e => handleStatusChange(o.item_id, e.target.value)} defaultValue="">
                        <option value="" disabled>Update</option>
                        <option value="processing">Accept</option>
                        <option value="cancelled">Cancel</option>
                      </select>
                    )}
                    {o.item_status === 'processing' && (
                      <button className="btn btn-primary btn-sm" onClick={() => handleStatusChange(o.item_id, 'shipped')}>Ship</button>
                    )}
                    {o.item_status === 'shipped' && (
                      <button className="btn btn-sm" style={{ background: 'var(--success)', color: 'white' }} onClick={() => handleStatusChange(o.item_id, 'delivered')}>Delivered</button>
                    )}
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </motion.div>
      )}

      {showForm && (
        <motion.div className="card mb-3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h3 style={{ marginBottom: '1rem' }}>{editingId ? 'Edit Product' : 'Add New Product'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group"><label>Title</label><input placeholder="Product title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required /></div>
              <div className="form-group"><label>Category</label>
                <select value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})}>
                  <option value="">Select category</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group"><label>Description</label><textarea placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} required /></div>
            <div className="form-group"><label>Image URL</label><input placeholder="https://images.unsplash.com/..." value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})} /></div>
            <div className="form-row">
              <div className="form-group"><label>Price (₹)</label><input type="number" placeholder="0" value={form.price} onChange={e => setForm({...form, price: e.target.value})} min="0" step="0.01" required /></div>
              <div className="form-group"><label>Stock Quantity</label><input type="number" placeholder="0" value={form.stock_quantity} onChange={e => setForm({...form, stock_quantity: e.target.value})} min="0" required /></div>
            </div>
            <div className="flex gap-2"><button type="submit" className="btn btn-primary">{editingId ? 'Update' : 'Create'}</button>
              <button type="button" className="btn btn-secondary" onClick={() => { setShowForm(false); setEditingId(null); }}>Cancel</button></div>
          </form>
        </motion.div>
      )}

      {products.length === 0 ? (
        <div className="empty-state"><Package size={48} strokeWidth={1.5} /><h3>No products yet</h3><p>Add your first product!</p></div>
      ) : (
        <div className="table-container">
          <table><thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead>
            <tbody>{products.map(p => (
              <tr key={p.id}>
                <td><strong>{p.title}</strong><p className="text-muted" style={{ fontSize: '0.8125rem', maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.description}</p></td>
                <td><span className="badge">{p.category || 'None'}</span></td>
                <td className="font-bold">₹{Number(p.price).toLocaleString()}</td>
                <td>{p.stock_quantity > 0 ? <span style={{ color: 'var(--success)' }}>{p.stock_quantity} in stock</span> : <span style={{ color: 'var(--danger)' }}>Out</span>}</td>
                <td><div className="btn-group">
                  <button className="btn btn-secondary btn-sm" onClick={() => {
                    setForm({ title: p.title, description: p.description, price: p.price?.toString(), stock_quantity: p.stock_quantity?.toString(), category_id: p.category_id?.toString() || '', image_url: p.image_url || '' });
                    setEditingId(p.id); setShowForm(true);
                  }}><Edit3 size={13} /></button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}><Trash2 size={13} /></button>
                </div></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}
export default SellerDashboard;