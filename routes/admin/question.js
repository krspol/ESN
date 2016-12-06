/**
 * Created by Fabian on 05.12.2016.
 */
var question = require('../../lib/question');
var answer = require('../../lib/answer');
var url = require('url');


exports.newQuestionForm = function (req, resp, next) {
    var user = req.session.s_user;
    if(!user)
        resp.send(401); // not logged
    resp.render('admin/new-question', {
        title: 'Dodawanie pytan',
        s_user: req.session.s_user,
        sessionId: req.session.sessionId
    });

};

exports.newQuestionSubmit = function (req, resp, next) {
    var user = req.session.s_user;
    if(!user)
        resp.send(401); // not logged

    var dataQuestion = req.body.question;
    var dataAnswer = req.body.answer1;
    var dataAnswer2 = req.body.answer2;

    var sessionId = req.session.sessionId;
    var answerObj = new answer({
        text: dataAnswer.text
    });
    var answer2Obj = new answer({
        text: dataAnswer2.text
    });
    var questionObj = new question({
        text: dataQuestion.text,
        date: dataQuestion.date,
        sessionId: dataQuestion.sessionId,
        active: dataQuestion.active
    });
    questionObj.save(sessionId, function (err, questionId) {
        if(err) throw err;
        console.log('Pomyslnie dodano pytanie');

        answerObj.save(questionId, function (err) {
            if(err) throw err;
            console.log('Pomyslnie dodano odpowiedz1');

            answer2Obj.save(questionId, function (err) {
                if(err) throw err;
                console.log('Pomyslnie dodano odpowiedz2');
                resp.redirect('/admin/session/'+ sessionId +'/questions');
            });
        });


    });

};



exports.questionSubmit = function (req, resp, next) {
    var url1 = url.parse(req.url);
    var query = url1.query;
    var splittedQuery = query.split('=');
    var key = splittedQuery[0], value = splittedQuery[1];

    // TODO (?) maybe make only one form (?)
    switch(value){
        case 'answer':
            var dataAnswer = req.body.answer;
            answer.getById(dataAnswer.id, function (err, ans) {
                if(err) throw err;
               ans.remove(function (err) {
                   if(err) throw err;
                   new answer({
                       text: dataAnswer.text,
                       questionId: dataAnswer.questionId,
                       id: dataAnswer.id
                   }).update(function (err) {
                       if(err) return err;
                       console.log('Odpowiedz pomyslnie zmodyfikowana');
                       resp.redirect('/admin/question/'+dataAnswer.questionId);
                   });
               })
            });
            break;
        case 'question':
            var dataQuestion = req.body.question;
            question.getById(dataQuestion.id, function (err, quest) {
                if(err) throw err;
                quest.remove(function (err) {
                    if(err) throw err;
                    new question({
                        text: dataQuestion.text,
                        date: dataQuestion.date,
                        sessionId: dataQuestion.sessionId,
                        active: dataQuestion.active,
                        id: dataQuestion.id
                    }).update( function (err) {
                        if(err) throw err;
                        console.log('Pomyslnie zmieniono pytanie');
                        resp.redirect('/admin/session/' + dataQuestion.sessionId + '/questions');
                    });
                });
            });

            break;
    };
} ;

exports.questionForm = function (req, resp, next) {

    var questionId = req.param('id');

    question.getById(questionId, function (err, question) {
        if(err) throw err; // TODO
        if(question){
            answer.getAllByQuestionId(questionId, 0, 2, function (err, answers) { // TODO set range

                resp.render('admin/question', {
                    title: 'Edycja tresci pytania',
                    question: question,
                    sessionId: req.session.sessionId,
                    s_user: req.session.s_user,
                    answers: answers
                });
            });

        }else{
            resp.send(404); // if record doesn't exist
        }
    });
};


