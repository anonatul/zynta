import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { productsAPI, categoriesAPI } from '../services/api';

function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    productsAPI.getAll().then(res => setProducts(res.data.products)).catch(console.error);
    categoriesAPI.getAll().then(res => setCategories(res.data)).catch(console.error);
  }, []);

  return (
    <div className="container">
      <div style={{ textAlign: 'center', padding: '3rem 0' }}>
        <h1>Welcome to Zynta</h1>
        <p style={{ fontSize: '1.2rem', color: '#64748b', marginTop: '0.5rem' }}>Your one-stop shop for everything</p>
      </div>

      <h2>Categories</h2>
      <div className="grid grid-4">
        {categories.map(cat => (
          <div key={cat._id} className="card" style={{ textAlign: 'center' }}>
            <h3>{cat.name}</h3>
          </div>
        ))}
      </div>

      <h2 style={{ marginTop: '2rem' }}>Featured Products</h2>
      <div className="grid grid-4">
        {products.slice(0, 8).map(product => (
          <div key={product._id} className="card">
            <Link to={`/products/${product._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <h3>{product.name}</h3>
              <p style={{ color: '#2563eb', fontWeight: 'bold' }}>₹{product.price}</p>
              {product.averageRating > 0 && <p>Rating: {product.averageRating.toFixed(1)} ★</p>}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;