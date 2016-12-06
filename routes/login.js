/**
 * Created by Fabian on 03.12.2016.
 */

var User = require('../lib/user');

exports.form = function (req, resp, next) {
    // TODO check if user has not already been logged
    req.session.s_user = {};
    if (req.session.notAuth == null ||
            req.session.success == null) {

        req.session.success = true;
        req.session.notAuth = false;

    }

    console.log('pobieram notAuth' + req.session.notAuth);
    resp.render('login', {success: req.session.success,
                            errors: req.session.errors,
                                notAuth: req.session.notAuth,
                                    s_user: req.session.s_user});
};


exports.submit = function(req, resp, next){
    var data = req.body.user;
    req.checkBody('user.username', 'Username can not be empty').notEmpty();
    req.checkBody('user.password', 'Password can not be empty').notEmpty();

    var errors = req.validationErrors();

    if(errors){
        console.log(errors);
        req.session.success = false;
        req.session.errors = errors;
        resp.redirect('/login');
    }else {
        req.session.success = true;

        User.authenticate(data.username, data.password, function (err, user) {
            if (err) return next(err);
            if (user) {
                req.session.s_user = user;
                if(user.role == 'admin')
                    resp.redirect('/admin');
                else
                    resp.redirect('/');

            } else {
                req.session.errors = [];
                req.session.success = false;
                req.session.notAuth = true;

                resp.redirect('/login');
            }
        });
    }
};

exports.logout = function (req, resp, next) {
    req.session.destroy();
    resp.redirect('/');
};