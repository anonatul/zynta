import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Edit3, Trash2, Plus } from 'lucide-react';
import { authAPI, addressesAPI } from '../services/api';
import { useToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';

function Profile() {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [form, setForm] = useState({ name: '', street: '', city: '', state: '', zip: '', phone: '', is_default: false });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    Promise.all([
      authAPI.getProfile().catch(() => ({ data: null })),
      addressesAPI.getAll().catch(() => ({ data: { addresses: [] } }))
    ]).then(([u, a]) => {
      // Profile returns { user: {...} }
      const userData = u.data?.user || u.data;
      setUser(userData);
      // Addresses returns { addresses: [...] }
      const addrData = a.data;
      setAddresses(Array.isArray(addrData) ? addrData : (addrData?.addresses || []));
    }).finally(() => setLoading(false));
  }, []);

  const refreshAddr = () => addressesAPI.getAll().then(r => {
    const d = r.data;
    setAddresses(Array.isArray(d) ? d : (d?.addresses || []));
  });

  const resetForm = () => { setForm({ name: '', street: '', city: '', state: '', zip: '', phone: '', is_default: false }); setEditingId(null); setShowForm(false); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      editingId ? await addressesAPI.update(editingId, form) : await addressesAPI.create(form);
      refreshAddr(); resetForm(); toast('Address saved!', 'success');
    } catch { toast('Failed to save', 'error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this address?')) return;
    try { await addressesAPI.delete(id); refreshAddr(); toast('Deleted', 'info'); } catch { toast('Failed', 'error'); }
  };

  if (loading) return <div className="container"><div className="skeleton" style={{ height: 200 }} /></div>;
  if (!user) return <div className="container"><div className="card">Please log in to view your profile.</div></div>;

  return (
    <motion.div className="container" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ paddingTop: '1rem', paddingBottom: '3rem' }}>
      <h1 className="section-title">My Profile</h1>
      <div className="card mb-3">
        <div className="profile-header">
          <div className="profile-avatar">{user.name?.charAt(0).toUpperCase() || 'U'}</div>
          <div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{user.name}</h2>
            <p className="text-muted">{user.email}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span className="badge" style={{ fontSize: '0.8125rem', padding: '0.375rem 0.75rem', textTransform: 'capitalize' }}>
            Role: {user.role}
          </span>
          {user.role === 'seller' && (
            <span className={`chip ${user.status === 'approved' ? 'chip-approved' : user.status === 'rejected' ? 'chip-rejected' : 'chip-pending'}`}>
              {user.status === 'approved' ? '✓ Approved' : user.status === 'rejected' ? '✗ Rejected' : '⏳ Pending Approval'}
            </span>
          )}
        </div>
      </div>

      <div className="flex-between mb-2">
        <h2 className="section-title" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: 8 }}><MapPin size={20} /> Addresses</h2>
        <button className="btn btn-primary btn-sm" onClick={() => { resetForm(); setShowForm(true); }}><Plus size={14} /> Add</button>
      </div>

      {addresses.length > 0 && (
        <div className="grid grid-2 mb-3">
          {addresses.map(a => (
            <div key={a.id} className="card-flat" style={{ borderColor: a.is_default ? 'var(--success)' : 'var(--border-light)' }}>
              <div className="flex-between mb-1">
                <strong>{a.name || 'Address'}</strong>{a.is_default && <span className="chip chip-approved">Default</span>}
              </div>
              <p className="text-muted" style={{ fontSize: '0.875rem' }}>{a.street}, {a.city}, {a.state} - {a.zip}</p>
              {a.phone && <p className="text-muted" style={{ fontSize: '0.875rem' }}>Phone: {a.phone}</p>}
              <div className="address-actions">
                <button className="btn btn-secondary btn-sm" onClick={() => {
                  setForm({ name: a.name || '', street: a.street, city: a.city, state: a.state, zip: a.zip, phone: a.phone || '', is_default: a.is_default || false });
                  setEditingId(a.id); setShowForm(true);
                }}><Edit3 size={13} /> Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(a.id)}><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <motion.div className="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h3 style={{ marginBottom: '1.25rem' }}>{editingId ? 'Edit Address' : 'Add New Address'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group"><label>Label</label><input placeholder="Home, Work..." value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
              <div className="form-group"><label>Phone</label><input placeholder="Phone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
            </div>
            <div className="form-group"><label>Street</label><input placeholder="Street address" value={form.street} onChange={e => setForm({...form, street: e.target.value})} required /></div>
            <div className="form-row">
              <div className="form-group"><label>City</label><input placeholder="City" value={form.city} onChange={e => setForm({...form, city: e.target.value})} required /></div>
              <div className="form-group"><label>State</label><input placeholder="State" value={form.state} onChange={e => setForm({...form, state: e.target.value})} required /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>ZIP</label><input placeholder="ZIP" value={form.zip} onChange={e => setForm({...form, zip: e.target.value})} required /></div>
              <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.is_default} onChange={e => setForm({...form, is_default: e.target.checked})} style={{ width: 'auto' }} /> Default
                </label>
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn btn-primary">{editingId ? 'Update' : 'Add'}</button>
              <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel</button>
            </div>
          </form>
        </motion.div>
      )}
    </motion.div>
  );
}
export default Profile;