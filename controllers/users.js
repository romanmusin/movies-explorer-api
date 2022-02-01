require('dotenv').config();
const bcrypt = require('bcrypt');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const IncorrectDataError = require('../errors/incorrectDataErr');
const UnauthorizedError = require('../errors/unauthorizedErr');
const NotFoundError = require('../errors/notFoundErr');
const ConflictError = require('../errors/conflictErr');

module.exports.createUser = (req, res, next) => {
  const {
    email, password, name,
  } = req.body;

  bcrypt
    .hash(password, 10)
    .then((hash) => {
      if (!validator.isEmail(email)) {
        throw new IncorrectDataError('Передан некорректный e-mail');
      }
      return User.create({
        email,
        password: hash,
        name,
      });
    })
    .then((user) => {
      const dataUser = {
        email: user.email,
        name: user.name,
        _id: user._id,
      };
      res.send({
        data: dataUser,
      });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new IncorrectDataError(err.message));
      } else if (err.name === 'MongoServerError' && err.code === 11000) {
        next(new ConflictError('Пользователь с таким e-mail уже существует'));
      } else {
        next(err);
      }
    });
};

module.exports.getUser = (req, res, next) => {
  const userId = req.user._id;

  User.findById(userId)
    .then((user) => {
      if (user) {
        return res.send({
          data: user,
        });
      }
      throw new NotFoundError('Пользователь по указанному id не найден');
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new IncorrectDataError('Передан некорректный id пользователя'));
      } else {
        next(err);
      }
    });
};

module.exports.updateUser = (req, res, next) => {
  const { name, about } = req.body;

  User
    .findByIdAndUpdate(
      req.user._id,
      {
        name,
        about,
      },
      {
        new: true,
        runValidators: true,
      },
    )
    .then((user) => {
      if (user) {
        return res.send({
          data: user,
        });
      }
      throw new NotFoundError('Пользователь по указанному id не найден');
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new IncorrectDataError('Переданы некорректные данные при обновлении профиля'));
      } else if (err.name === 'CastError') {
        next(new IncorrectDataError('Передан некорректный id пользователя'));
      } else {
        next(err);
      }
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        throw new UnauthorizedError('Неправильные почта или пароль');
      }
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            throw new UnauthorizedError('Неправильные почта или пароль');
          }

          const { NODE_ENV, JWT_SECRET } = process.env;

          const token = jwt.sign(
            { _id: user._id },
            NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret-key',
            { expiresIn: '7d' },
          );
          return res
            .cookie('jwt', token, {
              maxAge: 3600000 * 24 * 7,
              sameSite: 'None',
              secure: true,
            })
            .send({ message: 'Вход совершен успешно' });
        })
        .catch(next);
    })
    .catch(next);
};
