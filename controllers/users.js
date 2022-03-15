const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const User = require('../models/user');
const ValidationError = require('../errors/ValidationError');
const DuplicateError = require('../errors/DuplicateError');
const NotFoundError = require('../errors/NotFoundError');

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
        throw new ValidationError('Id неверный');
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
    throw new ValidationError('Введенные данные некорректны');
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
        throw new DuplicateError('Пользователь с таким email уже существует');
      } else if (err.name === 'ValidationError' || err.name === 'CastError') {
        throw new ValidationError('Введенные данные некорректны');
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
    throw new ValidationError('Почта или пароль неверные');
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
            throw new DuplicateError('Пользователь с таким email уже существует');
          } else if (err.name === 'ValidationError' || err.name === 'CastError') {
            throw new ValidationError('Пароль или почта некорректны');
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
