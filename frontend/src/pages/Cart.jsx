import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { cartAPI, ordersAPI, addressesAPI } from '../services/api';

const categoryIcons = {
  'Electronics': '📱',
  'Clothing': '👕',
  'Books': '📚',
  'Home': '🏠',
  'Sports': '⚽',
  'Toys': '🧸',
  'Food': '🍔',
  'Beauty': '💄'
};

function Cart() {
  const [cart, setCart] = useState({ items: [] });
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      cartAPI.get().catch(() => ({ data: { items: [] } })),
      addressesAPI.getAll().catch(() => ({ data: [] }))
    ])
      .then(([cartRes, addrRes]) => {
        setCart(cartRes.data || { items: [] });
        setAddresses(addrRes.data || []);
        if (addrRes.data?.length > 0) {
          const defaultAddr = addrRes.data.find(a => a.isDefault);
          setSelectedAddress(defaultAddr?._id || addrRes.data[0]._id);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleUpdateQuantity = async (itemId, quantity) => {
    if (quantity < 1) return;
    try {
      await cartAPI.update(itemId, { quantity });
      cartAPI.get().then(res => setCart(res.data || { items: [] })).catch(console.error);
    } catch (err) {
      alert('Failed to update');
    }
  };

  const handleRemove = async (itemId) => {
    try {
      await cartAPI.remove(itemId);
      cartAPI.get().then(res => setCart(res.data || { items: [] })).catch(console.error);
    } catch (err) {
      alert('Failed to remove');
    }
  };

  const handleOrder = async () => {
    if (!selectedAddress) return alert('Please select an address');
    try {
      const address = addresses.find(a => a._id === selectedAddress);
      await ordersAPI.create({
        shippingAddress: {
          street: address.street,
          city: address.city,
          state: address.state,
          zip: address.zip
        }
      });
      alert('Order placed successfully!');
      navigate('/orders');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to place order');
    }
  };

  const total = cart.items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);

  if (loading) return <div className="container"><div className="card">Loading...</div></div>;

  if (!cart.items.length) return (
    <div className="container">
      <div className="empty-state">
        <h3>Your cart is empty</h3>
        <p>Browse our products and add items to your cart</p>
        <Link to="/products" className="btn btn-primary" style={{ marginTop: '1rem' }}>Browse Products</Link>
      </div>
    </div>
  );

  return (
    <div className="container">
      <h1 className="section-title">Shopping Cart ({cart.items.length} items)</h1>
      
      <div className="grid grid-2">
        <div>
          {cart.items.map(item => (
            <div key={item._id || item.id} className="cart-item">
              <div className="cart-item-image">
                {categoryIcons[item.product?.category] || '📦'}
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                  {item.product?.name || 'Product'}
                </h3>
                <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                  ₹{item.product?.price} each
                </p>
                <div className="quantity-control mt-1">
                  <button 
                    className="quantity-btn" 
                    onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                  >
                    −
                  </button>
                  <span style={{ minWidth: '30px', textAlign: 'center' }}>{item.quantity}</span>
                  <button 
                    className="quantity-btn" 
                    onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold" style={{ marginBottom: '0.5rem' }}>
                  ₹{(item.product?.price || 0) * item.quantity}
                </p>
                <button 
                  className="btn btn-ghost btn-sm" 
                  onClick={() => handleRemove(item._id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div>
          <div className="card">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Order Summary</h2>
            
            <div className="flex-between mb-2">
              <span className="text-muted">Subtotal</span>
              <span>₹{total}</span>
            </div>
            <div className="flex-between mb-2">
              <span className="text-muted">Shipping</span>
              <span>Free</span>
            </div>
            <div className="flex-between" style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '1rem' }}>
              <span className="font-bold">Total</span>
              <span className="price">₹{total}</span>
            </div>
            
            <h3 style={{ marginTop: '1.5rem', marginBottom: '1rem', fontSize: '1rem' }}>Select Shipping Address</h3>
            {addresses.length === 0 ? (
              <div>
                <p className="text-muted mb-2">No addresses saved.</p>
                <Link to="/profile" className="btn btn-secondary">Add Address in Profile</Link>
              </div>
            ) : (
              <div>
                {addresses.map(addr => (
                  <div 
                    key={addr._id} 
                    className={`address-card ${selectedAddress === addr._id ? 'selected' : ''} ${addr.isDefault ? 'is-default' : ''}`}
                    onClick={() => setSelectedAddress(addr._id)}
                  >
                    <div className="flex-between items-center">
                      <div>
                        <strong>{addr.name}</strong>
                        {addr.isDefault && <span className="badge" style={{ marginLeft: '0.5rem' }}>Default</span>}
                        <p style={{ fontSize: '0.875rem', color: 'var(--foreground-muted)' }}>
                          {addr.street}, {addr.city}, {addr.state} - {addr.zip}
                        </p>
                      </div>
                      <input 
                        type="radio" 
                        name="address" 
                        checked={selectedAddress === addr._id}
                        onChange={() => {}}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <button 
              className="btn btn-primary" 
              onClick={handleOrder} 
              style={{ width: '100%', marginTop: '1.5rem' }}
              disabled={!selectedAddress}
            >
              Place Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;