const notImplemented = (req, res) => {
  res.status(501).json({ message: 'Auth endpoints require PostgreSQL controller implementation' });
};

module.exports = {
  register: notImplemented,
  login: notImplemented,
  getProfile: notImplemented,
};
