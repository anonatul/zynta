const { query } = require('../config/db');

const getSellerProducts = async (req, res) => {
  try {
    const result = await query(
      `SELECT * FROM products WHERE seller_id = $1 ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json({ products: result.rows });
  } catch (error) {
    console.error('GetSellerProducts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createSellerProduct = async (req, res) => {
  try {
    const { title, description, price, category_id, stock_quantity, image_url } = req.body;
    if (!title || !price) {
      return res.status(400).json({ message: 'Title and price are required' });
    }
    const result = await query(
      `INSERT INTO products (seller_id, title, description, price, category_id, stock_quantity, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [req.user.id, title, description, price, category_id, stock_quantity || 0, image_url]
    );
    res.status(201).json({ product: result.rows[0] });
  } catch (error) {
    console.error('CreateSellerProduct error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateSellerProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, category_id, stock_quantity, image_url, status } = req.body;
    const result = await query(
      `UPDATE products 
       SET title = COALESCE($1, title), description = COALESCE($2, description),
           price = COALESCE($3, price), category_id = COALESCE($4, category_id),
           stock_quantity = COALESCE($5, stock_quantity), image_url = COALESCE($6, image_url),
           status = COALESCE($7, status), updated_at = NOW()
       WHERE id = $8 AND seller_id = $9
       RETURNING *`,
      [title, description, price, category_id, stock_quantity, image_url, status, id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ product: result.rows[0] });
  } catch (error) {
    console.error('UpdateSellerProduct error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteSellerProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      `DELETE FROM products WHERE id = $1 AND seller_id = $2 RETURNING id`,
      [id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted' });
  } catch (error) {
    console.error('DeleteSellerProduct error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getSellerProducts, createSellerProduct, updateSellerProduct, deleteSellerProduct };