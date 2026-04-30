const express = require('express');
const router = express.Router();

router.use((req, res) => {
  res.status(501).json({ message: 'Admin endpoints require PostgreSQL controller implementation' });
});

module.exports = router;
