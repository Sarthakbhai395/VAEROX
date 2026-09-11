const app = require('../../backend/server.js');

module.exports = (req, res) => {
  req.url = '/api/auth/forgotpassword';
  return app(req, res);
};
