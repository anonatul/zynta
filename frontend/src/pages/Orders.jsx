import { useState, useEffect } from 'react';
import { ordersAPI } from '../services/api';

const statusConfig = {
  pending: { class: 'chip-pending', label: 'Pending' },
  processing: { class: 'chip-processing', label: 'Processing' },
  shipped: { class: 'chip-processing', label: 'Shipped' },
  delivered: { class: 'chip-approved', label: 'Delivered' },
  cancelled: { class: 'chip-rejected', label: 'Cancelled' }
};

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersAPI.getAll()
      .then(res => setOrders(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="container"><div className="card">Loading...</div></div>;

  return (
    <div className="container">
      <h1 className="section-title">My Orders</h1>
      
      {orders.length === 0 ? (
        <div className="empty-state">
          <h3>No orders yet</h3>
          <p>Start shopping to see your orders here!</p>
        </div>
      ) : (
        <div>
          {orders.map(order => {
            const status = statusConfig[order.status] || { class: 'chip-pending', label: order.status };
            return (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <div>
                    <span className="order-id">Order #{order._id?.slice(-8) || order.id}</span>
                    <span className="text-muted" style={{ marginLeft: '1rem', fontSize: '0.875rem' }}>
                      {new Date(order.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <span className={`chip ${status.class}`}>{status.label}</span>
                </div>
                
                <div className="order-items">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="order-item">
                      <span>{item.name || item.productName}</span>
                      <span className="text-muted">₹{item.price} × {item.quantity}</span>
                    </div>
                  ))}
                </div>
                
                <div className="flex-between mt-2" style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}>
                  <div>
                    <span className="text-muted">Payment: </span>
                    <span style={{ textTransform: 'capitalize' }}>{order.paymentStatus || 'Pending'}</span>
                  </div>
                  <span className="order-total">₹{order.totalAmount}</span>
                </div>
                
                {order.shippingAddress && (
                  <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--foreground-muted)' }}>
                    <strong>Shipping to:</strong> {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zip}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Orders;