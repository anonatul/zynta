const notImplemented = (req, res) => {
  res.status(501).json({ message: 'Category endpoints require PostgreSQL controller implementation' });
};

module.exports = {
  getCategories: notImplemented,
  createCategory: notImplemented,
};
