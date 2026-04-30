const express = require('express');
const router = express.Router();
const { createOrder, getOrders, getOrder, verifyPayment } = require('../controllers/orderController');
const auth = require('../middleware/auth');

router.post('/', auth, createOrder);
router.get('/', auth, getOrders);
router.get('/:id', auth, getOrder);
router.post('/verify', auth, verifyPayment);

module.exports = router;