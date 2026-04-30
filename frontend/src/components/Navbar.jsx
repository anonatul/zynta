import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

function Navbar() {
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    const updateCartCount = () => {
      const cartData = localStorage.getItem('cart');
      if (cartData) {
        try {
          const cart = JSON.parse(cartData);
          setCartCount(cart.items?.length || 0);
        } catch {}
      }
    };
    updateCartCount();
    window.addEventListener('storage', updateCartCount);
    return () => window.removeEventListener('storage', updateCartCount);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    setUser(null);
    navigate('/login');
  };

  return (
    <nav className="nav">
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <Link to="/" className="nav-brand">Zynta</Link>
        <div className="nav-links">
          <Link to="/products" className="nav-link">Products</Link>
        </div>
      </div>
      <div className="nav-user">
        <Link to="/cart" className="nav-link" style={{ position: 'relative' }}>
          <span>Cart</span>
          {cartCount > 0 && (
            <span style={{ 
              position: 'absolute', 
              top: '-8px', 
              right: '-12px', 
              background: 'var(--danger)', 
              color: 'white', 
              borderRadius: '50%', 
              width: '18px', 
              height: '18px', 
              fontSize: '0.6875rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {cartCount}
            </span>
          )}
        </Link>
        {user ? (
          <>
            {user.role === 'seller' && (
              <Link to="/seller/dashboard" className="nav-link">Dashboard</Link>
            )}
            {user.role === 'admin' && (
              <Link to="/admin/dashboard" className="nav-link">Admin</Link>
            )}
            {user.role === 'customer' && (
              <>
                <Link to="/orders" className="nav-link">Orders</Link>
                <Link to="/profile" className="nav-link">{user.name}</Link>
              </>
            )}
            <button 
              onClick={handleLogout} 
              className="btn btn-ghost btn-sm"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;