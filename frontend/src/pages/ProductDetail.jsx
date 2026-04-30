import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { productsAPI, cartAPI, authAPI } from '../services/api';

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [user, setUser] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    productsAPI.getById(id).then(res => setProduct(res.data)).catch(console.error);
    productsAPI.getReviews(id).then(res => setReviews(res.data)).catch(console.error);
    authAPI.getProfile().then(res => setUser(res.data)).catch(() => {});
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
      productsAPI.getReviews(id).then(res => setReviews(res.data)).catch(console.error);
      setComment('');
      alert('Review submitted!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit review');
    }
  };

  if (!product) return <div className="container">Loading...</div>;

  return (
    <div className="container">
      <Link to="/products">← Back to Products</Link>
      
      <div className="grid grid-2" style={{ marginTop: '1rem' }}>
        <div>
          <h1>{product.name}</h1>
          <p style={{ color: '#64748b' }}>{product.category}</p>
          <p style={{ fontSize: '2rem', color: '#2563eb', fontWeight: 'bold' }}>₹{product.price}</p>
          <p>{product.description}</p>
          <p>Stock: {product.stock}</p>
          {product.averageRating > 0 && <p>Rating: {product.averageRating.toFixed(1)} ★</p>}
          
          <div style={{ marginTop: '1rem' }}>
            <input 
              type="number" 
              value={quantity} 
              onChange={e => setQuantity(parseInt(e.target.value))}
              min="1" 
              max={product.stock}
              style={{ width: '80px', marginRight: '1rem' }}
            />
            <button className="btn btn-primary" onClick={handleAddToCart}>Add to Cart</button>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h2>Reviews</h2>
        {reviews.map((review, idx) => (
          <div key={idx} className="card">
            <p><strong>{review.user?.name || 'Anonymous'}</strong> - {'★'.repeat(review.rating)}</p>
            <p>{review.comment}</p>
          </div>
        ))}

        {user && (
          <div className="card">
            <h3>Write a Review</h3>
            <select value={rating} onChange={e => setRating(parseInt(e.target.value))}>
              {[1,2,3,4,5].map(r => <option key={r} value={r}>{r} ★</option>)}
            </select>
            <textarea 
              value={comment} 
              onChange={e => setComment(e.target.value)}
              placeholder="Write your review..."
              style={{ marginTop: '0.5rem' }}
            />
            <button className="btn btn-primary" onClick={handleSubmitReview} style={{ marginTop: '0.5rem' }}>Submit Review</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductDetail;