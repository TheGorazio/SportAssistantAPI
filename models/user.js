/**
 * Created by TheGorazio on 15.06.2016.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var db = mongoose.createConnection('mongodb://localhost:27017/sport');

var User = new Schema({
    email: { type: String, required: true },
    password: { type: String, required: true },
    token: { type: String, required: true },
    verified: { type: Boolean, required: true }
});

db.close();

module.exports = mongoose.model('User', User);