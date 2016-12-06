var express = require('express');
var sessions = require('../lib/session');
var question = require('../lib/question');

exports.mainPage = function (req, resp, err) { // TODO
    /*TODO
         TypeError: D:\ESN\views\index.ejs:9
     7|   <body>
     8|     <h1><%= title %></h1>
     >> 9|     <p>Jestes zalogowany jako,  <%= s_user.username %></p>
     10|         <p><a href="/logout">Wyloguj sie</a></p>
     11|
     12|

     Cannot read property 'username' of undefined
     at eval (eval at <anonymous> (D:\ESN\node_modules\ejs\lib\ejs.js:242:14), <anonymous>:30:319)
     at eval (eval at <anonymous> (D:\ESN\node_modules\ejs\lib\ejs.js:242:14), <anonymous>:30:596)
     at D:\ESN\node_modules\ejs\lib\ejs.js:255:15
     at Object.exports.render (D:\ESN\node_modules\ejs\lib\ejs.js:293:13)
     at View.exports.renderFile [as engine] (D:\ESN\node_modules\ejs\lib\ejs.js:323:20)
     at View.render (D:\ESN\node_modules\express\lib\view.js:76:8)
     at Function.app.render (D:\ESN\node_modules\express\lib\application.js:561:10)
     at ServerResponse.res.render (D:\ESN\node_modules\express\lib\response.js:845:7)
     at D:\ESN\routes\index.js:10:14
     at D:\ESN\lib\sessions.js:27:9

     */
    if(!req.session.s_user)
        resp.redirect('/login');

    sessions.getAll(0,2,function (err, sessions) { // TODO set range of list

        resp.render('index', {
            title : 'Panel uzytkownika',
            notAuth: req.session.notAuth,
            s_user: req.session.s_user
        });

    });



};

exports.qrSubmit = function (req, resp, next) {
    var qrcode = req.body.qrcode;
    var questions = [];

    question.getAllBySessionId(qrcode, 0, 100, function (err, questionss) {
        if(err) throw err;
        questionss.forEach(function (item) {
            if(item.active == 'true')
                questions.push(item);

        });
        resp.render('questions', {
            title : 'Dostepne pytania',
            notAuth: req.session.notAuth,
            s_user: req.session.s_user,
            sessionId: qrcode,
            questions: questions
        });

    });


};
// da508acbef38