var express = require('express');
var login = require('./routes/login');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var quard = require('./lib/guard');

var index = require('./routes/index');
var adminIndex = require('./routes/admin/index');
var adminSessions = require('./routes/admin/sessions');
var adminQuestion = require('./routes/admin/question');


var app = express();
app.set('port', 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon(__dirname + '/public/fav.ico'));
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(bodyParser.json());
app.use(expressValidator());
app.use(express.methodOverride());
app.use(express.cookieParser('esncookie'));
app.use(express.session());
app.use('/admin/', quard.check);
app.use(app.router);

app.get('/login', login.form);
app.post('/login', login.submit);
app.get('/logout', login.logout);
app.get('/', index.mainPage);
app.post('/', index.qrSubmit);
// USER



// ADMIN
app.get('/admin', adminIndex.mainPage);
app.get('/admin/session', adminSessions.newSessionForm);
app.post('/admin/session', adminSessions.newSessionSubmit);
app.get('/admin/session/:id', adminSessions.sessionForm);
app.get('/admin/sessions/:id/question', adminQuestion.newQuestionForm);
app.post('/admin/sessions/:id/question', adminQuestion.newQuestionSubmit);
app.post('/admin/session/:id', adminSessions.sessionSubmit);
app.get('/admin/session/:id/questions', adminSessions.questionList)
app.get('/admin/question/:id', adminQuestion.questionForm);
app.post('/admin/question/:id', adminQuestion.questionSubmit);
app.listen(3000);