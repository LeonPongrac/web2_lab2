const dotenv = require('dotenv');
const express = require('express');
const session = require('express-session');
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

app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}))

const config = {
  authRequired: false,
  auth0Logout: true
};

const port = process.env.PORT || 3000;
if (!config.baseURL && !process.env.BASE_URL && process.env.PORT && process.env.NODE_ENV !== 'production') {
  config.baseURL = `http://localhost:${port}`;
}

const db = pgp({connectionString: process.env.DATABASE_URL,
  ssl: {rejectUnauthorized: false}});
module.exports = db;

app.use(function (req, res, next) {
  res.locals.db = db;
  next();
});

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

db.none('CREATE TABLE IF NOT EXISTS users ( id serial PRIMARY KEY, username TEXT NOT NULL, password TEXT NOT NULL)')
  .then(() => {
    console.log('Table users created successfully.');
  })
  .catch(error => {
    console.log('ERROR:', error);
  });

/*db.none('DROP TABLE IF EXISTS users')
  .then(() => {
    console.log('Table users deleted successfully.');
  })
  .catch(error => {
    console.log('ERROR:', error);
  });*/

http.createServer(app)
  .listen(port, () => {
    console.log(`Listening on ${config.baseURL}`);
});