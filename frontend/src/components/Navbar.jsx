import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) setUser(JSON.parse(userData));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <nav style={{ padding: '1rem', background: '#2563eb', color: 'white', display: 'flex', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.25rem' }}>Zynta</Link>
        <Link to="/products" style={{ color: 'white', textDecoration: 'none' }}>Products</Link>
      </div>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <Link to="/cart" style={{ color: 'white', textDecoration: 'none' }}>Cart</Link>
        {user ? (
          <>
            {user.role === 'seller' && <Link to="/seller/dashboard" style={{ color: 'white', textDecoration: 'none' }}>Seller Dashboard</Link>}
            {user.role === 'admin' && <Link to="/admin/dashboard" style={{ color: 'white', textDecoration: 'none' }}>Admin Dashboard</Link>}
            {user.role === 'customer' && <Link to="/orders" style={{ color: 'white', textDecoration: 'none' }}>Orders</Link>}
            {user.role === 'customer' && <Link to="/profile" style={{ color: 'white', textDecoration: 'none' }}>{user.name}</Link>}
            <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ color: 'white', textDecoration: 'none' }}>Login</Link>
            <Link to="/register" style={{ color: 'white', textDecoration: 'none' }}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;