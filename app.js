require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { errors } = require('celebrate');

const cors = require('cors');
const helmet = require('helmet');
const router = require('./routes');
const centralizedErrors = require('./middlewares/centralizedErrors');

const rateLimiter = require('./middlewares/rateLimit');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const { dataBse, NODE_ENV } = process.env;
const { PORT = 3000 } = process.env;
const app = express();
app.use(helmet());

mongoose.connect(
  NODE_ENV === 'production' ? dataBse : 'mongodb://localhost:27017/moviesdb',
);

// app.use(
//   '*',
//   cors({
//     origin: [
//       'http://moviex.nomoredomains.work',
//       'https://moviex.nomoredomains.work',
//       'localhost:3000',
//     ],
//     methods: ['OPTIONS', 'GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
//     preflightContinue: false,
//     optionsSuccessStatus: 204,
//     allowedHeaders: ['Content-Type', 'origin', 'Authorization', 'Cookie'],
//     exposedHeaders: ['Set-Cookie'],
//     credentials: true,
//   }),
// );

app.use(cors({
  origin: 'https://moviex.nomoredomains.work',
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(requestLogger);
app.use(rateLimiter);

app.use(router);
app.use(errorLogger);
app.use(errors());

app.use(centralizedErrors);
app.listen(PORT);
