const express = require('express');
const router = express.Router();

const notImplemented = (req, res) => {
  res.status(501).json({ message: 'Auth endpoints require PostgreSQL controller implementation' });
};

router.post('/register', notImplemented);
router.post('/login', notImplemented);
router.get('/profile', notImplemented);

module.exports = router;
