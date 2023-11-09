const dotenv = require('dotenv');
const express = require('express');
const http = require('http');
const logger = require('morgan');
const path = require('path');
const router = require('./routes/index');
const pgp = require('pg-promise')();

dotenv.config();

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

const config = {
  authRequired: false,
  auth0Logout: true
};

const port = process.env.PORT || 3000;
if (!config.baseURL && !process.env.BASE_URL && process.env.PORT && process.env.NODE_ENV !== 'production') {
  config.baseURL = `http://localhost:${port}`;
}

app.use('/', router);

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Error handlers
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: process.env.NODE_ENV !== 'production' ? err : {}
  });
});

const db = pgp({connectionString: process.env.DATABASE_URL,
  ssl: {rejectUnauthorized: false}});
module.exports = db;

db.none('CREATE TABLE IF NOT EXISTS users ( id serial PRIMARY KEY, username VARCHAR(255) NOT NULL, password VARCHAR(255) NOT NULL)')
  .then(() => {
    console.log('Table users created successfully.');
  })
  .catch(error => {
    console.log('ERROR:', error);
  });

http.createServer(app)
  .listen(port, () => {
    console.log(`Listening on ${config.baseURL}`);
});