/**
 * Created by Fabian on 05.12.2016.
 */

var redis = require('redis');
var db = redis.createClient();
var crypto = require('crypto');


module.exports = Session;

function Session(obj) {
    for (var key in obj) {
        this[key] = obj[key];
    }
}

Session.getAll = function (from, to, fn) {
    var sessions = [];
    db.lrange('sessions',from,to, function (err, items) {
        if(err) return fn(err);
        var sessions = [];
        items.forEach(function(item){
            sessions.push(JSON.parse(item));
        });

        fn(null, sessions);

    });

};

Session.getListSize = function (fn) {
    db.llen('sessions', function (err, count) {
        if(err) return fn(err);
        fn(null, count);
    })

};

Session.getByName = function(name, fn){
    db.get('session:name:' + name, function (err, id) {

        if(err) return fn(err);

        this.getById(id, fn);

    });

};

Session.getById = function(id, fn){
    db.hgetall('session:id:'+id, function (err, session) {

        if(err) return fn(err);

        fn(null, new Session(session));

    })
};
Session.prototype.remove = function (fn) {
    db.lrem('sessions',-1, JSON.stringify(this), function (err, count) {
        if(err) return fn(err);
        console.log('Pomyslnie usunieto ' + count + ' elementy');
        fn(null, count);
    } );
};

Session.prototype.save = function (fn) {
    if (this.id) {
        this.update(fn);
    } else {
        var session = this;
        session.id = generateId(); // TODO we should check if id is unique
        session.update(fn);
    }
};

Session.prototype.update = function (fn) {
    var session = this;
    var id = session.id;
    var sessionJson = JSON.stringify(this);
    db.set('session:name:' + session.name , session.id, function (err) {
        if(err) return fn(err);
        db.hmset('session:id:' + id, session, function (err) { // TODO check if needed
            if(err) return fn(err);
            db.lpush('sessions', sessionJson, function (err) {

                if(err) return fn(err);
                fn();
            })
        });
    });
};

function generateId() {
    return randomValueHex(12);

}


function randomValueHex(len) {
    return crypto.randomBytes(Math.ceil(len / 2))
        .toString('hex')
        .slice(0, len);
}

// var session = {
//     name: 'czwarta sesja',
//     active: false,
//     date: '04/12/2016'
// };
// var Sesja = new Session(session);
// Sesja.save(function (err) {
//     if(err) throw err;
//     console.log('dodano nowa sesje');
// });



