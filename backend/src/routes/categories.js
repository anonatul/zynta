const express = require('express');
const router = express.Router();

const notImplemented = (req, res) => {
  res.status(501).json({ message: 'Category endpoints require PostgreSQL controller implementation' });
};

router.get('/', notImplemented);
router.post('/', notImplemented);

module.exports = router;
