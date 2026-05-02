const express = require('express');
const router = express.Router();

const { getSellerProducts, createSellerProduct, updateSellerProduct, deleteSellerProduct } = require('../controllers/sellerController');
const { getSellerOrders, updateSellerOrderItem } = require('../controllers/orderController');
const { authenticateToken, requireApprovedSeller } = require('../middleware/auth');

router.get('/products', authenticateToken, requireApprovedSeller, getSellerProducts);
router.post('/products', authenticateToken, requireApprovedSeller, createSellerProduct);
router.put('/products/:id', authenticateToken, requireApprovedSeller, updateSellerProduct);
router.delete('/products/:id', authenticateToken, requireApprovedSeller, deleteSellerProduct);

router.get('/orders', authenticateToken, requireApprovedSeller, getSellerOrders);
router.patch('/orders/:itemId', authenticateToken, requireApprovedSeller, updateSellerOrderItem);

module.exports = router;