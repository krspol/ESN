var express = require('express');
var login = require('./routes/login');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var quard = require('./lib/guard');
var index = require('./routes/index');

var userQuestion = require('./routes/question');
var adminIndex = require('./routes/admin/index');
var adminSessions = require('./routes/admin/sessions');
var adminQuestion = require('./routes/admin/question');
var adminResults = require('./routes/admin/results');

var app = express();
var io = require('socket.io').listen(app.listen(3001));
app.set('socketio', io);
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
app.use('/', quard.setSessions);
app.use('/admin/', quard.checkAdmin);
app.use('/user/', quard.checkUser);
app.use(app.router);

app.get('/', index.init);
app.get('/login', login.form);
app.post('/login', login.submit);
app.get('/logout', login.logout);
app.get('/user', index.mainPage);
app.post('/user/session', index.qrSubmit);
// USER
app.get('/user/session/:sessionId/question/:id', userQuestion.questionForm);
app.post('/user/session/:sessionId/question/:id', userQuestion.questionSubmit);


// ADMIN
app.get('/admin', adminIndex.mainPage);
app.get('/admin/session', adminSessions.newSessionForm);
app.post('/admin/session', adminSessions.newSessionSubmit);
app.get('/admin/session/:id', adminSessions.sessionForm);
app.post('/admin/session/:id/active', adminSessions.sessionActivity);
app.get('/admin/sessions/:id/question', adminQuestion.newQuestionForm);
app.post('/admin/sessions/:id/question', adminQuestion.newQuestionSubmit);
app.post('/admin/session/:id', adminSessions.sessionSubmit);
app.get('/admin/session/:id/questions', adminSessions.questionList);
app.get('/admin/question/:id', adminQuestion.questionForm);
app.post('/admin/question/:id', adminQuestion.questionSubmit);
app.get('/admin/question/results/:id', adminResults.showResults);


io.on('connection', function (socket) {
    console.log('a user connected');
});
