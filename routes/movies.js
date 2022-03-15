const router = require('express')
  .Router();
const {
  validateMovie,
  validateMovieId,
} = require('../middlewares/validation');
const {
  getMovies,
  createMovie,
  deleteMovie,
} = require('../controllers/movies');

router.get('/', getMovies); // возвращает все сохранённые пользователем фильмы
router.post('/', validateMovie, createMovie); // создаёт фильм с переданными в теле данными
router.delete('/:movieId', validateMovieId, deleteMovie); // удаляет сохранённый фильм по id

module.exports = router;
