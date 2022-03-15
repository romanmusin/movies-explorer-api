const express = require('express');
const helmet = require('helmet');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const { errors } = require('celebrate');
const routes = require('./routes');
const errorsHandler = require('./middlewares/centralizedErrors');
const limiter = require('./middlewares/rateLimit');
const {
  requestLogger,
  errorLogger,
} = require('./middlewares/logger');

dotenv.config();
const {
  NODE_ENV,
  PORT = 5000,
  DB_URL,
} = process.env;

const app = express();
app.use(helmet());

mongoose.connect(NODE_ENV === 'production' ? DB_URL : 'mongodb://localhost:27017/moviesdb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

app.use(cors({
  origin: NODE_ENV === 'production' ? 'https://movies.kamenskiyyyy.nomoredomains.icu' : 'http://localhost:3000',
  credentials: true,
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(requestLogger);

app.use(limiter);

app.use(routes);

app.use(errorLogger);
app.use(errors()); // обработчик ошибок celebrate

app.use(errorsHandler);

app.listen(PORT);
