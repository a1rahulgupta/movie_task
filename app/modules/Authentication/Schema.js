
const Schema = require('mongoose').Schema;
const mongoose = require('mongoose');

const authtokensSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'Users' },
    token: { type: Buffer },
    tokenExpiryTime: { type: Date }
},
    { timestamps: true });

const Authtokens = mongoose.model('authtokens', authtokensSchema);

module.exports = {
    Authtokens: Authtokens,
}

