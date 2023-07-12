const mongoose = require('mongoose');
const schema = mongoose.Schema;
const _ = require("lodash");

let user = new schema({
    firstName: { type: String },
    lastName: { type: String },
    emailId: { type: String, unique: true },
    password: { type: Buffer },
    isDeleted: { type: Boolean, default: false }


}, {
    timestamps: true
});


let Users = mongoose.model('Users', user);
module.exports = {
    Users
}