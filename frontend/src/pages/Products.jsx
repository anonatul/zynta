import { Link, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { productsAPI, categoriesAPI } from '../services/api';

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');

  useEffect(() => {
    const params = {};
    if (search) params.search = search;
    if (category) params.category = category;
    productsAPI.getAll(params).then(res => setProducts(res.data.products)).catch(console.error);
    categoriesAPI.getAll().then(res => setCategories(res.data)).catch(console.error);
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    setSearchParams(params);
    productsAPI.getAll(Object.fromEntries(params)).then(res => setProducts(res.data.products)).catch(console.error);
  };

  return (
    <div className="container">
      <h1>Products</h1>
      
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <input 
          type="text" 
          placeholder="Search products..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select value={category} onChange={e => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat._id} value={cat.name}>{cat.name}</option>
          ))}
        </select>
        <button className="btn btn-primary" onClick={handleSearch}>Search</button>
      </div>

      <div className="grid grid-3">
        {products.map(product => (
          <div key={product._id} className="card">
            <Link to={`/products/${product._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <h3>{product.name}</h3>
              <p>{product.description}</p>
              <p style={{ color: '#2563eb', fontWeight: 'bold', fontSize: '1.2rem' }}>₹{product.price}</p>
              {product.averageRating > 0 && <p>★ {product.averageRating.toFixed(1)}</p>}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Products;