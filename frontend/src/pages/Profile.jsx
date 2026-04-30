import { useState, useEffect } from 'react';
import { authAPI, addressesAPI } from '../services/api';

function Profile() {
  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [form, setForm] = useState({ name: '', street: '', city: '', state: '', zip: '', phone: '', isDefault: false });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    authAPI.getProfile().then(res => setUser(res.data)).catch(console.error);
    addressesAPI.getAll().then(res => setAddresses(res.data)).catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await addressesAPI.update(editingId, form);
      } else {
        await addressesAPI.create(form);
      }
      addressesAPI.getAll().then(res => setAddresses(res.data)).catch(console.error);
      setForm({ name: '', street: '', city: '', state: '', zip: '', phone: '', isDefault: false });
      setEditingId(null);
      alert('Address saved!');
    } catch (err) {
      alert('Failed to save address');
    }
  };

  const handleDelete = async (id) => {
    try {
      await addressesAPI.delete(id);
      addressesAPI.getAll().then(res => setAddresses(res.data)).catch(console.error);
    } catch (err) {
      alert('Failed to delete');
    }
  };

  const handleEdit = (addr) => {
    setForm(addr);
    setEditingId(addr._id);
  };

  if (!user) return <div className="container">Loading...</div>;

  return (
    <div className="container">
      <h1>Profile</h1>
      <div className="card">
        <h2>{user.name}</h2>
        <p>{user.email}</p>
        <p>Role: {user.role}</p>
      </div>

      <h2>Addresses</h2>
      {addresses.map(addr => (
        <div key={addr._id} className="card" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <strong>{addr.name}</strong> {addr.isDefault && <span>(Default)</span>}
            <p>{addr.street}, {addr.city}, {addr.state} - {addr.zip}</p>
            <p>{addr.phone}</p>
          </div>
          <div>
            <button onClick={() => handleEdit(addr)}>Edit</button>
            <button className="btn btn-danger" onClick={() => handleDelete(addr._id)}>Delete</button>
          </div>
        </div>
      ))}

      <div className="card">
        <h3>{editingId ? 'Edit Address' : 'Add New Address'}</h3>
        <form onSubmit={handleSubmit}>
          <input placeholder="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
          <input placeholder="Street" value={form.street} onChange={e => setForm({...form, street: e.target.value})} required />
          <input placeholder="City" value={form.city} onChange={e => setForm({...form, city: e.target.value})} required />
          <input placeholder="State" value={form.state} onChange={e => setForm({...form, state: e.target.value})} required />
          <input placeholder="ZIP" value={form.zip} onChange={e => setForm({...form, zip: e.target.value})} required />
          <input placeholder="Phone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required />
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
            <input type="checkbox" checked={form.isDefault} onChange={e => setForm({...form, isDefault: e.target.checked})} />
            Set as default address
          </label>
          <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            {editingId ? 'Update Address' : 'Add Address'}
          </button>
          {editingId && <button type="button" onClick={() => { setEditingId(null); setForm({ name: '', street: '', city: '', state: '', zip: '', phone: '', isDefault: false }) }}>Cancel</button>}
        </form>
      </div>
    </div>
  );
}

export default Profile;