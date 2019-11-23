var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var contentsRouter = require('./routes/contents');
var platformsRouter = require('./routes/platforms');
var filterwordsRouter = require('./routes/filterwords');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/contents', contentsRouter);
app.use('/platforms', platformsRouter);
app.use('/filterwords', filterwordsRouter);

module.exports = app;
