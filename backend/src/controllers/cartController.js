const notImplemented = (req, res) => {
  res.status(501).json({ message: 'Cart endpoints require PostgreSQL controller implementation' });
};

module.exports = {
  getCart: notImplemented,
  addToCart: notImplemented,
  updateCartItem: notImplemented,
  removeCartItem: notImplemented,
  clearCart: notImplemented,
};
