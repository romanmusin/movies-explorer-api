const Movie = require('../models/movie');

// errors import
const BadRequest = require('../errors/ValidationError');
const NotFound = require('../errors/NotFoundError');
const ForbiddenError = require('../errors/ForbiddenError');

module.exports.getSavedMovies = async (req, res, next) => {
  try {
    const movies = await Movie.find({}).populate('user');
    return res.send({ movies });
  } catch (err) {
    return next(new Error());
  }
};

module.exports.createMovie = async (req, res, next) => {
  try {
    const userId = req.user._id;
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
    const movie = await Movie.create({
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
    });
    return res.status(201).send({ movie });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return next(new BadRequest('Введены некорректные данные фильма'));
    }
    return next(new Error());
  }
};

module.exports.deleteMovie = async (req, res, next) => {
  try {
    const deletedMovie = await Movie.findById(req.params.movieId);

    if (deletedMovie && req.user._id === deletedMovie.owner.toString()) {
      const movie = await Movie.findByIdAndRemove(req.params.movieId);
      return res.send({ movie });
    } if (!deletedMovie) {
      throw next(new NotFound('Фильм не найден'));
    } else {
      return next(new ForbiddenError('Нельзя удалить фильм другого пользователя'));
    }
  } catch (err) {
    if (err.name === 'CastError') {
      throw next(new NotFound('Фильм не найден'));
    }

    return next(new Error());
  }
};
