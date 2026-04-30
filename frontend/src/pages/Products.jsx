import { Link, useSearchParams } from 'react-router-dom';
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
    productsAPI.getAll(params).then(res => setProducts(res.data.products || [])).catch(console.error);
    categoriesAPI.getAll().then(res => setCategories(res.data || [])).catch(console.error);
  }, [search, category]);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    setSearchParams(params);
  };

  const handleCategoryChange = (catName) => {
    setCategory(catName === category ? '' : catName);
  };

  return (
    <div className="container">
      <h1 className="section-title">All Products</h1>

      <div className="search-bar">
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', flex: 1, flexWrap: 'wrap' }}>
          <input 
            type="text" 
            placeholder="Search products..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: '200px' }}
          />
          <button type="submit" className="btn btn-primary">Search</button>
        </form>
      </div>

      <div className="category-grid" style={{ marginBottom: '2rem' }}>
        <button 
          className={`category-pill ${!category ? 'active' : ''}`}
          onClick={() => setCategory('')}
          style={{ borderColor: !category ? 'var(--primary)' : 'var(--border)', background: !category ? 'var(--primary-light)' : 'var(--surface)' }}
        >
          All
        </button>
        {categories.map(cat => (
          <button
            key={cat._id || cat.id}
            className={`category-pill ${category === cat.name ? 'active' : ''}`}
            onClick={() => handleCategoryChange(cat.name)}
            style={{ borderColor: category === cat.name ? 'var(--primary)' : 'var(--border)', background: category === cat.name ? 'var(--primary-light)' : 'var(--surface)' }}
          >
            <span style={{ marginRight: '0.5rem' }}>{categoryIcons[cat.name] || '📦'}</span>
            {cat.name}
          </button>
        ))}
      </div>

      {products.length > 0 ? (
        <div className="grid grid-4">
          {products.map(product => (
            <Link key={product._id || product.id} to={`/products/${product._id || product.id}`} className="card-product" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="card-product-image">
                {categoryIcons[product.category] || '📦'}
              </div>
              <div className="card-product-body">
                <span className="badge" style={{ marginBottom: '0.5rem' }}>{product.category}</span>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>{product.name}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--foreground-muted)', marginBottom: '0.5rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {product.description}
                </p>
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
      ) : (
        <div className="empty-state">
          <h3>No products found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}

export default Products;