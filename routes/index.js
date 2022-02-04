const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const NotFoundError = require('../errors/notFoundErr');

const auth = require('../middlewares/auth');
const { createUser, login } = require('../controllers/users');

router.post(
  '/signup',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().email(),
      name: Joi.string().required().min(2).max(30),
      password: Joi.string().required(),
    }),
  }),
  createUser,
);

router.post(
  '/signin',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().email(),
      password: Joi.string().required(),
    }),
  }),
  login,
);

router.use(auth);

router.use(require('./users'));
router.use(require('./movies'));

router.use('/*', (req, res, next) => {
  next(new NotFoundError('Ошибка - страница не найдена'));
});

module.exports = router;
