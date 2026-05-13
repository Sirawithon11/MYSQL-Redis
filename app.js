var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieSession = require('cookie-session');
var passport = require('./config/passport');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var productsRouter = require('./routes/products');
var purchasesRouter = require('./routes/purchases');
var authRouter = require('./routes/auth');
var User = require('./models/User');
var Product = require('./models/Product');
var Purchase = require('./models/Purchase');

var app = express();

// Initialize database tables
User.initTable();
Product.initTable();
Purchase.initTable();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieSession({
  name: 'session',
  keys: [process.env.COOKIE_KEY],
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/products', productsRouter);
app.use('/purchases', purchasesRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // For API requests, return JSON
  if (req.path.startsWith('/api') || req.path.startsWith('/users') || req.path.startsWith('/products') || req.path.startsWith('/purchases') || req.path.startsWith('/auth')) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }

  // For traditional routes, render error page
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
