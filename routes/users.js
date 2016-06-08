var express = require('express');
var router = express.Router();
var mysql  = require('mysql');
var cn = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '408528867',
    database : 'SportAssistant'
});
var nodemailer = require("nodemailer");
var smtpTransport = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    auth: {
        user: 'goraziosportassistant@gmail.com',
        pass: 'sport408528867'
    }
});
var mailOptions;

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
                result: true,
                token: rows[0].token,
                message: 'Login success'
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
    var query;
    console.log('registering.. ' + req.body.email + ':' + req.body.password);
    if (req.body.email != '' && req.body.password != '') {

        query = 'SELECT email FROM Users where email="' + req.body.email + '"';
        cn.query(query, function (err, rows, fields) {
            if (!err && rows.length == 0) {
                query = 'INSERT INTO Users VALUES ("' + req.body.email + '","' + req.body.password + '","' + createToken() + '",false)';
                cn.query(query, function (err, rows, fields) {
                    if (!err) {
                        var link;
                        link = "http://localhost:8000/users/verify?id=" + createToken();
                        mailOptions = {
                            from: '"TheGorazio from SportAssistant" <goraziosportassistant@gmail.com>',
                            to: req.body.email,
                            subject: "Hello, Please confirm your Email account",
                            text: "Hello,<br> Please Click on the link to verify your email for using SportAssistant.<br><a href=" + link + ">Click here to verify</a>"
                        };
                        smtpTransport.sendMail(mailOptions, function (error, info) {
                            if (!error) {
                                console.log("Message sent: " + info.response);
                                res.status(200);
                                res.send(JSON.stringify({
                                    result: true,
                                    message: 'Check your email'
                                }));
                                res.end();

                            } else {
                                console.log(error);
                                res.status(400);
                                res.send(JSON.stringify({
                                    result: false,
                                    error: error
                                }));
                                res.end();
                            }
                        });
                    } else {
                        res.status(400);
                        res.send(JSON.stringify({
                            result: false,
                            error: 'Some problems with database - ' + err
                        }));
                        res.end();
                    }
                });
            } else {
                res.status(400);
                res.send(JSON.stringify({
                    result: false,
                    error: 'Email is already used'
                }));
                res.end();
            }
        });
    } else {
        res.status(400);
        res.send(JSON.stringify({
            result: false,
            error: 'Wrong email/password'
        }));
        res.end();
    }
});

router.get('/verify',function(req,res){
    console.log(req.protocol+":/"+req.get('host'));
    if((req.protocol+"://"+req.get('host'))==("http://"+host))
    {
        console.log("Domain is matched. Information is from Authentic email");
        if(req.query.id==rand)
        {
            console.log("email is verified");
            res.end("<h1>Email "+mailOptions.to+" is been Successfully verified");
        }
        else
        {
            console.log("email is not verified");
            res.end("<h1>Bad Request</h1>");
        }
    }
    else
    {
        res.end("<h1>Request is from unknown source");
    }
});

function createToken() {
    var len = 30,
        alphabet = 'qw1e2rt2y3uiop[]1\;lk5j44hg34fdsa67zxcvb7nm,.1234567890-=*+',
        rand,
        token = '';

    for (var i = 0; i < len; i++){
        rand = Math.floor(Math.random() * (alphabet.length));
        token += alphabet[rand];
    }
    return token;
}

function sendEmail(email) {
    var link, result = {
        state: false,
        message: ''
    };
    link = "http://localhost:8000/users/verify?id=" + createToken();
    mailOptions = {
        from: '"TheGorazio from SportAssistant" <goraziosportassistant@gmail.com>',
        to: email,
        subject: "Hello, Please confirm your Email account",
        text: 'Hello world',
        html: "Hello,<br> Please Click on the link to verify your email for using SportAssistant.<br><a href=" + link + ">Click here to verify</a>"
    };
    smtpTransport.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
            result.message = error;
        } else {
            console.log("Message sent: " + info.response);
            result.message = info.response;
            result.state = true;
        }
    });
    return result;
}
module.exports = router;
