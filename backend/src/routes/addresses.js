const express = require('express');
const router = express.Router();

const notImplemented = (req, res) => {
  res.status(501).json({ message: 'Address endpoints require PostgreSQL controller implementation' });
};

router.get('/', notImplemented);
router.post('/', notImplemented);
router.put('/:id', notImplemented);
router.delete('/:id', notImplemented);

module.exports = router;
