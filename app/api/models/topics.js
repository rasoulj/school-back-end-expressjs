const mongoose = require('mongoose');

//Define a schema
const Schema = mongoose.Schema;

const ISchema = new Schema({
    // topic: {
    //     type: String,
    //     trim: true,
    //     required: true,
    // },
    // uid: Schema.Types.String,
}, {strict: false});

ISchema.set("timestamps", true);

module.exports = mongoose.model('Topics', ISchema);
