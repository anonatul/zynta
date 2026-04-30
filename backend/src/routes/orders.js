const express = require('express');
const router = express.Router();

const { authenticateToken } = require('../middleware/auth');
const { createOrder, getOrders, getOrder } = require('../controllers/orderController');

router.post('/', authenticateToken, createOrder);
router.get('/', authenticateToken, getOrders);
router.get('/:id', authenticateToken, getOrder);

module.exports = router;