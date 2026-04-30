const express = require('express');
const router = express.Router();

const { getSellerProducts, createSellerProduct, updateSellerProduct, deleteSellerProduct } = require('../controllers/sellerController');
const { authenticateToken, requireApprovedSeller } = require('../middleware/auth');

router.get('/products', authenticateToken, requireApprovedSeller, getSellerProducts);
router.post('/products', authenticateToken, requireApprovedSeller, createSellerProduct);
router.put('/products/:id', authenticateToken, requireApprovedSeller, updateSellerProduct);
router.delete('/products/:id', authenticateToken, requireApprovedSeller, deleteSellerProduct);

module.exports = router;