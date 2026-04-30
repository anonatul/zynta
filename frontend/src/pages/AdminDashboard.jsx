import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';

const statusConfig = {
  pending: { class: 'chip-pending', label: 'Pending' },
  approved: { class: 'chip-approved', label: 'Approved' },
  rejected: { class: 'chip-rejected', label: 'Rejected' }
};

function AdminDashboard() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      if (user.role !== 'admin') {
        navigate('/');
        return;
      }
    }
    loadSellers();
  }, [navigate]);

  const loadSellers = () => {
    adminAPI.getSellers()
      .then(res => setSellers(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleApprove = async (id) => {
    try {
      await adminAPI.approveSeller(id);
      loadSellers();
      alert('Seller approved!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve seller');
    }
  };

  const handleReject = async (id) => {
    if (!confirm('Are you sure you want to reject this seller?')) return;
    try {
      await adminAPI.rejectSeller(id);
      loadSellers();
      alert('Seller rejected!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject seller');
    }
  };

  if (loading) return <div className="container"><div className="card">Loading...</div></div>;

  const pendingSellers = sellers.filter(s => s.status === 'pending');
  const approvedSellers = sellers.filter(s => s.status === 'approved');
  const rejectedSellers = sellers.filter(s => s.status === 'rejected');

  return (
    <div className="container">
      <h1 className="section-title">Admin Dashboard</h1>

      <div className="stats-grid mb-3">
        <div className="stat-card">
          <h4>Total Sellers</h4>
          <div className="value">{sellers.length}</div>
        </div>
        <div className="stat-card">
          <h4>Pending Approval</h4>
          <div className="value" style={{ color: 'var(--warning)' }}>{pendingSellers.length}</div>
        </div>
        <div className="stat-card">
          <h4>Approved Sellers</h4>
          <div className="value" style={{ color: 'var(--success)' }}>{approvedSellers.length}</div>
        </div>
        <div className="stat-card">
          <h4>Rejected Sellers</h4>
          <div className="value" style={{ color: 'var(--danger)' }}>{rejectedSellers.length}</div>
        </div>
      </div>

      {pendingSellers.length > 0 && (
        <>
          <h2 className="section-title">Pending Sellers ({pendingSellers.length})</h2>
          <div className="table-container mb-3">
            <table>
              <thead>
                <tr>
                  <th>Seller</th>
                  <th>Email</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingSellers.map(seller => (
                  <tr key={seller._id || seller.id}>
                    <td>
                      <strong>{seller.name}</strong>
                    </td>
                    <td className="text-muted">{seller.email}</td>
                    <td className="text-muted">
                      {seller.createdAt ? new Date(seller.createdAt).toLocaleDateString() : '-'}
                    </td>
                    <td>
                      <span className={`chip ${statusConfig[seller.status]?.class || 'chip-pending'}`}>
                        {statusConfig[seller.status]?.label || 'Pending'}
                      </span>
                    </td>
                    <td>
                      <div className="btn-group">
                        <button 
                          className="btn btn-success btn-sm" 
                          onClick={() => handleApprove(seller._id || seller.id)}
                        >
                          Approve
                        </button>
                        <button 
                          className="btn btn-danger btn-sm" 
                          onClick={() => handleReject(seller._id || seller.id)}
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <h2 className="section-title">All Sellers</h2>
      {sellers.length === 0 ? (
        <div className="empty-state">
          <h3>No sellers registered</h3>
          <p>Sellers will appear here when they register.</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Seller</th>
                <th>Email</th>
                <th>Joined</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sellers.map(seller => (
                <tr key={seller._id || seller.id}>
                  <td>
                    <strong>{seller.name}</strong>
                  </td>
                  <td className="text-muted">{seller.email}</td>
                  <td className="text-muted">
                    {seller.createdAt ? new Date(seller.createdAt).toLocaleDateString() : '-'}
                  </td>
                  <td>
                    <span className={`chip ${statusConfig[seller.status]?.class || 'chip-pending'}`}>
                      {statusConfig[seller.status]?.label || seller.status || 'Pending'}
                    </span>
                  </td>
                  <td>
                    {seller.status === 'pending' && (
                      <div className="btn-group">
                        <button 
                          className="btn btn-success btn-sm" 
                          onClick={() => handleApprove(seller._id || seller.id)}
                        >
                          Approve
                        </button>
                        <button 
                          className="btn btn-danger btn-sm" 
                          onClick={() => handleReject(seller._id || seller.id)}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {seller.status === 'approved' && (
                      <button 
                        className="btn btn-warning btn-sm" 
                        onClick={() => handleReject(seller._id || seller.id)}
                      >
                        Revoke
                      </button>
                    )}
                    {seller.status === 'rejected' && (
                      <button 
                        className="btn btn-success btn-sm" 
                        onClick={() => handleApprove(seller._id || seller.id)}
                      >
                        Re-approve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;