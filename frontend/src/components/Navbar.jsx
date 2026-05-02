import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, LayoutDashboard, ClipboardList, LogOut, Menu, X } from 'lucide-react';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate('/login');
  };

  const closeMenu = () => setMobileOpen(false);

  return (
    <nav className="nav">
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <Link to="/" className="nav-brand" onClick={closeMenu}>Zyn<span>ta</span></Link>
        <div className="nav-links hide-mobile">
          <Link to="/products" className="nav-link">Shop</Link>
        </div>
      </div>

      {/* Desktop nav */}
      <div className="nav-user hide-mobile">
        <Link to="/cart" className="nav-link nav-cart-badge">
          <ShoppingCart size={18} /> Cart
        </Link>
        {user ? (
          <>
            {user.role === 'seller' && (
              <Link to="/seller/dashboard" className="nav-link">
                <LayoutDashboard size={16} style={{ marginRight: 4 }} /> Dashboard
              </Link>
            )}
            {user.role === 'admin' && (
              <Link to="/admin/dashboard" className="nav-link">
                <LayoutDashboard size={16} style={{ marginRight: 4 }} /> Admin
              </Link>
            )}
            <Link to="/orders" className="nav-link">
              <ClipboardList size={16} style={{ marginRight: 4 }} /> Orders
            </Link>
            <Link to="/profile" className="nav-link">
              <span className="nav-avatar">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </Link>
            <button onClick={handleLogout} className="btn btn-ghost btn-sm">
              <LogOut size={15} /> Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
          </>
        )}
      </div>

      {/* Mobile hamburger */}
      <button className="nav-hamburger show-mobile" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="nav-mobile-overlay" onClick={closeMenu}>
          <div className="nav-mobile-drawer" onClick={e => e.stopPropagation()}>
            <Link to="/products" className="nav-mobile-link" onClick={closeMenu}>Shop</Link>
            <Link to="/cart" className="nav-mobile-link" onClick={closeMenu}>
              <ShoppingCart size={16} /> Cart
            </Link>
            {user ? (
              <>
                {user.role === 'seller' && (
                  <Link to="/seller/dashboard" className="nav-mobile-link" onClick={closeMenu}>
                    <LayoutDashboard size={16} /> Dashboard
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link to="/admin/dashboard" className="nav-mobile-link" onClick={closeMenu}>
                    <LayoutDashboard size={16} /> Admin
                  </Link>
                )}
                <Link to="/orders" className="nav-mobile-link" onClick={closeMenu}>
                  <ClipboardList size={16} /> Orders
                </Link>
                <Link to="/profile" className="nav-mobile-link" onClick={closeMenu}>
                  <span className="nav-avatar" style={{ width: 24, height: 24, fontSize: '0.625rem' }}>
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                  Profile
                </Link>
                <button onClick={handleLogout} className="nav-mobile-link" style={{ border: 'none', background: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', color: 'var(--danger)' }}>
                  <LogOut size={16} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-mobile-link" onClick={closeMenu}>Login</Link>
                <Link to="/register" className="nav-mobile-link nav-mobile-cta" onClick={closeMenu}>Sign Up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;