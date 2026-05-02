import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Clock, CheckCircle, XCircle, UserCheck, UserX, ShieldCheck } from 'lucide-react';
import { adminAPI } from '../services/api';
import { useToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';

const statusCfg = { pending: { cls: 'chip-pending', label: 'Pending' }, approved: { cls: 'chip-approved', label: 'Approved' }, rejected: { cls: 'chip-rejected', label: 'Rejected' } };

function AdminDashboard() {
  const { user } = useAuth();
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/'); return; }
    loadSellers();
  }, []);

  const loadSellers = () => {
    adminAPI.getSellers()
      .then(r => {
        // Backend returns array directly from result.rows
        const data = r.data;
        setSellers(Array.isArray(data) ? data : (data?.sellers || []));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const approve = async (id) => {
    try { await adminAPI.approveSeller(id); loadSellers(); toast('Seller approved!', 'success'); }
    catch (e) { toast(e.response?.data?.message || 'Failed', 'error'); }
  };

  const reject = async (id) => {
    if (!confirm('Reject this seller?')) return;
    try { await adminAPI.rejectSeller(id); loadSellers(); toast('Seller rejected', 'info'); }
    catch (e) { toast(e.response?.data?.message || 'Failed', 'error'); }
  };

  if (loading) return <div className="container"><div className="skeleton" style={{ height: 200 }} /></div>;

  const pending = sellers.filter(s => s.status === 'pending');
  const approved = sellers.filter(s => s.status === 'approved');
  const rejected = sellers.filter(s => s.status === 'rejected');

  return (
    <motion.div className="container" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ paddingTop: '1rem', paddingBottom: '3rem' }}>
      <div className="flex-between mb-3">
        <div><p className="section-subtitle">Admin</p><h1 className="section-title" style={{ marginBottom: 0 }}>Admin Dashboard</h1></div>
        <span className="chip chip-approved" style={{ display: 'flex', alignItems: 'center', gap: 4 }}><ShieldCheck size={14} /> Admin</span>
      </div>

      <div className="stats-grid mb-3">
        <div className="stat-card"><h4><Users size={16} style={{ marginRight: 6 }} />Total Sellers</h4><div className="value">{sellers.length}</div></div>
        <div className="stat-card"><h4><Clock size={16} style={{ marginRight: 6 }} />Pending</h4><div className="value" style={{ color: 'var(--warning)' }}>{pending.length}</div></div>
        <div className="stat-card"><h4><CheckCircle size={16} style={{ marginRight: 6 }} />Approved</h4><div className="value" style={{ color: 'var(--success)' }}>{approved.length}</div></div>
        <div className="stat-card"><h4><XCircle size={16} style={{ marginRight: 6 }} />Rejected</h4><div className="value" style={{ color: 'var(--danger)' }}>{rejected.length}</div></div>
      </div>

      {sellers.length === 0 ? (
        <div className="empty-state"><Users size={48} strokeWidth={1.5} /><h3>No sellers</h3><p>Sellers will appear when they register.</p></div>
      ) : (
        <div className="table-container">
          <table><thead><tr><th>Seller</th><th>Email</th><th>Joined</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>{sellers.map(s => {
              const st = statusCfg[s.status] || statusCfg.pending;
              return (
                <tr key={s.id}>
                  <td><strong>{s.name}</strong></td>
                  <td className="text-muted">{s.email}</td>
                  <td className="text-muted">{s.created_at ? new Date(s.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}</td>
                  <td><span className={`chip ${st.cls}`}>{st.label}</span></td>
                  <td><div className="btn-group">
                    {s.status === 'pending' && <>
                      <button className="btn btn-success btn-sm" onClick={() => approve(s.id)}><UserCheck size={13} /> Approve</button>
                      <button className="btn btn-danger btn-sm" onClick={() => reject(s.id)}><UserX size={13} /> Reject</button>
                    </>}
                    {s.status === 'approved' && <button className="btn btn-warning btn-sm" onClick={() => reject(s.id)}>Revoke</button>}
                    {s.status === 'rejected' && <button className="btn btn-success btn-sm" onClick={() => approve(s.id)}>Re-approve</button>}
                  </div></td>
                </tr>
              );
            })}</tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}
export default AdminDashboard;