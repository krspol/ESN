var express = require('express');
var sessions = require('../../lib/session');

exports.mainPage = function (req, resp, err) {
    var user = req.session.s_user;
    if(!user)
        resp.send(401); // not logged

    sessions.getAll(0,-1, function (err, items) {
        if(err) throw err;

        req.session.sessions = items;
        resp.render('admin/index', { title : 'Panel admina',
            notAuth :req.session.notAuth,
            s_user: req.session.s_user,
            sessions: req.session.sessions});
    });

};
