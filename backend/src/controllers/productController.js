const { query } = require('../config/db');

const getPublicProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category_id } = req.query;
    const offset = (page - 1) * limit;
    const params = [];
    let conditions = ['active = $1'];
    params.push(true);

    if (search) {
      conditions.push(`title ILIKE $${params.length + 1}`);
      params.push(`%${search}%`);
    }
    if (category_id) {
      conditions.push(`category_id = $${params.length + 1}`);
      params.push(category_id);
    }

    const whereClause = conditions.join(' AND ');

    const countResult = await query(
      `SELECT COUNT(*) FROM products WHERE ${whereClause}`,
      params
    );

    params.push(limit, offset);
    const result = await query(
      `SELECT * FROM products WHERE ${whereClause} ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    res.json({
      products: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count)
      }
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
      'SELECT * FROM products WHERE id = $1 AND active = $2',
      [id, true]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ product: result.rows[0] });
  } catch (error) {
    console.error('GetPublicProduct error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const notImplemented = (req, res) => {
  res.status(501).json({ message: 'Product endpoints require PostgreSQL controller implementation' });
};

module.exports = {
  getPublicProducts,
  getPublicProduct,
  getProducts: notImplemented,
  getProduct: notImplemented,
  createProduct: notImplemented,
  updateProduct: notImplemented,
  deleteProduct: notImplemented,
  addReview: notImplemented,
  getReviews: notImplemented,
};