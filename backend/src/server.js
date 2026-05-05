require('dotenv').config();
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
const express = require('express');
const cors = require('cors');
const { query } = require('./config/db');
const seed = require('./seed');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Zynta API Running' });
});

app.get('/health', async (req, res, next) => {
  try {
    await query('SELECT 1');
    res.json({ status: 'ok' });
  } catch (err) {
    next(err);
  }
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/products', require('./routes/products'));
app.use('/api/seller', require('./routes/seller'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/addresses', require('./routes/addresses'));

// Seed endpoint (for seeding products - use once)
app.post('/api/seed', async (req, res) => {
  const { key } = req.body;
  if (key !== process.env.SEED_KEY) {
    return res.status(401).json({ message: 'Invalid key' });
  }
  try {
    await seed();
    res.json({ message: 'Seed completed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Seed failed' });
  }
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
