import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { productsAPI, cartAPI, authAPI } from '../services/api';

const categoryIcons = {
  'Electronics': '📱',
  'Clothing': '👕',
  'Books': '📚',
  'Home': '🏠',
  'Sports': '⚽',
  'Toys': '🧸',
  'Food': '🍔',
  'Beauty': '💄'
};

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [user, setUser] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      productsAPI.getById(id),
      productsAPI.getReviews(id),
      authAPI.getProfile().catch(() => ({ data: null }))
    ])
      .then(([prodRes, revRes, userRes]) => {
        setProduct(prodRes.data);
        setReviews(revRes.data || []);
        setUser(userRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    try {
      await cartAPI.add({ productId: id, quantity });
      alert('Added to cart!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add to cart');
    }
  };

  const handleSubmitReview = async () => {
    try {
      await productsAPI.addReview(id, { rating, comment });
      productsAPI.getReviews(id).then(res => setReviews(res.data || [])).catch(console.error);
      setComment('');
      alert('Review submitted!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit review');
    }
  };

  if (loading) return <div className="container"><div className="card">Loading...</div></div>;
  if (!product) return <div className="container"><div className="card">Product not found</div></div>;

  return (
    <div className="container">
      <Link to="/products" className="btn btn-ghost" style={{ marginBottom: '1rem' }}>← Back to Products</Link>
      
      <div className="product-detail-grid">
        <div>
          <div className="product-image-large">
            {categoryIcons[product.category] || '📦'}
          </div>
        </div>
        
        <div className="product-info">
          <span className="badge">{product.category}</span>
          <h1>{product.name}</h1>
          <p className="product-category">{product.category}</p>
          
          <div className="flex items-center gap-2" style={{ marginBottom: '1rem' }}>
            <span className="product-price">₹{product.price}</span>
            {product.averageRating > 0 && (
              <span className="rating">
                ★ {product.averageRating.toFixed(1)} 
                <span style={{ color: 'var(--foreground-muted)', marginLeft: '0.25rem' }}>({reviews.length} reviews)</span>
              </span>
            )}
          </div>
          
          <p className="product-description">{product.description}</p>
          
          <p className="product-stock">
            {product.stock > 0 ? (
              <span style={{ color: 'var(--success)' }}>✓ In Stock ({product.stock} available)</span>
            ) : (
              <span style={{ color: 'var(--danger)' }}>✗ Out of Stock</span>
            )}
          </p>
          
          {product.stock > 0 && (
            <div className="flex items-center gap-3" style={{ marginTop: '1.5rem' }}>
              <div className="quantity-control">
                <button 
                  className="quantity-btn" 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  −
                </button>
                <input 
                  type="number" 
                  value={quantity} 
                  onChange={e => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                  min="1" 
                  max={product.stock}
                  style={{ width: '60px', textAlign: 'center', padding: '0.5rem' }}
                />
                <button 
                  className="quantity-btn" 
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>
              <button className="btn btn-primary btn-lg" onClick={handleAddToCart}>
                Add to Cart
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: '3rem' }}>
        <h2 className="section-title">Reviews ({reviews.length})</h2>
        
        {reviews.length > 0 ? (
          <div>
            {reviews.map((review, idx) => (
              <div key={idx} className="review-item">
                <div className="review-header">
                  <span className="review-author">{review.user?.name || 'Anonymous'}</span>
                  <span className="review-rating">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                </div>
                <p className="review-comment">{review.comment}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)', marginTop: '0.5rem' }}>
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted">No reviews yet. Be the first to review this product!</p>
        )}

        {user && (
          <div className="card mt-3">
            <h3 style={{ marginBottom: '1rem' }}>Write a Review</h3>
            <div className="form-group">
              <label>Rating</label>
              <div className="rating" style={{ fontSize: '1.25rem', cursor: 'pointer' }}>
                {[1, 2, 3, 4, 5].map(r => (
                  <span 
                    key={r} 
                    onClick={() => setRating(r)}
                    style={{ color: r <= rating ? 'var(--warning)' : 'var(--border)' }}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
            <div className="form-group">
              <textarea 
                value={comment} 
                onChange={e => setComment(e.target.value)}
                placeholder="Write your review..."
                rows={4}
              />
            </div>
            <button className="btn btn-primary" onClick={handleSubmitReview}>Submit Review</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductDetail;