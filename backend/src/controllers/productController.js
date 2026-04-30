const notImplemented = (req, res) => {
  res.status(501).json({ message: 'Product endpoints require PostgreSQL controller implementation' });
};

module.exports = {
  getProducts: notImplemented,
  getProduct: notImplemented,
  createProduct: notImplemented,
  updateProduct: notImplemented,
  deleteProduct: notImplemented,
  addReview: notImplemented,
  getReviews: notImplemented,
};
