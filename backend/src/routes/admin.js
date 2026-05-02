const express = require('express');
const router = express.Router();

const { getSellers, approveSeller, rejectSeller } = require('../controllers/adminController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.get('/sellers', authenticateToken, authorizeRoles('admin'), getSellers);
router.put('/sellers/:id/approve', authenticateToken, authorizeRoles('admin'), approveSeller);
router.put('/sellers/:id/reject', authenticateToken, authorizeRoles('admin'), rejectSeller);

module.exports = router;