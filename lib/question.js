/**
 * Created by Fabian on 05.12.2016.
 */
var redis = require('redis');
var db = redis.createClient();

module.exports = Question;

function Question(obj) {
    for(var item in obj)
        this[item] = obj[item];
}

Question.prototype.update = function (fn) {
    var question = this;
    var jsonQuestion = JSON.stringify(this);
    db.lpush('question:sessionid:' + question.sessionId, jsonQuestion, function (err) {
        if(err) return fn(err);
        db.set('question:id:' + question.id, jsonQuestion, function (err) {
            if(err) fn(err);
            if(question.active){
                // TODO inform all about new question (Socket.io)
            }
            fn(null,question.id);
        });
    });
};

Question.prototype.save = function (sessionId, fn) {
    var question = this;
    if(!question.id){
        db.incr('question:ids', function (err,ids) {
            if(err) return fn(err);
            question.id = ids;
            question.sessionId = sessionId;
            question.update(fn);
        });
    }else{
        question.sessionId = sessionId;
        this.update(fn);

    }
};

Question.prototype.remove = function (fn) {
    db.lrem('question:sessionid:' + this.sessionId,-1, JSON.stringify(this), function (err, count) {
        if(err) return fn(err);
        console.log('Pomyslnie usunieto ' + count + ' elementyyyyy'); // TODO LOG
        fn(null, count);
    } );
};

Question.getAllBySessionId = function (sessionId, from, to, fn) {
    var questions = [];
    db.lrange('question:sessionid:' + sessionId, from, to, function (err, items) {
        if(err) return fn(err);

        items.forEach(function (item) {
            questions.push(JSON.parse(item));
        });
        fn(null, questions);
    });

};

Question.getById = function (id, fn) {
  db.get('question:id:'+id, function (err, question) {
      if(err) fn(err);
      fn(null, new Question(JSON.parse(question)));
  })

};


// var question = {
//     text: 'Czy teraz indeks zadziala ?',
//     active: true
// };
// var q = new Question(question);
//
// q.save('7a4e0b23cc94', function (err) {
//     if(err) throw err;
//     console.log('pytanie dodane');
// });