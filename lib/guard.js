/**
 * Created by Fabian on 06.12.2016.
 */

exports.checkAdmin = function(req, resp, next){

    if(req.session.s_user.role != 'admin')
        resp.send(401);
    else
        next();
};

exports.checkUser = function (req, resp, next) {

    if(req.session.s_user.role != 'user')
        resp.send(401);
    else
        next();

};

exports.setSessions = function (req, resp, next) {
  if(!req.session.s_user || !req.session.s_user.role ){
      req.session.s_user = {
          role : ''
      };
  }
  next();
};