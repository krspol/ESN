/**
 * Created by Fabian on 05.12.2016.
 */
var redis = require('redis');
var db = redis.createClient();


module.exports = Answer;


function Answer(obj) {
    for(var item in obj)
        this[item] = obj[item];
}

Answer.prototype.save = function (questionId, fn) { // TODO check if questionId is correct
    var answer = this;
    answer.questionId = questionId;
    if(answer.id){
        answer.update(fn);
    }else{
        db.incr('answer:ids', function (err, ids) {
            if(err) return fn(err); // TODO
            answer.id = ids;
            answer.update(fn);
        });
    }
};

Answer.prototype.remove = function (fn) {
    db.lrem('answer:questionid:' + this.questionId,-1, JSON.stringify(this), function (err, count) {
        if(err) return fn(err);
        console.log('Pomyslnie usunieto ' + count + ' elementy');
        fn();
    } );
};

Answer.prototype.update = function (fn) {
    var answer = this;
    var jsonAnswer = JSON.stringify(answer);
    db.lpush('answer:questionid:' + answer.questionId, jsonAnswer, function (err) {
        if(err) return fn(err); // TODO
        db.set('answer:id:' + answer.id, jsonAnswer, function (err) {
            if(err) return fn(err);
            fn();
       });
    });
};

Answer.getAllByQuestionId = function (questionId, from, to, fn) { // TODO check if questionId is correct and exists
    var answers = [];
    db.lrange('answer:questionid:' + questionId, from, to, function (err, answers) {
       if(err) return fn(err); // TODO
        answers.forEach(function (ans) {
            answers.push(JSON.parse(ans));
        });
        fn(null, answers);
    });
};
Answer.getById = function (id, fn) {
    db.get('answer:id:' + id, function (err, answer) {
       if(err) return fn(err);
        fn(null, new Answer(JSON.parse(answer)));
    });
};

// var ans = {
//   text: 'pepsi'
// };
// var answer = new Answer(ans);
// answer.save(11, function (err) {
//     if(err) return err;
//     console.log('odpowiedz dodana!');
// });