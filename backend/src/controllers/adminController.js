const { query } = require('../config/db');

const getPendingSellers = async (req, res) => {
  try {
    const result = await query(
      `SELECT sp.id, sp.status, sp.created_at, sp.approved_at, sp.rejection_reason,
              u.id as user_id, u.name, u.email, u.created_at as user_created_at
       FROM seller_profiles sp
       JOIN users u ON sp.user_id = u.id
       WHERE sp.status = $1
       ORDER BY sp.created_at DESC`,
      ['pending']
    );
    res.json({ sellers: result.rows });
  } catch (error) {
    console.error('GetPendingSellers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const approveSeller = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      `UPDATE seller_profiles 
       SET status = $1, approved_at = NOW() 
       WHERE id = $2 AND status = $3 
       RETURNING id, user_id, status, approved_at`,
      ['approved', id, 'pending']
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Pending seller not found' });
    }
    res.json({ message: 'Seller approved', seller: result.rows[0] });
  } catch (error) {
    console.error('ApproveSeller error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const rejectSeller = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejection_reason } = req.body;
    if (!rejection_reason) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }
    const result = await query(
      `UPDATE seller_profiles 
       SET status = $1, rejection_reason = $2 
       WHERE id = $3 AND status = $4 
       RETURNING id, user_id, status, rejection_reason`,
      ['rejected', rejection_reason, id, 'pending']
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Pending seller not found' });
    }
    res.json({ message: 'Seller rejected', seller: result.rows[0] });
  } catch (error) {
    console.error('RejectSeller error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getPendingSellers, approveSeller, rejectSeller };