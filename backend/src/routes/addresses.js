const express = require('express');
const router = express.Router();

const { authenticateToken } = require('../middleware/auth');
const { getAddresses, createAddress, updateAddress, deleteAddress } = require('../controllers/addressController');

router.get('/', authenticateToken, getAddresses);
router.post('/', authenticateToken, createAddress);
router.put('/:id', authenticateToken, updateAddress);
router.delete('/:id', authenticateToken, deleteAddress);

module.exports = router;