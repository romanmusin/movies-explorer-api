require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const User = require('../models/user');

const IncorrectDataError = require('../errors/incorrectDataErr');
// const UnauthorizedError = require('../errors/unauthorizedErr');
const NotFoundError = require('../errors/notFoundErr');
const ConflictError = require('../errors/conflictErr');

// module.exports.createUser = (req, res, next) => {
//   const { email, password, name } = req.body;

//   bcrypt
//     .hash(password, 10)
//     .then((hash) => User.create({
//       email,
//       password: hash,
//       name,
//     }))
//     .then((user) => {
//       const dataUser = {
//         email: user.email,
//         name: user.name,
//         _id: user._id,
//       };
//       res.send({
//         data: dataUser,
//       });
//     })
//     .catch((err) => {
//       if (err.name === 'ValidationError') {
//         next(new IncorrectDataError(err.message));
//       } else if (err.name === 'MongoServerError' && err.code === 11000) {
//         next(new ConflictError('Пользователь с таким e-mail уже существует'));
//       } else {
//         next(err);
//       }
//     });
// };

// module.exports.getUser = (req, res, next) => {
//   const userId = req.user._id;

//   User.findById(userId)
//     .then((user) => {
//       if (user) {
//         return res.send({
//           data: user,
//         });
//       }
//       throw new NotFoundError('Пользователь по указанному id не найден');
//     })
//     .catch((err) => {
//       if (err.name === 'CastError') {
//         next(new IncorrectDataError('Передан некорректный id пользователя'));
//       } else {
//         next(err);
//       }
//     });
// };

// module.exports.updateUser = (req, res, next) => {
//   const { name, email } = req.body;
//   const userId = req.user._id;

//   User.findByIdAndUpdate(
//     userId,
//     {
//       name,
//       email,
//     },
//     {
//       new: true,
//       runValidators: true,
//     },
//   )
//     .then((user) => {
//       if (user) {
//         return res.send({
//           data: user,
//         });
//       }
//       throw new NotFoundError('Пользователь по указанному id не найден');
//     })
//     .catch((err) => {
//       if (err.code === 11000) {
//         next(new ConflictError('Пользователь с таким email уже существует'));
//       } else if (err.name === 'ValidationError') {
//         next(
//           new IncorrectDataError(
//             'Переданы некорректные данные при обновлении профиля',
//           ),
//         );
//       } else if (err.name === 'CastError') {
//         next(new IncorrectDataError('Передан некорректный id пользователя'));
//       } else {
//         next(err);
//       }
//     });
// };

// module.exports.login = (req, res, next) => {
//   const { email, password } = req.body;

//   User.findOne({ email })
//     .select('+password')
//     .then((user) => {
//       if (!user) {
//         throw new UnauthorizedError('Неправильные почта или пароль');
//       }
//       return bcrypt
//         .compare(password, user.password)
//         .then((matched) => {
//           if (!matched) {
//             throw new UnauthorizedError('Неправильные почта или пароль');
//           }

//           const { NODE_ENV, JWT_SECRET } = process.env;

//           const token = jwt.sign(
//             { _id: user._id },
//             NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret-key',
//             { expiresIn: '7d' },
//           );
//           return res
//             .cookie('jwt', token, {
//               maxAge: 3600000 * 24 * 7,
//               sameSite: 'None',
//               secure: true,
//             })
//             .send({ message: 'Вход совершен успешно' });
//         })
//         .catch(next);
//     })
//     .catch(next);
// };

dotenv.config();

const {
  NODE_ENV,
  JWT_SECRET,
} = process.env;

// Получить данные о текущем пользователе
const getMyUser = (req, res, next) => {
  User.findById(req.user._id)
    .orFail(new NotFoundError('Нет пользователя с таким id'))
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new IncorrectDataError('Id неверный');
      } else {
        next(err);
      }
    })
    .catch(next);
};

// Обновить данные пользователя
const updateProfile = (req, res, next) => {
  const {
    name,
    email,
  } = req.body;
  if (!name || !email) {
    throw new IncorrectDataError('Введенные данные некорректны');
  }
  User.findByIdAndUpdate(req.user._id, {
    name,
    email,
  }, {
    new: true,
    runValidators: true,
  })
    .orFail(new NotFoundError('Нет пользователя с таким Id'))
    .then((data) => res.status(200)
      .send(data))
    .catch((err) => {
      if (err.name === 'MongoError' || err.code === 11000) {
        throw new ConflictError('Пользователь с таким email уже существует');
      } else if (err.name === 'ValidationError' || err.name === 'CastError') {
        throw new IncorrectDataError('Введенные данные некорректны');
      } else {
        next(err);
      }
    })
    .catch(next);
};

// Создание пользователя
const createUser = (req, res, next) => {
  const {
    name,
    email,
    password,
  } = req.body;
  if (!email || !name || !password) {
    throw new IncorrectDataError('Почта или пароль неверные');
  }
  bcrypt.hash(password, 10)
    .then((hash) => {
      User.create({
        email,
        name,
        password: hash,
      })
        .then((user) => {
          const token = jwt.sign({ _id: user._id }, `${NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret'}`, { expiresIn: '7d' });
          res.send({
            _id: user._id,
            name: user.name,
            email: user.email,
            token,
          });
        })
        .catch((err) => {
          if (err.name === 'MongoError' && err.code === 11000) {
            throw new ConflictError('Пользователь с таким email уже существует');
          } else if (err.name === 'ValidationError' || err.name === 'CastError') {
            throw new IncorrectDataError('Пароль или почта некорректны');
          } else {
            next(err);
          }
        })
        .catch(next);
    });
};

// Авторизация
const login = (req, res, next) => {
  const {
    email,
    password,
  } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, `${NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret'}`, { expiresIn: '7d' });
      res.status(200)
        .send({
          _id: user._id,
          name: user.name,
          email: user.email,
          token,
        });
    })
    .catch((err) => next(err));
};

module.exports = {
  getMyUser,
  updateProfile,
  createUser,
  login,
};
