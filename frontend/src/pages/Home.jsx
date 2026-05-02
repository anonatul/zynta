import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight, Sparkles, Shield, Truck, Star, TrendingUp, Users, Package,
  ShoppingBag, ChevronRight, Check, Heart, BarChart3, Zap, ShoppingCart,
  Globe, Award, CreditCard, Headphones, RotateCcw, Clock, ArrowUpRight,
  Layers, Eye, MousePointer
} from 'lucide-react';
import { productsAPI, categoriesAPI } from '../services/api';

const fadeUp = { hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } } };
const stagger = { visible: { transition: { staggerChildren: 0.08 } } };
const scaleIn = { hidden: { opacity: 0, scale: 0.92 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } } };

function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    productsAPI.getAll().then(res => setProducts(res.data.products || res.data || [])).catch(console.error);
    categoriesAPI.getAll().then(res => setCategories(res.data.categories || res.data || [])).catch(console.error);
  }, []);

  const top = products.slice(0, 8);

  return (
    <>
      {/* ━━━ HERO ━━━ */}
      <section className="hero-split">
        <div className="hero-mesh-bg" />
        <div className="hero-glow" />
        <div className="hero-grid-dots" />

        <div className="container hero-split-inner">
          {/* Left — Text */}
          <motion.div className="hero-left" initial="hidden" animate="visible" variants={stagger}>
            <motion.div className="pill-badge" variants={fadeUp}>
              <Sparkles size={14} /> New Season Collection
            </motion.div>
            <motion.h1 className="hero-heading-split" variants={fadeUp}>
              Shop the future,<br /><span className="text-gradient">delivered today</span>
            </motion.h1>
            <motion.p className="hero-sub-split" variants={fadeUp}>
              Premium marketplace connecting you with verified sellers. Curated products, transparent pricing, and seamless checkout.
            </motion.p>
            <motion.div className="hero-actions" variants={fadeUp}>
              <Link to="/products" className="btn btn-primary btn-lg">
                Explore Collection <ArrowRight size={16} />
              </Link>
              <Link to="/register" className="btn btn-ghost btn-lg">
                Create Account <ChevronRight size={16} />
              </Link>
            </motion.div>
            <motion.div className="hero-mini-stats" variants={fadeUp}>
              {[
                { num: '50K+', label: 'Products', icon: Package },
                { num: '2K+', label: 'Sellers', icon: Users },
                { num: '99.8%', label: 'Satisfaction', icon: Award }
              ].map((s, i) => (
                <div key={i} className="hero-mini-stat">
                  <s.icon size={14} className="hms-icon" />
                  <span className="hms-num">{s.num}</span>
                  <span className="hms-label">{s.label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right — Creative showcase */}
          <motion.div className="hero-right" initial={{ opacity: 0, y: 40, rotateY: -5 }} animate={{ opacity: 1, y: 0, rotateY: 0 }} transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}>
            
            {/* Live notification */}
            <motion.div className="live-notif" animate={{ y: [0, -6, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
              <div className="ln-dot" />
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&q=80" alt="" className="ln-avatar" />
              <div>
                <div className="ln-text">Sarah just purchased</div>
                <div className="ln-item"><TrendingUp size={10} style={{ display: 'inline', marginRight: 3 }} />Nike Air Max 90</div>
              </div>
            </motion.div>

            <div className="showcase-card-v2">
              {/* Tabs */}
              <div className="sc2-tabs">
                <span className="sc2-tab active">Trending</span>
                <span className="sc2-tab">New</span>
                <span className="sc2-tab">Popular</span>
                <span className="sc2-badge"><TrendingUp size={10} /> +23%</span>
              </div>

              {/* Bento grid */}
              <div className="sc2-bento">
                <div className="sc2-featured">
                  <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=500&fit=crop&q=80" alt="" />
                  <div className="sc2-label">
                    <span className="sc2-name">Nike Air Max</span>
                    <span className="sc2-price">₹8,999</span>
                  </div>
                </div>
                <div className="sc2-stack">
                  <div className="sc2-small sc2-bg-lavender">
                    <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop&q=80" alt="" />
                    <span className="sc2-tag">Watches</span>
                  </div>
                  <div className="sc2-small sc2-bg-peach">
                    <img src="https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=300&h=300&fit=crop&q=80" alt="" />
                    <span className="sc2-tag">Eyewear</span>
                  </div>
                </div>
              </div>

              {/* Mini chart row */}
              <div className="sc2-chart-row">
                <div className="sc2-chart-info">
                  <span className="sc2-chart-label">Weekly Sales</span>
                  <span className="sc2-chart-val">₹2.4L</span>
                </div>
                <div className="sc2-mini-bars">
                  {[40, 65, 45, 80, 55, 90, 72].map((h, i) => (
                    <div key={i} className="sc2-bar" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="sc-footer">
                <div className="sc-avatars">
                  {[1,2,3,4].map(n => <div key={n} className="sc-avatar" style={{ background: `hsl(${250 + n*25}, 55%, ${60 + n*5}%)` }} />)}
                </div>
                <span className="sc-footer-text">+2.4k active buyers</span>
              </div>
            </div>

            {/* Bottom floating card — icon instead of emoji */}
            <motion.div className="float-accent-card" animate={{ y: [0, -8, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}>
              <div className="fac-icon-wrap"><ShoppingCart size={18} /></div>
              <div>
                <div className="fac-title">48 items added</div>
                <div className="fac-sub">in the last hour</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ━━━ TRUST BAR ━━━ */}
      <motion.section className="trust-section" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
        <div className="container">
          <p className="trust-label">Trusted by leading brands worldwide</p>
          <div className="trust-logos">
            {[
              { name: 'TechStore', icon: Zap },
              { name: 'UrbanCart', icon: ShoppingBag },
              { name: 'ShopEase', icon: Globe },
              { name: 'StyleHub', icon: Layers },
              { name: 'BuyBright', icon: Award }
            ].map((brand, i) => (
              <motion.span key={i} variants={fadeUp} className="trust-logo">
                <brand.icon size={16} className="trust-icon" /> {brand.name}
              </motion.span>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ━━━ VALUE PROPS ━━━ */}
      <section className="container" style={{ paddingTop: '4rem', paddingBottom: '1rem' }}>
        <motion.div className="value-strip" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
          {[
            { icon: Truck, title: 'Free Delivery', desc: 'On orders above ₹999' },
            { icon: Shield, title: 'Secure Checkout', desc: '256-bit SSL encryption' },
            { icon: RotateCcw, title: 'Easy Returns', desc: '7-day return policy' },
            { icon: Headphones, title: '24/7 Support', desc: 'Always here for you' }
          ].map((v, i) => (
            <motion.div key={i} className="value-item" variants={fadeUp}>
              <div className="value-icon"><v.icon size={20} /></div>
              <div>
                <div className="value-title">{v.title}</div>
                <div className="value-desc">{v.desc}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ━━━ HOW IT WORKS ━━━ */}
      <section className="container" style={{ paddingTop: '4rem', paddingBottom: '2rem' }}>
        <motion.div className="section-header" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
          <div className="pill-badge" style={{ margin: '0 auto 0.75rem' }}><Layers size={14} /> Simple Process</div>
          <h2>How it <span className="text-gradient">works</span></h2>
          <p style={{ color: 'var(--fg-muted)', maxWidth: 500, margin: '1rem auto 0' }}>Three simple steps to start shopping with the best deals.</p>
        </motion.div>

        <motion.div className="workflow-grid" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
          {/* Card 1 */}
          <motion.div className="workflow-card" variants={fadeUp} whileHover={{ y: -6, transition: { duration: 0.2 } }}>
            <div className="workflow-step">01</div>
            <div className="workflow-icon"><Users size={22} color="var(--primary)" /></div>
            <h3>Create Your Account</h3>
            <p>Sign up in seconds. Join thousands of smart shoppers already saving big.</p>
            <div className="workflow-mini-stat">
              <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--fg-muted)', display: 'flex', alignItems: 'center', gap: 4 }}><BarChart3 size={12} /> Active Users</div>
                  <div style={{ fontFamily: 'Sora, Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1.75rem', letterSpacing: '-0.02em' }}>10K+</div>
                </div>
                <div style={{ display: 'flex' }}>
                  {[1,2,3].map(n => <div key={n} style={{ width: 28, height: 28, borderRadius: '50%', background: `hsl(${260 + n*20}, 60%, ${65 + n*5}%)`, border: '2px solid #fff', marginLeft: n > 1 ? -8 : 0 }} />)}
                </div>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}><TrendingUp size={12} /> +12% this month</div>
            </div>
          </motion.div>

          {/* Card 2 */}
          <motion.div className="workflow-card" variants={fadeUp} whileHover={{ y: -6, transition: { duration: 0.2 } }}>
            <div className="workflow-step">02</div>
            <div className="workflow-icon"><Package size={22} color="var(--primary)" /></div>
            <h3>Browse Curated Products</h3>
            <p>Explore thousands of products from verified sellers with genuine reviews.</p>
            <div className="workflow-mini-stat">
              <div style={{ fontSize: '0.6875rem', color: 'var(--fg-muted)', display: 'flex', alignItems: 'center', gap: 4, marginBottom: '0.625rem' }}><Package size={12} /> Top Categories</div>
              {[
                { name: 'Electronics', pct: 78, color: 'var(--primary)' },
                { name: 'Fashion', pct: 62, color: '#a78bfa' },
                { name: 'Home & Living', pct: 45, color: '#c4b5fd' },
              ].map((c, i) => (
                <div key={i} style={{ marginBottom: '0.375rem' }}>
                  <div className="flex-between" style={{ fontSize: '0.75rem', marginBottom: 3 }}>
                    <span style={{ fontWeight: 500 }}>{c.name}</span><span style={{ color: 'var(--fg-muted)' }}>{c.pct}%</span>
                  </div>
                  <div style={{ height: 4, background: 'var(--border-light)', borderRadius: 2 }}>
                    <div style={{ height: '100%', width: `${c.pct}%`, background: c.color, borderRadius: 2 }} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Card 3 */}
          <motion.div className="workflow-card" variants={fadeUp} whileHover={{ y: -6, transition: { duration: 0.2 } }}>
            <div className="workflow-step">03</div>
            <div className="workflow-icon"><CreditCard size={22} color="var(--primary)" /></div>
            <h3>Secure Checkout</h3>
            <p>Pay safely with encrypted transactions and track orders in real-time.</p>
            <div className="workflow-mini-stat">
              <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--fg-muted)', display: 'flex', alignItems: 'center', gap: 4 }}><Shield size={12} /> Success Rate</div>
                  <div style={{ fontFamily: 'Sora, Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1.75rem', letterSpacing: '-0.02em' }}>99.8%</div>
                </div>
                <div style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid var(--primary-light)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="48" height="48" viewBox="0 0 48 48" style={{ position: 'absolute', top: -3, left: -3, transform: 'rotate(-90deg)' }}>
                    <circle cx="24" cy="24" r="21" fill="none" stroke="var(--primary)" strokeWidth="3" strokeDasharray={`${0.998 * 132} 132`} strokeLinecap="round" />
                  </svg>
                  <Check size={16} color="var(--primary)" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem' }}>
                <span style={{ color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}><ArrowUpRight size={12} /> 2.4%</span>
                <span style={{ color: 'var(--fg-muted)' }}>vs last month</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ━━━ PRODUCTS ━━━ */}
      <section className="container" style={{ paddingTop: '3rem', paddingBottom: '2rem' }}>
        <div className="flex-between mb-3">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <p className="section-subtitle">Featured Selection</p>
            <h2 className="section-title" style={{ marginBottom: 0 }}>Popular Products</h2>
          </motion.div>
          <Link to="/products" className="btn btn-outline-primary btn-sm">View All <ChevronRight size={14} /></Link>
        </div>
        {top.length > 0 ? (
          <motion.div className="product-grid" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            {top.map(product => (
              <motion.div key={product.id} variants={fadeUp} whileHover={{ y: -6 }}>
                <Link to={`/products/${product.id}`} className="card-product">
                  <div className="card-product-image">
                    {product.image_url
                      ? <img src={product.image_url} alt={product.title || product.name} />
                      : <Package size={40} color="var(--accent)" />}
                  </div>
                  <div className="card-product-body">
                    <span className="badge" style={{ alignSelf: 'flex-start' }}>{product.category || 'General'}</span>
                    <h3 style={{ fontSize: '0.9375rem', fontWeight: 600 }}>{product.title || product.name}</h3>
                    <div className="flex-between" style={{ marginTop: 'auto' }}>
                      <span className="price">₹{Number(product.price).toLocaleString()}</span>
                      <span className="product-card-rating">
                        <Star size={12} fill="#f59e0b" stroke="#f59e0b" />
                        {Number(product.average_rating || 0).toFixed(1)}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="empty-state"><Package size={48} strokeWidth={1.5} /><h3>No products yet</h3><p>Check back soon!</p></div>
        )}
      </section>

      {/* ━━━ CATEGORIES SHOWCASE ━━━ */}
      {categories.length > 0 && (
        <section className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <p className="section-subtitle">Browse by Category</p>
            <h2 className="section-title">Shop What You Love</h2>
          </motion.div>
          <motion.div className="cat-showcase-grid" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            {categories.slice(0, 8).map((cat, i) => {
              const icons = [Zap, ShoppingBag, Package, Layers, Award, Heart, Star, Globe];
              const CatIcon = icons[i % icons.length];
              return (
                <motion.div key={cat.id} variants={scaleIn}>
                  <Link to={`/products?category=${cat.name}`} className="cat-card">
                    <div className="cat-card-icon"><CatIcon size={24} /></div>
                    <span className="cat-card-name">{cat.name}</span>
                    <ArrowRight size={14} className="cat-card-arrow" />
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </section>
      )}

      {/* ━━━ CTA ━━━ */}
      <div className="container" style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
        <motion.div className="cta-section" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="cta-icon-row">
            <ShoppingBag size={20} /> <Heart size={20} /> <Star size={20} />
          </div>
          <h2>Ready to Start Shopping?</h2>
          <p>Join thousands of smart shoppers. Get exclusive deals, fast delivery, and hassle-free returns.</p>
          <div className="cta-actions">
            <Link to="/register" className="btn cta-btn-white">
              Get Started Free <ArrowRight size={16} />
            </Link>
            <Link to="/products" className="btn cta-btn-outline">
              Browse Products <Eye size={16} />
            </Link>
          </div>
        </motion.div>
      </div>

      {/* ━━━ FOOTER ━━━ */}
      <footer className="site-footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <h3 className="footer-brand">Zyn<span>ta</span></h3>
              <p className="text-muted" style={{ fontSize: '0.875rem', maxWidth: 260, lineHeight: 1.7 }}>Premium e-commerce platform. Quality products from verified sellers worldwide.</p>
              <div className="footer-trust-row">
                <Shield size={14} /> <span>SSL Secured</span>
                <Award size={14} /> <span>Verified Sellers</span>
              </div>
            </div>
            <div>
              <h4 className="footer-heading">Company</h4>
              <a href="#" className="footer-link">About Us</a>
              <a href="#" className="footer-link">Blog</a>
              <a href="#" className="footer-link">Careers</a>
              <a href="#" className="footer-link">Contact</a>
            </div>
            <div>
              <h4 className="footer-heading">Support</h4>
              <a href="#" className="footer-link">Help Center</a>
              <a href="#" className="footer-link">Shipping Info</a>
              <a href="#" className="footer-link">Returns</a>
              <a href="#" className="footer-link">FAQ</a>
            </div>
            <div>
              <h4 className="footer-heading">Connect</h4>
              <div className="footer-social-row">
                {[
                  { icon: Globe, label: 'Website' },
                  { icon: Users, label: 'Community' },
                  { icon: Heart, label: 'Instagram' },
                  { icon: Zap, label: 'Twitter' }
                ].map((s, i) => (
                  <a key={i} href="#" className="footer-social-btn" aria-label={s.label}>
                    <s.icon size={16} />
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2026 Zynta. All Rights Reserved.</span>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <a href="#" className="footer-link">Terms of Service</a>
              <a href="#" className="footer-link">Privacy Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

export default Home;