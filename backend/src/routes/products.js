const express = require('express');
const router = express.Router();

const notImplemented = (req, res) => {
  res.status(501).json({ message: 'Product endpoints require PostgreSQL controller implementation' });
};

router.get('/', notImplemented);
router.get('/:id', notImplemented);
router.post('/', notImplemented);
router.put('/:id', notImplemented);
router.delete('/:id', notImplemented);
router.post('/:id/reviews', notImplemented);
router.get('/:id/reviews', notImplemented);

module.exports = router;
