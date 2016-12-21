/**
 * Created by Fabian on 17.12.2016.
 */

var question = require('../../lib/question');
var results = require('../../lib/results');
var answers = require('../../lib/answer');
var flow = require('nimble');
var socket = require('socket.io');


exports.showResults = function (req, resp, next) {
    var questionId = req.param('id');

    answers.getAllByQuestionId(questionId, 0, -1, function (err, answers) {
        if (err) throw err;
        var allVotes = 0;
        var answersResult = [];
        var labels = [];
        var counter = [];
        var msg = "";
        flow.series([

            function (callback) {
                answers.forEach(function (answer, idx, answerArr) {

                    results.getByAnswerId(answer.id, function (err, count) {
                        if (count != null && answer != undefined) {
                            allVotes = allVotes + parseInt(count);
                            answer.count = parseInt(count);
                            answersResult.push(answer);
                        }
                        if (idx === answerArr.length - 1) {
                            callback();
                        }
                    });

                })
            }, function (callback) {

                answersResult.forEach(function (answer, idx, answerArr) {
                    msg += 'odp: ' + answer.text + ', wynik: ' + answer.count + '\n';
                    labels.push(answer.text);
                    counter.push(answer.count);
                    if (idx === answerArr.length - 1) {
                        callback();
                    }
                });

            }, function (callback) {
                resp.render('admin/results', {
                    title: 'Strona z wynikami',
                    msg:msg,
                    labels: labels,
                    counter: counter,
                    answers: answersResult

                });
                callback();
            }
        ])
        ;

    });


};
