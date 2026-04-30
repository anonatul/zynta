const express = require('express');
const router = express.Router();

const { getPublicProducts, getPublicProduct } = require('../controllers/productController');

router.get('/', getPublicProducts);
router.get('/:id', getPublicProduct);

module.exports = router;