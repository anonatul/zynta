import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { cartAPI, ordersAPI, addressesAPI } from '../services/api';

function Cart() {
  const [cart, setCart] = useState({ items: [] });
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    cartAPI.get().then(res => setCart(res.data)).catch(console.error);
    addressesAPI.getAll().then(res => setAddresses(res.data)).catch(() => {});
  }, []);

  const handleUpdateQuantity = async (itemId, quantity) => {
    try {
      await cartAPI.update(itemId, { quantity });
      cartAPI.get().then(res => setCart(res.data)).catch(console.error);
    } catch (err) {
      alert('Failed to update');
    }
  };

  const handleRemove = async (itemId) => {
    try {
      await cartAPI.remove(itemId);
      cartAPI.get().then(res => setCart(res.data)).catch(console.error);
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
      alert('Order placed!');
      navigate('/orders');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to place order');
    }
  };

  const total = cart.items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);

  if (!cart.items.length) return (
    <div className="container" style={{ textAlign: 'center', padding: '3rem' }}>
      <h2>Your cart is empty</h2>
      <Link to="/products"><button className="btn btn-primary" style={{ marginTop: '1rem' }}>Browse Products</button></Link>
    </div>
  );

  return (
    <div className="container">
      <h1>Cart</h1>
      
      <div className="grid grid-2">
        <div>
          {cart.items.map(item => (
            <div key={item._id} className="card">
              <h3>{item.product?.name}</h3>
              <p>₹{item.product?.price}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}>-</button>
                <span>{item.quantity}</span>
                <button onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}>+</button>
                <button className="btn btn-danger" onClick={() => handleRemove(item._id)}>Remove</button>
              </div>
            </div>
          ))}
        </div>
        
        <div>
          <div className="card">
            <h2>Total: ₹{total}</h2>
            
            <h3>Select Address</h3>
            {addresses.length === 0 ? (
              <p>No addresses. <Link to="/profile">Add one in profile</Link></p>
            ) : (
              addresses.map(addr => (
                <div key={addr._id} style={{ marginBottom: '0.5rem' }}>
                  <input 
                    type="radio" 
                    name="address" 
                    checked={selectedAddress === addr._id}
                    onChange={() => setSelectedAddress(addr._id)}
                  />
                  <span style={{ marginLeft: '0.5rem' }}>{addr.name}, {addr.street}, {addr.city}</span>
                </div>
              ))
            )}
            
            <button className="btn btn-primary" onClick={handleOrder} style={{ width: '100%', marginTop: '1rem' }}>
              Place Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;