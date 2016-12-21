/**
 * Created by Andrzej on 7/12/2016.
 */

var question = require('../lib/question');
var answer = require('../lib/answer');
var results = require('../lib/results');
var express = require('express');

exports.questionForm = function (req, resp, next) {

    var questionId = req.param('id');
    var sessionId = req.param('sessionId');
    question.getById(questionId, function (err, question) {
        if (err) throw err;
        if (question.active == 'false' ||
            sessionId != question.sessionId)
            resp.send(404);

        var resultAnswers = [];
        answer.getAllByQuestionId(questionId, 0, 2, function (err, answers) { // TODO set range
            if (err) throw err;
            answers.forEach(function (answer) {
                resultAnswers.push(answer);
            });
            resp.render('question', {
                title: 'glosowanie',
                sessionId: req.session.sessionId,
                question: question,
                answers: answers,
                s_user: req.session.s_user
            });
            next();
        });
    });
};

exports.questionSubmit = function (req, resp, next) {

    var answer = req.body.answer;
    results.voteByAnswerId(answer.id, function (err) {
        if (err) throw err;
        results.getByAnswerId(answer.id, function (err, counter) {
            var socketio = req.app.get('socketio'); // tacke out socket instance from the app container
            socketio.sockets.emit('incr', {
                answerid: answer.id,
                counter: counter,
                text: answer.text
            });

            resp.end('Dziekuje za oddany glos ' + answer.text + ' o id = ' + answer.id);

        });
    });

};