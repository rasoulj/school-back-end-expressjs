const mongoose = require('mongoose');

//Define a schema
const Schema = mongoose.Schema;

const ISchema = new Schema({
    wid: {
        type: String,
        trim: true,
        required: true,
        unique: true
    }
}, {strict: false});

ISchema.set("timestamps", true);

module.exports = mongoose.model('Wallets', ISchema);
