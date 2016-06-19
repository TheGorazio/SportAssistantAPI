var express = require('express');
var router = express.Router();
var sg = require("sendgrid").SendGrid("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");
var helper = require('sendgrid').mail;
var mongoose = require('mongoose');
var host = 'localhost:8000';

var User = require('../models/user');
/*
  Вход в систему
  Метод - ПОСТ
 data: {
 email,
    password
  }
 */
router.post('/login', function(req, res, next) {

    mongoose.connect('mongodb://localhost:27017/sport');
    User.findOne({'email': req.body.email}, function(err, result) {
        console.log(result);
        if (!err && result.length == 1) {
            res.status(200);
            res.send(JSON.stringify({
                result: true,
                token: result.token,
                message: 'Login success'
            }));
            mongoose.disconnect();
            res.end();
        } else {
            res.status(400);
            res.send(JSON.stringify({
                result: false,
                error: 'Invalid email/password'
            }));
            mongoose.disconnect();
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
    console.log('registering.. ' + req.body.email + ':' + req.body.password);
    var token;
    if (req.body.email != '' && req.body.password != '') {

        mongoose.connect('mongodb://localhost:27017/sport');
        User.find({'email': req.body.email}, function(err, result) {
            if (!err && result.length == 0) {
                token = createToken();
                var user = new User({
                    email: req.body.email,
                    password: req.body.password,
                    token: token,
                    verified: false
                });
                user.save(function (err, result) {
                    if (!err) {
                        var link;
                        link = "http://localhost:8000/users/verify?id=" + token;

                        var from_email = new helper.Email("goraziosportassistant@gmail.com");
                        var to_email = new helper.Email(req.body.email);
                        var subject = "Hello, Please confirm your Email account";
                        var content = new helper.Content("text/html", "Hello,<br> Please Click on the link to verify your email for using SportAssistant.<br><a href=" + link + ">Click here to verify</a>");
                        var mail = new helper.Mail(from_email, subject, to_email, content);

                        var requestBody = mail.toJSON();
                        var request = sg.emptyRequest();

                        request.method = 'POST';
                        request.path = '/v3/mail/send';
                        request.body = requestBody;
                        sg.API(request, function (response) {
                            console.log(response.statusCode);
                            console.log(response.body);
                            console.log(response.headers);

                            if (response.statusCode === 202) {
                                res.status(200);
                                res.send(JSON.stringify({
                                    result: true,
                                    error: 'Check your email'
                                }));
                                mongoose.disconnect();
                                res.end();
                            } else {
                                res.status(400);
                                res.send(JSON.stringify({
                                    result: false,
                                    error: 'Some problems with database - ' + err
                                }));
                                mongoose.disconnect();
                                res.end();
                            }

                        });
                    } else {
                        res.status(400);
                        res.send(JSON.stringify({
                            result: false,
                            error: 'Some problems with database - ' + err
                        }));
                        mongoose.disconnect();
                        res.end();
                    }
                });
            } else {
                res.status(400);
                res.send(JSON.stringify({
                    result: false,
                    error: 'Email is already used'
                }));
                mongoose.disconnect();
                res.end();
            }
        });
    } else {
        res.status(400);
        res.send(JSON.stringify({
            result: false,
            error: 'Wrong email/password'
        }));
        mongoose.disconnect();
        res.end();
    }
});

router.get('/verify',function(req,res){
    console.log(req.protocol+":/"+req.get('host'));

    mongoose.connect('mongodb://localhost:27017/sport');
    if((req.protocol+"://"+req.get('host'))==("http://"+host)) {
        console.log("Domain is matched. Information is from Authentic email - - " + req.query.id);
        User.findOne({'token': req.query.id}, function(err, result) {
            if(!err && result) {
                console.log("email is verified -- " + JSON.stringify(result));
                res.status(200);
                res.write("<h1>Email "+ result.email + " is been Successfully verified");
                res.end();

                result.verified = true;
                result.save(function(err, result){
                    mongoose.disconnect();
                });
            } else {
                console.log("email is not verified");
                res.write("<h1>Bad Request</h1>");
                res.end();
                mongoose.disconnect();
            }
        });
    } else {
        res.write("<h1>Request is from unknown source");
        res.end();
        mongoose.disconnect();
    }
});

function createToken() {
    var len = 30,
        alphabet = 'qw1e2rt2y3uiop1lk5j44hg34fdsa67zxcvb7nm234567890',
        rand,
        token = '';

    for (var i = 0; i < len; i++){
        rand = Math.floor(Math.random() * (alphabet.length));
        token += alphabet[rand];
    }
    return token;
}
module.exports = router;
