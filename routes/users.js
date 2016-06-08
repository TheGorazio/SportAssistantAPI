var express = require('express');
var router = express.Router();
var mysql  = require('mysql');
var cn = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '408528867',
    database : 'SportAssistant'
});
/*
  Вход в систему
  Метод - ПОСТ
  data: {
    email,
    password
  }
 */
router.post('/login', function(req, res, next) {

    var query = 'SELECT email FROM users WHERE email="' + req.body.email + '" and password="' + req.body.password + '"';
    cn.query(query, function(err, rows, fields) {
        if (!err && rows.length == 1) {
            res.status(200);
            res.send(JSON.stringify({
                result: true
            }));
            res.end();
        } else {
            res.status(400);
            res.send(JSON.stringify({
                result: false,
                error: 'Invalid email/password'
            }));
            res.end();
        }
    });
});

/*
 Регистрация в системе
 Метод - ПОСТ
 data: {
    email,
    password
 }
 Отправка письма для авторизации
 */

router.post('/register', function(req, res, next) {

});
module.exports = router;
