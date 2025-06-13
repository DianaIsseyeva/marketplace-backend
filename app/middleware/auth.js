const jwt = require('jsonwebtoken');
const User = require('../../models/user-model');
const { JWT_SECRET } = process.env;

module.exports = async function auth(req, res, next) {
  let token = req.headers.authorization;
  if (!token) {
    return res.status(401).send({ error: 'No authorization header' });
  }
  if (token.startsWith('Bearer')) {
    token = token.slice(7);
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(payload.id);
    if (!user) {
      return res.status(401).send({ error: 'User not found for this token' });
    }
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError')
      return res.status(401).send({ message: 'Token expired' });
    console.log('JWT verify error:', error);
    return res.status(401).send({ error: 'Token verification failed:' + error.message });
  }
};
