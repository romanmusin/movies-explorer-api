const movieRouter = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const { isValidUrl } = require('../utils/methods');

const {
  createMovie,
  getMovies,
  deleteMovie,
} = require('../controllers/movies');

movieRouter.get('/movies', getMovies);

movieRouter.post('/movies', celebrate({

  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    link: Joi.string().required().custom(isValidUrl),
  }),
}), createMovie);

movieRouter.delete('/movies/:movieId', celebrate({

  params: Joi.object().keys({
    cardId: Joi.string().required().hex().length(24),
  }),
}), deleteMovie);

module.exports = movieRouter;
