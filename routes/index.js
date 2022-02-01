const router = require('express').Router();
const userRouter = require('./users');
const movieRouter = require('./movies');
const NotFoundError = require('../errors/notFoundErr');

router.use('/users', userRouter);
router.use('/cards', movieRouter);
router.use((req, res, next) => {
  next(new NotFoundError('Ошибка - страница не найдена'));
});

module.exports = router;
