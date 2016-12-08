/**
 * Created by Fabian on 05.12.2016.
 */
var question = require('../../lib/question');
var answer = require('../../lib/answer');
var url = require('url');
var express = require('express');
var flow = require('nimble');

exports.newQuestionForm = function (req, resp, next) {

    resp.render('admin/new-question', {
        title: 'Dodawanie pytan',
        s_user: req.session.s_user,
        sessionId: req.session.sessionId
    });

};

exports.newQuestionSubmit = function (req, resp, next) {
    // TODO we should do flexible for more questions
    var dataQuestion = req.body.question;
    var howManyAnswers = 2; // req.body.answerCounter;

    var answers = [req.body.answer1, req.body.answer2];
    var answersObj = [];
    var sessionId = req.session.sessionId;

    answers.forEach(function (ans) {
        answersObj.push(
            new answer({
                text: ans.text
            })
        );
    });

    var questionObj = new question({
        text: dataQuestion.text,
        date: dataQuestion.date,
        sessionId: dataQuestion.sessionId,
        active: dataQuestion.active
    });
    var counter = 0;
    questionObj.save(sessionId, function (err, questionId) {
        if (err) throw err;

        flow.series([
            function (callback) {
                answersObj.forEach(function (ans) {
                    ans.save(questionId, function (err) {
                        if (err) return fn(err);
                    });
                });
                callback();
            },
            function (callback) {
                resp.redirect('/admin/session/' + sessionId + '/questions');
                callback();
            }]);

    });
};

this.doAndRedirect = function (err, url, resp, fn) {
    if (err) throw err;
    resp.redirect('/admin/session/' + sessionId + '/questions');
}
exports.questionSubmit = function (req, resp, next) {
    var url1 = url.parse(req.url);
    var query = url1.query;
    var splittedQuery = query.split('=');
    var key = splittedQuery[0], value = splittedQuery[1];

    // TODO (?) maybe make only one form (?)
    switch (value) {
        case 'answer':
            var dataAnswer = req.body.answer;
            answer.getById(dataAnswer.id, function (err, ans) {
                if (err) throw err;
                ans.remove(function (err) {
                    if (err) throw err;
                    new answer({
                        text: dataAnswer.text,
                        questionId: dataAnswer.questionId,
                        id: dataAnswer.id
                    }).update(function (err) {
                        if (err) return err;
                        console.log('Odpowiedz pomyslnie zmodyfikowana');
                        resp.redirect('/admin/question/' + dataAnswer.questionId);
                    });
                })
            });
            break;
        case 'question':
            var dataQuestion = req.body.question;
            question.getById(dataQuestion.id, function (err, quest) {
                if (err) throw err;
                quest.remove(function (err) {
                    if (err) throw err;
                    new question({
                        text: dataQuestion.text,
                        date: dataQuestion.date,
                        sessionId: dataQuestion.sessionId,
                        active: dataQuestion.active,
                        id: dataQuestion.id
                    }).update(function (err) {
                        if (err) throw err;
                        console.log('Pomyslnie zmieniono pytanie');
                        resp.redirect('/admin/session/' + dataQuestion.sessionId + '/questions');
                    });
                });
            });

            break;
    }
    ;
};

exports.questionForm = function (req, resp, next) {

    var questionId = req.param('id');

    question.getById(questionId, function (err, question) {
        if (err) throw err; // TODO
        if (question) {
            answer.getAllByQuestionId(questionId, 0, -1, function (err, answers) {

                resp.render('admin/question', {
                    title: 'Edycja tresci pytania',
                    question: question,
                    sessionId: req.session.sessionId,
                    s_user: req.session.s_user,
                    answers: answers
                });
            });

        } else {
            resp.send(404); // if record doesn't exist
        }
    });
};


