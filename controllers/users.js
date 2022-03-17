const { JWT_SECRET, NODE_ENV } = process.env;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
// errors import
const BadRequest = require('../errors/ValidationError');
const NotFound = require('../errors/ValidationError');
const ConflictError = require('../errors/DuplicateError');
const UnauthorizedError = require('../errors/AuthError');

module.exports.getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      return res.send({ user });
    }
    throw next(new NotFound('Пользователь не найден'));
  } catch (err) {
    if (err.name === 'CastError') {
      return next(new NotFound('Пользователь не найден'));
    }
    return next(new Error());
  }
};

module.exports.updateUser = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { name, email } = req.body;
    const user = await User.findByIdAndUpdate(userId, { name, email }, {
      new: true,
      runValidators: true,
    });
    if (user) {
      return res.send({ user });
    }
    throw next(new NotFound('Пользователь не найден'));
  } catch (err) {
    if (err.name === 'MongoError' && err.code === 11000) {
      return next(new ConflictError('Пользователь с таким email уже существует'));
    }
    if (err.name === 'ValidationError') {
      return next(new BadRequest('Введены некорректные данные пользователя'));
    } if (err.name === 'CastError') {
      return next(new NotFound('Пользователь не найден'));
    }
    return next(new Error());
  }
};

module.exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      const user = await User.create({
        name, email, password: hash,
      });
      return res.status(201).send({
        user: {
          name: user.name,
          email: user.email,
          _id: user._id,
        },
      });
    }

    return next(new BadRequest('Введены некорректные данные пользователя'));
  } catch (err) {
    if (err.name === 'MongoError' && err.code === 11000) {
      next(new ConflictError('Пользователь с таким email уже существует'));
    }
    if (err.name === 'ValidationError') {
      next(new BadRequest('Введены некорректные данные пользователя'));
    }
    return next(new Error());
  }
};

module.exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findUserByCredentials(email, password);
    const token = jwt.sign(
      { _id: user._id },
      NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
      { expiresIn: '7d' },
    );
    return res.send({ token });
  } catch (err) {
    return next(new UnauthorizedError(err.message));
  }
};
