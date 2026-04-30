const express = require('express');
const router = express.Router();

const notImplemented = (req, res) => {
  res.status(501).json({ message: 'Cart endpoints require PostgreSQL controller implementation' });
};

router.get('/', notImplemented);
router.post('/', notImplemented);
router.put('/:itemId', notImplemented);
router.delete('/:itemId', notImplemented);
router.delete('/', notImplemented);

module.exports = router;
