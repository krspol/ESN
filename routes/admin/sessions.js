var express = require('express');
var session = require('../../lib/session');
var question = require('../../lib/question');

exports.newSessionForm = function (req, resp, next) {
    resp.render('admin/session', {
        title: 'Nowa sesja - formularz',
        s_user: req.session.s_user
    });
};


exports.newSessionSubmit = function (req, resp, next) {
    var dataSession = req.body.session;


    new session({
        id: null,
        name: dataSession.name,
        date: dataSession.date,
        active: dataSession.active,
        kworum: dataSession.kworum
    }).save(function (err) {
        if (err) return err;
        console.log('Sesja pomyslnie dodana!');
        resp.redirect('/admin');// TODO redirect to session setting page
    });


};

exports.sessionSubmit = function (req, resp, next) {
    var dataSession = req.body.session;

    session.getById(dataSession.id, function (err, sess) {
        if(err) throw err;
        sess.remove(function (err, counter) {
            if(err) throw err;
            new session({
                id: dataSession.id,
                name: dataSession.name,
                date: dataSession.date,
                active: dataSession.active,
                kworum: dataSession.kworum
            }).update(function (err) {
                if (err) return err;

                console.log('Sesja pomyslnie edytowana!');
                resp.redirect('/admin/session/' + dataSession.id);
            });
        });
    });
};

exports.sessionForm = function (req, resp, next) {
    var user = req.session.s_user;
    if (!user)
        resp.send(401); // not logged

    var id = req.param('id');

    session.getById(id, function (err, session) {
        if (err) return err;
        req.session.sessionId = id;
        resp.render('admin/sessions', {
            title: session.name,
            session: session,
            s_user: req.session.s_user,
            sessionId: req.session.sessionId
        });
    });


};

exports.questionList = function (req, resp, next) {
    var user = req.session.s_user;
    if (!user)
        resp.send(401); // not logged

    var sessionId = req.param('id');

    question.getAllBySessionId(sessionId, 0, -1, function (err, questions) {
        if (err) throw err;
        if (true) { // TODO check if sessionId is corrent and exist in db
            console.log('ilosc pytan: ' + questions.length);
            resp.render('admin/questions', {
                title: 'Spis pytan dla sesji o id ' + sessionId,
                s_user: req.session.s_user,
                questions: questions,
                sessionId: req.session.sessionId
            });
        } else {
            resp.send(404); // if session doesn't exist
        }
    });

};

exports.sessionActivity = function (req, resp, next) {
    var sessionId = req.param('id');

    session.getById(sessionId, function (err, sess) {
        if(err) throw err;
        sess.remove(function (err) {
            if(err) throw err;
            console.log(sess);
            if(sess.active == 'true')
                sess.active = 'false';
            else
                sess.active = 'true';
            console.log(sess);
            sess.update(function (err) {
                if(err) throw err;
                resp.redirect('/admin');
            });

        });
    });


};



