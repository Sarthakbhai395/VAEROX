const app = require('../backend/server.js');

module.exports = (req, res) => {
  req.url = '/api/products';
  return app(req, res);
};
