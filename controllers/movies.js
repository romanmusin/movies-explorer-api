const Movie = require('../models/movie');
const IncorrectDataError = require('../errors/incorrectDataErr');
const ForbiddenDataError = require('../errors/forbiddenDataErr');
const NotFoundError = require('../errors/notFoundErr');

module.exports.getMovies = (req, res, next) => {
  const owner = req.user._id;

  Movie
    .find({ owner })
    .then((movie) => res.send({ data: movie }))
    .catch(next);
};

module.exports.createMovie = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
  } = req.body;
  const userId = req.user._id;

  Movie
    .create({
      country,
      director,
      duration,
      year,
      description,
      image,
      trailer,
      nameRU,
      nameEN,
      thumbnail,
      owner: userId,
      movieId,
    })
    .then((movie) => res.status(201).send({ movie }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new IncorrectDataError('Переданы некорректные данные при создании карточки'));
      }
      next(err);
    });
};

module.exports.deleteMovie = (req, res, next) => {
  const { movieId } = req.params;
  const userId = req.user._id;

  Movie
    .findById(movieId)
    .then((movie) => {
      if (movie.owner._id.toString() === userId) {
        Movie
          .findByIdAndRemove(movieId)
          .orFail(() => {
            throw new NotFoundError('Карточка с указанным id не найдена');
          })
          .then((deletedMovie) => {
            res.send({ data: deletedMovie });
          })
          .catch((err) => {
            if (err.name === 'CastError') {
              next(new IncorrectDataError('Передан некорректный id при удалении карточки'));
            }
            next(err);
          });
      } else {
        next(new ForbiddenDataError('У Вас нет прав на удаление этой карточки'));
      }
    })
    .catch(next);
};
