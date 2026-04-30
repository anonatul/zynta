import { useState, useEffect } from 'react';
import { ordersAPI } from '../services/api';

function Orders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    ordersAPI.getAll().then(res => setOrders(res.data)).catch(console.error);
  }, []);

  return (
    <div className="container">
      <h1>My Orders</h1>
      
      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        orders.map(order => (
          <div key={order._id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h3>Order #{order._id.slice(-8)}</h3>
              <span style={{ 
                padding: '0.25rem 0.5rem', 
                background: order.status === 'delivered' ? '#22c55e' : order.status === 'cancelled' ? '#ef4444' : '#f59e0b',
                color: 'white',
                borderRadius: '4px'
              }}>
                {order.status}
              </span>
            </div>
            <p>Total: ₹{order.totalAmount}</p>
            <p>Payment: {order.paymentStatus}</p>
            <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
            
            <h4>Items:</h4>
            {order.items.map((item, idx) => (
              <div key={idx} style={{ marginLeft: '1rem' }}>
                <p>{item.name} - ₹{item.price} x {item.quantity}</p>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}

export default Orders;