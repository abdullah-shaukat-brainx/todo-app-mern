const jwt = require("jsonwebtoken");

const verifyToken = (token, key) => {
  return jwt.verify(token, key);
};
const generateTokenWithSecret = (user, secret) => {
  return jwt.sign(user, secret);
};
module.exports = {
  verifyToken,
  generateTokenWithSecret,
};
