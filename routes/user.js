const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const { getCurrentUser, updateUser } = require('../controllers/user');

// info about user
router.get('/me', getCurrentUser);

// update user's info
router.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    email: Joi.string().required().email(),
  }),
}), updateUser);

module.exports = router;
