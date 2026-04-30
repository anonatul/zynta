const express = require('express');
const router = express.Router();

const notImplemented = (req, res) => {
  res.status(501).json({ message: 'Order endpoints require PostgreSQL controller implementation' });
};

router.post('/', notImplemented);
router.get('/', notImplemented);
router.get('/:id', notImplemented);

module.exports = router;
