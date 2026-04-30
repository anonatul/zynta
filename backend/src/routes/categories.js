const express = require('express');
const router = express.Router();

const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { getCategories, createCategory } = require('../controllers/categoryController');

router.get('/', getCategories);
router.post('/', authenticateToken, authorizeRoles('admin'), createCategory);

module.exports = router;