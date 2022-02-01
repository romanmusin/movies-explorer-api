const userRouter = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const { isValidUrl } = require('../utils/methods');

const {
  getUser,
  updateUser,
} = require('../controllers/users');

userRouter.get('/me', getUser);
userRouter.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    about: Joi.string().required().custom(isValidUrl),
  }),
}), updateUser);

module.exports = userRouter;
