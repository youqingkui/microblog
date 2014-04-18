var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
//import connect
var connect = require('connect');
var cookieParser = require('cookie-parser');
//import express-session
var session = require('express-session');
var bodyParser = require('body-parser');
//import connect-mongo
var MongoStore = require('connect-mongo')(connect);
//import 数据库链接设置
var settings = require('./settings');


//路由文件
var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
//链接到mongodb session
app.use(session({
    secret: settings.cookieSecret,
    store: new MongoStore({
    db: settings.db
    })
}));

app.use(function(req, res, next){
    res.locals.user = req.session.user;
    res.locals.err = req.session.error;
                                                    
    // console.log("err" ,  req.session.error);
                                                    
    next();
});
app.use(express.static(path.join(__dirname, 'public')));

//路由路径
app.use('/', routes);
app.use('/u/', routes);
app.use('/post', routes);
app.use('/reg', routes);
app.use('/login', routes);
app.use('/logout', routes);
app.use('/users', users);

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
