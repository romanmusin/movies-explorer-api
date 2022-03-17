require('dotenv').config();

const helmet = require('helmet');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { celebrate, Joi } = require('celebrate');
const limiter = require('./middlewares/rateLimit');

const handleErrors = require('./handle-errors');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const NotFoundError = require('./errors/NotFoundError');

const auth = require('./middlewares/auth');
const { createUser, login } = require('./controllers/users');

const api = require('./routes');

const { DB, NODE_ENV } = process.env;
const { PORT = 5000 } = process.env;

const app = express();

async function start() {
  try {
    app.listen(PORT, () => `Server is running on port ${PORT}`);
    await mongoose.connect(NODE_ENV === 'production' ? DB : 'mongodb://localhost:27017/moviesdb', {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    });
  } catch (error) {
    return `Init application error: status 500 ${error}`;
  }
  return null;
}

app.use(helmet());

app.set('trust proxy', 1);

app.use(limiter);

const allowedCors = [
  'http://dip.nomoredomains.work',
  'https://dip.nomoredomains.work',
  'http://localhost:3000',
  'https://localhost:3000',
];

app.use((req, res, next) => {
  const { origin } = req.headers;
  if (allowedCors.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }

  const { method } = req;
  const DEFAULT_ALLOWED_METHODS = 'GET,HEAD,PUT,PATCH,POST,DELETE';

  const requestHeaders = req.headers['access-control-request-headers'];
  if (method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', DEFAULT_ALLOWED_METHODS);
    res.header('Access-Control-Allow-Headers', requestHeaders);
    res.header('Access-Control-Allow-Credentials', true);
    res.status(200).send();
  }

  next();
});

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser('secret'));

app.use(requestLogger); // подключаем логгер запросов

app.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), createUser);

app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), login);

app.use(auth);

app.use(api);

app.use('/*', (req, res, next) => {
  next(new NotFoundError('Запрашиваемый ресурс не найден'));
});

app.use(errorLogger);

app.use((err, req, res, next) => {
  handleErrors(err, req, res, next);
});

start();
module.exports = app;
