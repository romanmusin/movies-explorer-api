const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const {
  getMyUser,
  updateProfile,
} = require('../controllers/users');

router.get('/me', getMyUser);
router.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    email: Joi.string().required().email(),
  }),
}), updateProfile);

module.exports = router;
