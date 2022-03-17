const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const validator = require('validator');

const BadRequest = require('../errors/ValidationError');

const { getSavedMovies, createMovie, deleteMovie } = require('../controllers/movies');

const method = (value) => {
  const correctLink = validator.isURL(value, { require_protocol: true });
  if (!correctLink) {
    throw new BadRequest('Введена некорректная ссылка');
  }
  return value;
};

// get all saved movies
router.get('/', getSavedMovies);

// create new movie
router.post('/', celebrate({
  body: Joi.object().keys({
    country: Joi.string().required(),
    director: Joi.string().required(),
    duration: Joi.number().required(),
    year: Joi.string().required(),
    description: Joi.string().required(),
    image: Joi.string().required().custom(method, 'Validation Link'),
    trailer: Joi.string().required().custom(method, 'Validation Link'),
    nameRU: Joi.string().required(),
    nameEN: Joi.string().required(),
    thumbnail: Joi.string().required().custom(method, 'Validation Link'),
    movieId: Joi.number().required(),
  }),
}), createMovie);

// remove saved movie
router.delete('/:movieId', celebrate({
  params: Joi.object().keys({
    movieId: Joi.string().hex().length(24),
  }),
}), deleteMovie);

module.exports = router;
