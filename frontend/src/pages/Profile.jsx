import { useState, useEffect } from 'react';
import { authAPI, addressesAPI } from '../services/api';

function Profile() {
  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [form, setForm] = useState({ name: '', street: '', city: '', state: '', zip: '', phone: '', isDefault: false });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      authAPI.getProfile().catch(() => ({ data: null })),
      addressesAPI.getAll().catch(() => ({ data: [] }))
    ])
      .then(([userRes, addrRes]) => {
        setUser(userRes.data);
        setAddresses(addrRes.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await addressesAPI.update(editingId, form);
      } else {
        await addressesAPI.create(form);
      }
      addressesAPI.getAll().then(res => setAddresses(res.data || [])).catch(console.error);
      setForm({ name: '', street: '', city: '', state: '', zip: '', phone: '', isDefault: false });
      setEditingId(null);
      alert('Address saved!');
    } catch (err) {
      alert('Failed to save address');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      await addressesAPI.delete(id);
      addressesAPI.getAll().then(res => setAddresses(res.data || [])).catch(console.error);
    } catch (err) {
      alert('Failed to delete');
    }
  };

  const handleEdit = (addr) => {
    setForm(addr);
    setEditingId(addr._id);
  };

  if (loading) return <div className="container"><div className="card">Loading...</div></div>;
  if (!user) return <div className="container"><div className="card">Please log in to view your profile.</div></div>;

  return (
    <div className="container">
      <h1 className="section-title">My Profile</h1>
      
      <div className="card mb-3">
        <div className="profile-header">
          <div className="profile-avatar">
            {user.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{user.name}</h2>
            <p className="text-muted">{user.email}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <span className="badge" style={{ fontSize: '0.875rem', padding: '0.375rem 0.75rem' }}>
            Role: {user.role}
          </span>
        </div>
      </div>

      <h2 className="section-title">My Addresses</h2>
      
      {addresses.length > 0 ? (
        <div className="grid grid-2 mb-3">
          {addresses.map(addr => (
            <div 
              key={addr._id} 
              className={`card-flat ${addr.isDefault ? 'is-default' : ''}`}
              style={{ borderColor: addr.isDefault ? 'var(--success)' : 'var(--border)' }}
            >
              <div className="flex-between items-center mb-2">
                <strong style={{ fontSize: '1.125rem' }}>{addr.name}</strong>
                {addr.isDefault && <span className="chip chip-approved">Default</span>}
              </div>
              <p className="text-muted" style={{ marginBottom: '0.25rem' }}>{addr.street}</p>
              <p className="text-muted" style={{ marginBottom: '0.25rem' }}>{addr.city}, {addr.state} - {addr.zip}</p>
              <p className="text-muted">📞 {addr.phone}</p>
              <div className="address-actions mt-2">
                <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(addr)}>Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(addr._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted mb-3">No addresses saved yet.</p>
      )}

      <div className="card">
        <h3 style={{ marginBottom: '1.5rem' }}>{editingId ? 'Edit Address' : 'Add New Address'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Address Name</label>
              <input 
                placeholder="Home, Work, etc." 
                value={form.name} 
                onChange={e => setForm({...form, name: e.target.value})} 
                required 
              />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input 
                placeholder="Phone number" 
                value={form.phone} 
                onChange={e => setForm({...form, phone: e.target.value})} 
                required 
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Street Address</label>
            <input 
              placeholder="Street address" 
              value={form.street} 
              onChange={e => setForm({...form, street: e.target.value})} 
              required 
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>City</label>
              <input 
                placeholder="City" 
                value={form.city} 
                onChange={e => setForm({...form, city: e.target.value})} 
                required 
              />
            </div>
            <div className="form-group">
              <label>State</label>
              <input 
                placeholder="State" 
                value={form.state} 
                onChange={e => setForm({...form, state: e.target.value})} 
                required 
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>ZIP Code</label>
              <input 
                placeholder="ZIP code" 
                value={form.zip} 
                onChange={e => setForm({...form, zip: e.target.value})} 
                required 
              />
            </div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={form.isDefault} 
                  onChange={e => setForm({...form, isDefault: e.target.checked})}
                  style={{ width: 'auto' }}
                />
                Set as default address
              </label>
            </div>
          </div>
          
          <div className="flex gap-2 mt-2">
            <button type="submit" className="btn btn-primary">
              {editingId ? 'Update Address' : 'Add Address'}
            </button>
            {editingId && (
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => { 
                  setEditingId(null); 
                  setForm({ name: '', street: '', city: '', state: '', zip: '', phone: '', isDefault: false }); 
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default Profile;