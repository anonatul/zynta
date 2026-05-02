import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ClipboardList, Package, Truck, CheckCircle, XCircle, Clock } from 'lucide-react';
import { ordersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const statusCfg = {
  pending: { cls: 'chip-pending', label: 'Pending', icon: Clock, color: 'var(--warning)' },
  processing: { cls: 'chip-processing', label: 'Processing', icon: Package, color: 'var(--accent)' },
  shipped: { cls: 'chip-processing', label: 'Shipped', icon: Truck, color: 'var(--primary)' },
  delivered: { cls: 'chip-approved', label: 'Delivered', icon: CheckCircle, color: 'var(--success)' },
  cancelled: { cls: 'chip-rejected', label: 'Cancelled', icon: XCircle, color: 'var(--danger)' }
};

function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    ordersAPI.getAll()
      .then(r => {
        const data = r.data;
        setOrders(Array.isArray(data) ? data : (data?.orders || []));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="container"><div className="skeleton" style={{ height: 200 }} /></div>;

  return (
    <motion.div className="container" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ paddingTop: '1rem', paddingBottom: '3rem' }}>
      <h1 className="section-title">My Orders</h1>
      {orders.length === 0 ? (
        <div className="empty-state"><ClipboardList size={48} strokeWidth={1.5} color="var(--fg-light)" /><h3>No orders yet</h3><p>Start shopping to see your orders here!</p></div>
      ) : orders.map(order => {
        const st = statusCfg[order.status] || statusCfg.pending;
        const StatusIcon = st.icon;
        return (
          <motion.div key={order.id} className="order-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="order-header">
              <div>
                <span className="order-id">Order #{order.order_number?.slice(-8) || String(order.id).slice(-8)}</span>
                <span className="text-muted" style={{ marginLeft: '1rem', fontSize: '0.8125rem' }}>
                  {new Date(order.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
              <span className={`chip ${st.cls}`} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <StatusIcon size={12} /> {st.label}
              </span>
            </div>

            {/* Order Items with individual statuses */}
            <div className="order-items">
              {order.items?.map((item, i) => {
                const itemSt = statusCfg[item.status] || statusCfg.pending;
                return (
                  <div key={item.id || i} className="order-item" style={{ padding: '0.5rem 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span>{item.title}</span>
                      {item.status && item.status !== order.status && (
                        <span className={`chip ${itemSt.cls}`} style={{ fontSize: '0.6875rem', padding: '2px 8px' }}>
                          {itemSt.label}
                        </span>
                      )}
                    </div>
                    <span className="text-muted">₹{Number(item.price).toLocaleString()} × {item.quantity}</span>
                  </div>
                );
              })}
            </div>

            <div className="flex-between mt-2" style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}>
              <div>
                <span className="text-muted">Payment: </span>
                <span style={{ textTransform: 'capitalize' }}>{order.payment_status || 'Pending'}</span>
                {order.shipping_address && (
                  <span className="text-muted" style={{ marginLeft: '1rem', fontSize: '0.8125rem' }}>
                    📍 {order.shipping_address}
                  </span>
                )}
              </div>
              <span className="order-total">₹{Number(order.total_amount).toLocaleString()}</span>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
export default Orders;