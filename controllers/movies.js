const Movie = require('../models/movie');
const IncorrectDataError = require('../errors/incorrectDataErr');
const ForbiddenDataError = require('../errors/forbiddenDataErr');
const NotFoundError = require('../errors/notFoundErr');

module.exports.getMovies = (req, res, next) => {
  const owner = req.user._id;
  Movie.find({ owner })
    .select('-owner')
    .then((movies) => res.status(200)
      .send(movies))
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

  Movie.createMovie = (req, res, next) => {
  const {
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
    movieId,
  } = req.body;

  Movie.create({
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
    movieId,
    owner: req.user._id,
  })
    .then((movie) => res.status(200)
      .send({
        _id: movie._id,
        country: movie.country,
        director: movie.director,
        duration: movie.duration,
        year: movie.year,
        description: movie.description,
        image: movie.image,
        trailer: movie.trailer,
        nameRU: movie.nameRU,
        nameEN: movie.nameEN,
        thumbnail: movie.thumbnail,
        movieId: movie.movieId,
      }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new IncorrectDataError(err.message);
      } else {
        next(err);
      }
    })
    .catch(next);
};

module.exports.deleteMovie = (req, res, next) => {
  const userId = req.user._id;
  Movie.findById(req.params.movieId)
    .select('+owner')
    .orFail(() => {
      throw new NotFoundError('Такой фильм отсутствует');
    })
    .then((movie) => {
      if (movie.owner.toString() !== userId) {
        throw new ForbiddenError('Вы не можете удалить чужой фильм');
      }
      return Movie.findByIdAndDelete(req.params.movieId)
        .select('-owner')
        .then((data) => res.status(200)
          .send(data))
        .catch(next);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new IncorrectDataError('Id неверный');
      } else {
        next(err);
      }
    })
    .catch(next);
};

