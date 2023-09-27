const mongoose = require('mongoose');

//Define a schema
const Schema = mongoose.Schema;

const ISchema = new Schema({
    C: Schema.Types.Number,
    T: Schema.Types.Number,
    D: Schema.Types.String
});


module.exports = mongoose.model('Definition', ISchema);
