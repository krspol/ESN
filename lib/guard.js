/**
 * Created by Fabian on 06.12.2016.
 */

exports.check = function(req, resp, next){

    console.log('sprawdzam sesjse' + req.session.s_user.role);
    if(req.session.s_user.role != 'admin')
        resp.send(401);
    else
        next();


};