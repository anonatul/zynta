import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Minus, Plus, Trash2, MapPin, Package } from 'lucide-react';
import { cartAPI, ordersAPI, addressesAPI } from '../services/api';
import { useToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';

function Cart() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    Promise.all([
      cartAPI.get().catch(() => ({ data: { items: [] } })),
      addressesAPI.getAll().catch(() => ({ data: { addresses: [] } }))
    ]).then(([c, a]) => {
      const cartData = c.data || {};
      setItems(cartData.items || []);
      const addrList = Array.isArray(a.data) ? a.data : (a.data?.addresses || []);
      setAddresses(addrList);
      if (addrList.length) setSelectedAddress(addrList.find(x => x.is_default)?.id || addrList[0].id);
    }).finally(() => setLoading(false));
  }, []);

  const refresh = () => cartAPI.get().then(r => {
    const cartData = r.data || {};
    setItems(cartData.items || []);
  }).catch(console.error);

  const updateQty = async (id, qty) => {
    if (qty < 1) return;
    try {
      await cartAPI.update(id, { quantity: qty });
      refresh();
    } catch (err) { toast(err.response?.data?.message || 'Failed', 'error'); }
  };

  const remove = async (id) => {
    try {
      await cartAPI.remove(id);
      refresh();
      toast('Item removed', 'info');
    } catch (err) { toast('Failed to remove', 'error'); }
  };

  const placeOrder = async () => {
    if (!selectedAddress) return toast('Select an address', 'error');
    setPlacing(true);
    try {
      await ordersAPI.create({ shipping_address_id: selectedAddress });
      toast('Order placed!', 'success');
      navigate('/orders');
    } catch (err) { toast(err.response?.data?.message || 'Failed to place order', 'error'); }
    finally { setPlacing(false); }
  };

  // Items from PostgreSQL join have flat fields: title, price, image_url
  const total = items.reduce((s, i) => s + (Number(i.price) || 0) * (i.quantity || 1), 0);

  if (loading) return <div className="container"><div className="skeleton" style={{ height: 200 }} /></div>;
  if (!items.length) return (
    <div className="container"><div className="empty-state">
      <ShoppingBag size={48} strokeWidth={1.5} color="var(--fg-light)" />
      <h3>Your cart is empty</h3><p>Browse products and add items</p>
      <Link to="/products" className="btn btn-primary" style={{ marginTop: '1rem' }}>Browse Products</Link>
    </div></div>
  );

  return (
    <motion.div className="container" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ paddingTop: '1rem', paddingBottom: '3rem' }}>
      <h1 className="section-title">Shopping Cart ({items.length})</h1>
      <div className="grid grid-2">
        <div>
          {items.map(item => (
            <div key={item.id} className="cart-item">
              <div className="cart-item-image">
                {item.image_url
                  ? <img src={item.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius)' }} />
                  : <Package size={24} color="var(--accent)" />}
              </div>
              <div>
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 600 }}>{item.title || 'Product'}</h3>
                <p className="text-muted" style={{ fontSize: '0.8125rem' }}>₹{Number(item.price).toLocaleString()} each</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 0, border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', marginTop: '0.5rem', width: 'fit-content' }}>
                  <button style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'var(--surface)', cursor: 'pointer' }} onClick={() => updateQty(item.id, item.quantity - 1)}><Minus size={14} /></button>
                  <span style={{ minWidth: 30, textAlign: 'center', fontSize: '0.875rem', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)', padding: '4px 0' }}>{item.quantity}</span>
                  <button style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'var(--surface)', cursor: 'pointer' }} onClick={() => updateQty(item.id, item.quantity + 1)}><Plus size={14} /></button>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold" style={{ marginBottom: '0.5rem' }}>₹{(Number(item.price) * item.quantity).toLocaleString()}</p>
                <button className="btn btn-ghost btn-sm" onClick={() => remove(item.id)}><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
        <div>
          <div className="card">
            <h2 style={{ fontSize: '1.125rem', marginBottom: '1.5rem' }}>Order Summary</h2>
            <div className="flex-between mb-2"><span className="text-muted">Subtotal</span><span>₹{total.toLocaleString()}</span></div>
            <div className="flex-between mb-2"><span className="text-muted">Shipping</span><span style={{ color: 'var(--success)' }}>Free</span></div>
            <div className="flex-between" style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1rem', marginTop: '1rem' }}>
              <span className="font-bold">Total</span><span className="price">₹{total.toLocaleString()}</span>
            </div>
            <h3 style={{ marginTop: '1.5rem', marginBottom: '0.75rem', fontSize: '0.9375rem', display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={16} /> Shipping Address</h3>
            {addresses.length === 0 ? (
              <div><p className="text-muted mb-2">No addresses saved.</p><Link to="/profile" className="btn btn-secondary btn-sm">Add Address</Link></div>
            ) : addresses.map(a => (
              <div key={a.id} className={`address-card ${selectedAddress === a.id ? 'selected' : ''}`} onClick={() => setSelectedAddress(a.id)}>
                <div className="flex-between"><div><strong>{a.name || 'Address'}</strong>{a.is_default && <span className="badge" style={{ marginLeft: 8 }}>Default</span>}
                  <p style={{ fontSize: '0.8125rem', color: 'var(--fg-muted)' }}>{a.street}, {a.city}, {a.state} - {a.zip}</p></div>
                  <input type="radio" name="addr" checked={selectedAddress === a.id} onChange={() => {}} />
                </div>
              </div>
            ))}
            <button className="btn btn-primary btn-lg" onClick={placeOrder} style={{ width: '100%', marginTop: '1.5rem' }} disabled={placing || (!selectedAddress && addresses.length > 0)}>{placing ? 'Placing Order...' : 'Place Order'}</button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
export default Cart;