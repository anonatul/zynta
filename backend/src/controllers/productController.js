const { query } = require('../config/db');

const getPublicProducts = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, category } = req.query;
    const offset = (page - 1) * limit;
    const params = [];
    let conditions = ['p.status = $1'];
    params.push('active');

    if (search) {
      conditions.push(`p.title ILIKE $${params.length + 1}`);
      params.push(`%${search}%`);
    }
    if (category) {
      conditions.push(`c.name = $${params.length + 1}`);
      params.push(category);
    }

    const whereClause = conditions.join(' AND ');

    const countResult = await query(
      `SELECT COUNT(*) FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE ${whereClause}`,
      params
    );

    params.push(limit, offset);
    const result = await query(
      `SELECT p.*, c.name as category,
        COALESCE((SELECT ROUND(AVG(r.rating),1) FROM reviews r WHERE r.product_id = p.id), 0) as average_rating,
        COALESCE((SELECT COUNT(*) FROM reviews r WHERE r.product_id = p.id), 0) as review_count
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE ${whereClause}
       ORDER BY p.created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    res.json({
      products: result.rows,
      pagination: { page: parseInt(page), limit: parseInt(limit), total: parseInt(countResult.rows[0].count) }
    });
  } catch (error) {
    console.error('GetPublicProducts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getPublicProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT p.*, c.name as category,
        COALESCE((SELECT ROUND(AVG(r.rating),1) FROM reviews r WHERE r.product_id = p.id), 0) as average_rating
       FROM products p LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = $1 AND p.status = $2`,
      [id, 'active']
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Product not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('GetPublicProduct error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getReviews = async (req, res) => {
  try {
    const result = await query(
      `SELECT r.*, u.name as user_name FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.product_id = $1 ORDER BY r.created_at DESC`,
      [req.params.id]
    );
    res.json(result.rows.map(r => ({ ...r, user: { name: r.user_name } })));
  } catch (error) {
    console.error('GetReviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const result = await query(
      `INSERT INTO reviews (product_id, user_id, rating, comment) VALUES ($1, $2, $3, $4)
       ON CONFLICT (product_id, user_id) DO UPDATE SET rating = $3, comment = $4, updated_at = NOW()
       RETURNING *`,
      [req.params.id, req.user.id, rating, comment]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('AddReview error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getPublicProducts, getPublicProduct, getReviews, addReview };