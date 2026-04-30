const notImplemented = (req, res) => {
  res.status(501).json({ message: 'Address endpoints require PostgreSQL controller implementation' });
};

module.exports = {
  getAddresses: notImplemented,
  createAddress: notImplemented,
  updateAddress: notImplemented,
  deleteAddress: notImplemented,
};
