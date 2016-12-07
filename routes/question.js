/**
 * Created by Andrzej on 7/12/2016.
 */

var question = require('../lib/question');
var answer = require('../lib/answer');

exports.questionForm = function (req, resp, next) {

    var questionId = req.param('id');
    var sessionId = req.param('sessionId');
    question.getById(questionId, function (err, question) {
        if(err) throw err;
        if(question.active == 'false' ||
                sessionId != question.sessionId)
            resp.send(404);

        var resultAnswers = [];
        answer.getAllByQuestionId(questionId, 0, 2, function (err, answers) { // TODO set range
            if(err) throw err;
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
        });
    });
};

exports.questionSubmit = function (req, resp, next) {

    var answer = req.body.answer;
    resp.end('Wybrales ' + answer.text + ' o id = ' + answer.id);
    // TODO save result in db
};