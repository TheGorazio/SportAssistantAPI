/**
 * Created by TheGorazio on 17.06.2016.
 */
var User = require('../models/user');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/sport');

var users = [
    new User({
        email: 'thegorazio@gmail.com',
        password: '408528867',
        token: '123',
        verified: false
    }),
    new User({
        email: 'acetil@gmail.com',
        password: '408528867',
        token: '123',
        verified: false
    }),
    new User({
        email: 'admin@gmail.com',
        password: '408528867',
        token: '123',
        verified: false
    }),
];
var step = 0;
for(var i = 0; i < users.length; i++) {
    users[i].save(function() {
        step++;
        if (step == users.length) {
            mongoose.disconnect();
        }
    });
}