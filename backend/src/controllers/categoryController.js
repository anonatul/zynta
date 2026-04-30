const { query } = require('../config/db');

const getCategories = async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM categories ORDER BY name ASC'
    );
    res.json({ categories: result.rows });
  } catch (error) {
    console.error('GetCategories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }
    const result = await query(
      'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *',
      [name, description || null]
    );
    res.status(201).json({ category: result.rows[0] });
  } catch (error) {
    console.error('CreateCategory error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getCategories, createCategory };