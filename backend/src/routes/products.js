const express = require('express');
const router = express.Router();
const { getPublicProducts, getPublicProduct, getReviews, addReview } = require('../controllers/productController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', getPublicProducts);
router.get('/:id', getPublicProduct);
router.get('/:id/reviews', getReviews);
router.post('/:id/reviews', authenticateToken, addReview);

module.exports = router;