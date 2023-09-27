const mongoose = require('mongoose');
const bcrypt = require("bcrypt");

//Define a schema
const Schema = mongoose.Schema;

const ISchema = new Schema({
    text: {
        type: String,
        trim: true,
        required: false
    },
    length: Schema.Types.Number,
    simple: Schema.Types.Number,
    report: Schema.Types.Number,
});

// ISchema.pre('save', async function (next) {
//     this.length = (this.text || "").length;
//     // this.wid =  createWid(await nextCount("wid"));
//     next();
// });

module.exports = mongoose.model('Word', ISchema);
