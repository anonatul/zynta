const notImplemented = (req, res) => {
  res.status(501).json({ message: 'Order endpoints require PostgreSQL controller implementation' });
};

module.exports = {
  createOrder: notImplemented,
  getOrders: notImplemented,
  getOrder: notImplemented,
  verifyPayment: notImplemented,
};
