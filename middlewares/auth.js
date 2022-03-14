// require('dotenv').config();
// const jwt = require('jsonwebtoken');
// const UnauthorizedError = require('../errors/unauthorizedErr');

// module.exports = (req, res, next) => {
//   const token = req.cookies.jwt;
//   if (!token) {
//     throw new UnauthorizedError('Необходима авторизация');
//   }

//   const { NODE_ENV, JWT_SECRET } = process.env;
//   let payload;

//   try {
//     payload = jwt.verify(
//       token,
//       NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret-key',
//     );
//   } catch (err) {
//     next(new UnauthorizedError('Необходима авторизация'));
//   }
//   req.user = payload;
//   next();
// };

const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../errors/unauthorizedErr');

const { JWT_SECRET, NODE_ENV } = process.env;

const auth = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer')) {
    throw new UnauthorizedError('Необходима авторизация');
  }

  const token = authorization.replace('Bearer ', '');
  let payload;

  try {
    // верифицируем токен
    payload = jwt.verify(token, `${NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret'}`);
  } catch (err) {
    throw new UnauthorizedError('Необходима авторизация');
  }
  req.user = payload; // записываем пейлоуд в объект запроса
  next(); // пропускаем запрос дальше
};

module.exports = auth;
