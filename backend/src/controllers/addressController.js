const { query } = require('../config/db');

const getAddresses = async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC',
      [req.user.id]
    );
    res.json({ addresses: result.rows });
  } catch (error) {
    console.error('GetAddresses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createAddress = async (req, res) => {
  try {
    const { label, street, city, state, postal_code, country, is_default } = req.body;
    if (!street || !city || !state || !postal_code || !country) {
      return res.status(400).json({ message: 'Street, city, state, postal_code, and country are required' });
    }

    if (is_default) {
      await query(
        'UPDATE addresses SET is_default = $1 WHERE user_id = $2',
        [false, req.user.id]
      );
    }

    const result = await query(
      `INSERT INTO addresses (user_id, label, street, city, state, postal_code, country, is_default)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [req.user.id, label || null, street, city, state, postal_code, country, is_default || false]
    );
    res.status(201).json({ address: result.rows[0] });
  } catch (error) {
    console.error('CreateAddress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const { label, street, city, state, postal_code, country, is_default } = req.body;

    const existing = await query(
      'SELECT * FROM addresses WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: 'Address not found' });
    }

    if (is_default) {
      await query(
        'UPDATE addresses SET is_default = $1 WHERE user_id = $2 AND id != $3',
        [false, req.user.id, id]
      );
    }

    const result = await query(
      `UPDATE addresses SET
        label = COALESCE($1, label),
        street = COALESCE($2, street),
        city = COALESCE($3, city),
        state = COALESCE($4, state),
        postal_code = COALESCE($5, postal_code),
        country = COALESCE($6, country),
        is_default = COALESCE($7, is_default)
       WHERE id = $8 AND user_id = $9 RETURNING *`,
      [label, street, city, state, postal_code, country, is_default, id, req.user.id]
    );
    res.json({ address: result.rows[0] });
  } catch (error) {
    console.error('UpdateAddress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      'DELETE FROM addresses WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Address not found' });
    }
    res.json({ message: 'Address deleted' });
  } catch (error) {
    console.error('DeleteAddress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getAddresses, createAddress, updateAddress, deleteAddress };