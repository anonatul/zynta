const { query } = require('../config/db');

const getSellers = async (req, res) => {
  try {
    const result = await query(
      `SELECT sp.id, sp.approval_status as status, sp.created_at, sp.approved_at, sp.rejection_reason,
              u.id as user_id, u.name, u.email, u.created_at as user_created_at
       FROM seller_profiles sp
       JOIN users u ON sp.user_id = u.id
       ORDER BY sp.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('GetSellers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const approveSeller = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      `UPDATE seller_profiles 
       SET approval_status = $1, approved_at = NOW(), updated_at = NOW() 
       WHERE id = $2 AND approval_status = 'pending'
       RETURNING id, user_id, approval_status as status, approved_at`,
      ['approved', id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Pending seller not found' });
    }
    // Also update user status to approved
    await query(
      `UPDATE users SET status = 'approved', updated_at = NOW() WHERE id = $1`,
      [result.rows[0].user_id]
    );
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
    const result = await query(
      `UPDATE seller_profiles 
       SET approval_status = $1, rejection_reason = $2, updated_at = NOW() 
       WHERE id = $3 AND approval_status IN ('pending', 'approved')
       RETURNING id, user_id, approval_status as status, rejection_reason`,
      ['rejected', rejection_reason || 'No reason provided', id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Seller not found' });
    }
    // Also update user status
    await query(
      `UPDATE users SET status = 'rejected', updated_at = NOW() WHERE id = $1`,
      [result.rows[0].user_id]
    );
    res.json({ message: 'Seller rejected', seller: result.rows[0] });
  } catch (error) {
    console.error('RejectSeller error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getSellers, approveSeller, rejectSeller };