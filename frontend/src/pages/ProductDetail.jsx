import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Star, ShoppingCart, Package, Check, X, Minus, Plus, Shield, Truck, RotateCcw, Heart, Share2, ChevronRight } from 'lucide-react';
import { productsAPI, cartAPI, authAPI } from '../services/api';
import { useToast } from '../components/Toast';

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [user, setUser] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [liked, setLiked] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    Promise.all([
      productsAPI.getById(id),
      productsAPI.getReviews(id),
      authAPI.getProfile().catch(() => ({ data: null }))
    ]).then(([p, r, u]) => {
      setProduct(p.data);
      setReviews(r.data || []);
      // Profile returns { user: {...} } — extract the inner user
      const userData = u.data?.user || u.data;
      setUser(userData);
    }).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    setAddingToCart(true);
    try {
      await cartAPI.add({ product_id: id, quantity });
      toast('Added to cart!', 'success');
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to add', 'error');
    } finally {
      setTimeout(() => setAddingToCart(false), 600);
    }
  };

  const handleReview = async () => {
    try {
      await productsAPI.addReview(id, { rating, comment });
      productsAPI.getReviews(id).then(r => setReviews(r.data || []));
      setComment('');
      toast('Review submitted!', 'success');
    } catch (err) {
      toast(err.response?.data?.message || 'Failed', 'error');
    }
  };

  if (loading) return (
    <div className="pdp-page">
      <div className="container">
        <div className="pdp-skeleton">
          <div className="pdp-skel-img skeleton-img" />
          <div className="pdp-skel-info">
            <div className="skeleton-line w40" style={{ height: 14 }} />
            <div className="skeleton-line w80" style={{ height: 28, marginTop: 12 }} />
            <div className="skeleton-line w60" style={{ height: 20, marginTop: 16 }} />
            <div className="skeleton-line w80" style={{ height: 12, marginTop: 24 }} />
            <div className="skeleton-line w60" style={{ height: 12, marginTop: 8 }} />
          </div>
        </div>
      </div>
    </div>
  );

  if (!product) return (
    <div className="container">
      <div className="shop-empty">
        <Package size={52} strokeWidth={1.2} color="var(--fg-light)" />
        <h3>Product not found</h3>
        <Link to="/products" className="btn btn-primary">Back to Shop</Link>
      </div>
    </div>
  );

  const stock = product.stock_quantity ?? product.stock ?? 0;
  const name = product.title || product.name;
  const avgRating = Number(product.averageRating || product.average_rating || 0);

  return (
    <div className="pdp-page">
      <div className="container">

        {/* Breadcrumb */}
        <motion.nav className="pdp-breadcrumb" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Link to="/">Home</Link>
          <ChevronRight size={14} />
          <Link to="/products">Shop</Link>
          <ChevronRight size={14} />
          {product.category && <><Link to={`/products?category=${product.category}`}>{product.category}</Link><ChevronRight size={14} /></>}
          <span>{name}</span>
        </motion.nav>

        {/* Main grid */}
        <div className="pdp-grid">

          {/* Left — Image */}
          <motion.div className="pdp-image-col" initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.5 }}>
            <div className="pdp-image-wrapper">
              {product.image_url ? (
                <motion.img
                  src={product.image_url}
                  alt={name}
                  className="pdp-main-img"
                  initial={{ scale: 1.08, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              ) : <Package size={80} color="var(--fg-light)" />}
              <button className={`pdp-wishlist-btn ${liked ? 'liked' : ''}`} onClick={() => setLiked(!liked)}>
                <Heart size={18} fill={liked ? '#ef4444' : 'none'} stroke={liked ? '#ef4444' : 'currentColor'} />
              </button>
            </div>
          </motion.div>

          {/* Right — Info */}
          <motion.div className="pdp-info-col" initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.5, delay: 0.15 }}>

            <div className="pdp-category-badge">{product.category || 'General'}</div>
            <h1 className="pdp-title">{name}</h1>

            {/* Rating row */}
            <div className="pdp-rating-row">
              <div className="pdp-stars">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} size={16} fill={s <= Math.round(avgRating) ? '#f59e0b' : 'none'} stroke={s <= Math.round(avgRating) ? '#f59e0b' : '#d1d5db'} />
                ))}
              </div>
              {avgRating > 0 && <span className="pdp-rating-num">{avgRating.toFixed(1)}</span>}
              <span className="pdp-review-count">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
            </div>

            {/* Price */}
            <div className="pdp-price-row">
              <span className="pdp-price">₹{Number(product.price).toLocaleString()}</span>
              <span className="pdp-tax-note">Inclusive of all taxes</span>
            </div>

            {/* Description */}
            <p className="pdp-description">{product.description}</p>

            {/* Stock */}
            <div className="pdp-stock-badge">
              {stock > 0 ? (
                <span className="pdp-in-stock"><Check size={15} /> In Stock <span className="pdp-stock-qty">({stock} available)</span></span>
              ) : (
                <span className="pdp-out-stock"><X size={15} /> Out of Stock</span>
              )}
            </div>

            {/* Add to cart */}
            {stock > 0 && (
              <motion.div className="pdp-cart-row" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <div className="pdp-qty">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus size={16} /></button>
                  <input type="number" value={quantity} onChange={e => setQuantity(Math.max(1, Math.min(stock, parseInt(e.target.value) || 1)))} min="1" max={stock} />
                  <button onClick={() => setQuantity(Math.min(stock, quantity + 1))}><Plus size={16} /></button>
                </div>
                <button className={`pdp-add-btn ${addingToCart ? 'adding' : ''}`} onClick={handleAddToCart} disabled={addingToCart}>
                  <ShoppingCart size={18} />
                  {addingToCart ? 'Added ✓' : 'Add to Cart'}
                </button>
              </motion.div>
            )}

            {/* Trust badges */}
            <div className="pdp-trust">
              <div className="pdp-trust-item"><Truck size={18} /> <span>Free delivery on ₹999+</span></div>
              <div className="pdp-trust-item"><RotateCcw size={18} /> <span>7-day returns</span></div>
              <div className="pdp-trust-item"><Shield size={18} /> <span>Genuine product</span></div>
            </div>
          </motion.div>
        </div>

        {/* Reviews section */}
        <motion.div className="pdp-reviews" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <h2 className="pdp-section-title">Customer Reviews <span className="pdp-review-badge">{reviews.length}</span></h2>

          {reviews.length > 0 ? (
            <div className="pdp-review-list">
              {reviews.map((r, i) => (
                <motion.div key={i} className="pdp-review-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}>
                  <div className="pdp-review-top">
                    <div className="pdp-review-avatar">{(r.user?.name || 'A')[0].toUpperCase()}</div>
                    <div>
                      <div className="pdp-review-name">{r.user?.name || 'Anonymous'}</div>
                      <div className="pdp-review-stars">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} size={12} fill={s <= r.rating ? '#f59e0b' : 'none'} stroke={s <= r.rating ? '#f59e0b' : '#d1d5db'} />
                        ))}
                      </div>
                    </div>
                  </div>
                  {r.comment && <p className="pdp-review-text">{r.comment}</p>}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="pdp-no-reviews">
              <Star size={28} strokeWidth={1.2} color="var(--fg-light)" />
              <p>No reviews yet. Be the first to share your experience!</p>
            </div>
          )}

          {user && (
            <div className="pdp-write-review">
              <h3>Write a Review</h3>
              <div className="pdp-review-form">
                <div className="pdp-star-select">
                  {[1,2,3,4,5].map(r => (
                    <Star key={r} size={24} onClick={() => setRating(r)} fill={r <= rating ? '#f59e0b' : 'none'} stroke={r <= rating ? '#f59e0b' : '#d1d5db'} style={{ cursor: 'pointer', transition: 'transform 0.15s' }} onMouseEnter={e => e.target.style.transform='scale(1.2)'} onMouseLeave={e => e.target.style.transform='scale(1)'} />
                  ))}
                </div>
                <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Share your experience with this product..." rows={3} />
                <button className="btn btn-primary" onClick={handleReview}>Submit Review</button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default ProductDetail;