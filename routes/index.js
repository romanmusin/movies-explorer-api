const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const usersRouter = require('./users');
const moviesRouter = require('./movies');
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

// router.get('/crash-test', () => {
//   setTimeout(() => {
//     throw new Error('Сервер сейчас упадёт');
//   }, 0);
// });

// router.get('/logout', (req, res, next) => {
//   res
//     .clearCookie('jwt', {
//       secure: true,
//       sameSite: 'none',
//     })
//     .send({ message: 'Выход совершен успешно' });
//   next();
// });
router.use(auth);

router.use('/users', usersRouter);
router.use('/movies', moviesRouter);

router.all('/*', () => {
  throw new NotFoundError('Такой страницы не существует');
});

module.exports = router;
