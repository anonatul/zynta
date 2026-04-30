import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { productsAPI, categoriesAPI } from '../services/api';

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

function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    productsAPI.getAll().then(res => setProducts(res.data.products || [])).catch(console.error);
    categoriesAPI.getAll().then(res => setCategories(res.data || [])).catch(console.error);
  }, []);

  return (
    <div className="container">
      <div className="hero">
        <h1>Welcome to Zynta</h1>
        <p>Discover amazing products at unbeatable prices</p>
        <Link to="/products" className="btn btn-lg" style={{ marginTop: '1.5rem', background: 'white', color: 'var(--primary)' }}>
          Shop Now
        </Link>
      </div>

      <h2 className="section-title">Browse Categories</h2>
      <div className="category-grid">
        {categories.length > 0 ? categories.map(cat => (
          <Link 
            key={cat._id || cat.id} 
            to={`/products?category=${encodeURIComponent(cat.name)}`}
            className="category-pill"
          >
            <span style={{ marginRight: '0.5rem' }}>{categoryIcons[cat.name] || '📦'}</span>
            {cat.name}
          </Link>
        )) : (
          <>
            <Link to="/products?category=Electronics" className="category-pill">📱 Electronics</Link>
            <Link to="/products?category=Clothing" className="category-pill">👕 Clothing</Link>
            <Link to="/products?category=Books" className="category-pill">📚 Books</Link>
            <Link to="/products?category=Home" className="category-pill">🏠 Home</Link>
            <Link to="/products?category=Sports" className="category-pill">⚽ Sports</Link>
            <Link to="/products?category=Toys" className="category-pill">🧸 Toys</Link>
          </>
        )}
      </div>

      <h2 className="section-title">Featured Products</h2>
      <div className="grid grid-4">
        {products.slice(0, 8).map(product => (
          <Link key={product._id || product.id} to={`/products/${product._id || product.id}`} className="card-product" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="card-product-image">
              {categoryIcons[product.category] || '📦'}
            </div>
            <div className="card-product-body">
              <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>{product.name}</h3>
              <div className="flex-between">
                <span className="price">₹{product.price}</span>
                {product.averageRating > 0 && (
                  <span className="rating">★ {product.averageRating.toFixed(1)}</span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {products.length === 0 && (
        <div className="empty-state">
          <h3>No products available</h3>
          <p>Check back soon for new arrivals!</p>
        </div>
      )}
    </div>
  );
}

export default Home;