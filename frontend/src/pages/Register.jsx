import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, ShoppingBag, Store, Info } from 'lucide-react';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('buyer');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.register({ name, email, password, role });
      login(res.data);
      if (role === 'seller') {
        toast('Account created! Your seller account is pending approval.', 'info');
      } else {
        toast('Account created successfully!', 'success');
      }
      navigate('/');
    } catch (err) {
      toast(err.response?.data?.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div className="auth-container" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: '0.75rem' }}><div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}><UserPlus size={24} color="var(--primary)" /></div></div>
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Join Zynta and start shopping</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="Min 6 characters" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
          </div>
          <div className="form-group">
            <label>Account Type</label>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <label style={{
                flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.75rem 1rem', border: `2px solid ${role === 'buyer' ? 'var(--primary)' : 'var(--border-light)'}`,
                borderRadius: 'var(--radius)', cursor: 'pointer', transition: 'var(--transition)',
                background: role === 'buyer' ? 'var(--primary-soft)' : 'transparent'
              }}>
                <input type="radio" name="role" value="buyer" checked={role === 'buyer'} onChange={() => setRole('buyer')} style={{ width: 'auto' }} />
                <div><strong style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 6 }}><ShoppingBag size={15} /> Buyer</strong><p style={{ fontSize: '0.75rem', color: 'var(--fg-muted)', margin: 0 }}>Browse & purchase products</p></div>
              </label>
              <label style={{
                flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.75rem 1rem', border: `2px solid ${role === 'seller' ? 'var(--primary)' : 'var(--border-light)'}`,
                borderRadius: 'var(--radius)', cursor: 'pointer', transition: 'var(--transition)',
                background: role === 'seller' ? 'var(--primary-soft)' : 'transparent'
              }}>
                <input type="radio" name="role" value="seller" checked={role === 'seller'} onChange={() => setRole('seller')} style={{ width: 'auto' }} />
                <div><strong style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 6 }}><Store size={15} /> Seller</strong><p style={{ fontSize: '0.75rem', color: 'var(--fg-muted)', margin: 0 }}>List & sell your products</p></div>
              </label>
            </div>
          </div>
          {role === 'seller' && (
            <div style={{ background: 'var(--surface-alt)', borderRadius: 'var(--radius)', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.8125rem', color: 'var(--fg-muted)' }}>
              <Info size={14} style={{ flexShrink: 0, marginRight: 4 }} /> Seller accounts require admin approval before you can list products.
            </div>
          )}
          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>
        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </motion.div>
  );
}

export default Register;