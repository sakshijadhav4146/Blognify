const jwt = require("jsonwebtoken");
require("dotenv").config()
const secretKey = process.env.SECRET_KEY;

function generateToken(user) {
  const payload = {
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    profileImageUrl: user.profileImageURL,
    role: user.role,
  };
  const token= jwt.sign(payload, secretKey);
  return token
}

function validateToken(token) {
  const payload = jwt.verify(token, secretKey);
  return payload;
};

module.exports = {
  generateToken,
  validateToken,
};
