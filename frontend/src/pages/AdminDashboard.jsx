import { useEffect, useState } from 'react';
import { adminAPI } from '../services/api';

function AdminDashboard() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getSellers()
      .then(res => setSellers(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Admin Dashboard</h1>
      <p>Sellers</p>
      <ul>
        {sellers.map(s => (
          <li key={s.id}>{s.name} - {s.status}</li>
        ))}
      </ul>
    </div>
  );
}

export default AdminDashboard;