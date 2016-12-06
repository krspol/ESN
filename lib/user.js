/**
 * Created by Fabian on 03.12.2016.
 */

var redis = require('redis');
var bcrypt = require('bcryptjs');

var db = redis.createClient();
module.exports = User;

function User(obj) {
    for (var item in obj)
        this[item] = obj[item];
}

User.prototype.hashPassword = function (fn) {
    var user = this;
    bcrypt.genSalt(12, function (err, sal) {
        if(err) fn(err);
        user.sal = sal;
        bcrypt.hash(user.password, sal, function (err, hash) {
            user.password = hash;
            fn();
        });
    });
};

User.prototype.save = function (fn) {

    if(this.id){
        this.update(fn);
    }else{
        var user = this;

        db.incr('user:ids', function (err,id) {
            if(err) return fn(err);
            user.id = id;
            user.hashPassword(function (err) {
                if(err) return fn(err);
                user.update(fn);
            });
        });
    }
};

User.prototype.update = function (fn) {
    var user = this;
    var id = user.id;
    db.set('user:id:' + user.username , id, function (err) {
        // TODO LOG
        if(err) return fn(er);
        db.hmset('user:' + user.id, user, function (err) {
            if(err) return fn(err);
            // TODO LOG
        });
    });
};

User.getByName = function (name, fn) {
    User.getId(name, function (err, id) {
        if(err) return fn(err);
        User.get(id, fn);
    })
};

User.getId = function (name, fn) {
    db.get('user:id:' + name, fn);
    // TODO LOG
};

User.get = function (id,fn) {
   db.hgetall('user:'+id, function (err, user) {
       if(err) return fn(err);
       fn(null, new User(user));
   });
};

User.authenticate = function (name, password, fn) {
    User.getByName(name, function (err, user) {
        if (err) return fn(err);
        if (!user.id) return fn();
        bcrypt.hash(password, user.sal, function (err, hash) {
            if(err) return fn(err);
            if(hash == user.password) return fn(null, user);
            fn();
        });
    });
};


// var obj = {
//     username: 'user',
//     password: 'kz',
//     role: 'user'
// };
// var fabian = new User(obj);
// fabian.save(function (err) {
//     if(err) throw err;
//     console.log('user id %d' + fabian.id);
// });